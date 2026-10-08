'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {sampleCinematicPose} from './vendor/cinematic-plan.mjs';
import {createCinematicMaterial} from './materials/cinematic-material';
import {sampleOpticalScore} from './optical-score.mjs';
import {createSceneCompositor} from './scene-compositor.mjs';
import {sampleSceneDirection, resolveSceneStage} from './scene-direction.mjs';
import {sampleElementPose, SOURCE_LAYER_REVISION} from './element-score.mjs';
import {createExhibitionStage} from './exhibition-stage.mjs';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function disposeObject(object) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  object?.traverse(node => {if (node.geometry) geometries.add(node.geometry); if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => {materials.add(material); Object.values(material).forEach(value => {if (value?.isTexture) textures.add(value);});});});
  geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
}
function liveBounds(meta, elements) {
  return {
    min: [0, 1, 2].map(i => Math.min(...meta.layers.map(layer => layer.bounds.min[i] + elements.offsets[layer.id][i]))),
    max: [0, 1, 2].map(i => Math.max(...meta.layers.map(layer => layer.bounds.max[i] + elements.offsets[layer.id][i]))),
  };
}

function World({input, stage, onReady, onFailure}) {
  const {gl, camera, scene, invalidate, size} = useThree();
  const root = useMemo(() => new T.Group(), []), data = useRef(null), frames = useRef(0), last = useRef(null), overrides = useRef({});
  useEffect(() => input.subscribe(() => {if (!input.get().hidden) invalidate();}), [input, invalidate]);
  useEffect(() => {
    let cancelled = false, cleanup = () => {};
    const abort = new AbortController();
    const lose = event => {event.preventDefault(); onFailure();}; gl.domElement.addEventListener('webglcontextlost', lose);
    const load = Promise.allSettled([
      new GLTFLoader().loadAsync('/assets/source-layers.glb'),
      new HDRLoader().loadAsync('/assets/studio-small.hdr'),
      fetch('/assets/source-layers.json', {signal: abort.signal}).then(response => {if (!response.ok) throw Error('Source-layer metadata unavailable'); return response.json();}),
    ]);
    load.then(results => {
      const gltf = results[0].status === 'fulfilled' ? results[0].value : null;
      const hdr = results[1].status === 'fulfilled' ? results[1].value : null;
      if (cancelled || results.some(result => result.status === 'rejected')) {
        disposeObject(gltf?.scene); hdr?.dispose(); if (!cancelled) onFailure(); return;
      }
      const meta = results[2].value, rig = new T.Group(), previousEnvironment = scene.environment, previousFog = scene.fog;
      let environment = null, compositor = null, exhibition = null, disposed = false;
      const lights = {}, adapters = [], layers = [];
      cleanup = () => {
        if (disposed) return; disposed = true;
        root.remove(gltf.scene, rig); disposeObject(gltf.scene); disposeObject(rig);
        if (exhibition) {root.remove(exhibition.group); exhibition.dispose();}
        Object.values(lights).forEach(light => light.dispose?.());
        adapters.forEach(adapter => adapter.dispose()); compositor?.dispose();
        if (scene.environment === environment?.texture) scene.environment = previousEnvironment;
        scene.fog = previousFog; environment?.dispose(); hdr.dispose(); data.current = null;
      };
      try {
        if (meta.revision !== SOURCE_LAYER_REVISION || meta.viewerUnits !== 'meters' || meta.upAxis !== 'Y' || meta.layers.length !== 3) throw Error('Unexpected source-layer revision or coordinate system.');
        const generator = new T.PMREMGenerator(gl);
        try {environment = generator.fromEquirectangular(hdr);} finally {generator.dispose(); hdr.dispose();}
        gltf.scene.traverse(node => {
          if (!node.isMesh) return;
          const id = node.userData.role, record = meta.layers.find(layer => layer.id === id);
          if (!record || layers.some(layer => layer.id === id)) throw Error('Unexpected source layer.');
          const actualTriangles = (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3;
          if (actualTriangles !== record.triangles || node.geometry.attributes.position.count !== record.vertices) throw Error('Source geometry counts do not match the inspected record.');
          (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
          if (id === 'shell') {const adapter = createCinematicMaterial({bounds: meta.bounds}); adapters.push(adapter); node.material = adapter.material;}
          else node.material = new T.MeshStandardMaterial({color: '#535b5b', roughness: .7, metalness: .12, side: T.DoubleSide});
          node.castShadow = true; node.receiveShadow = true;
          layers.push({id, node, record, rest: node.position.clone(), baseColor: id === 'shell' ? null : node.material.color.clone()});
        });
        if (layers.length !== 3 || !['shell', 'base-lower', 'base-upper'].every(id => layers.some(layer => layer.id === id))) throw Error('Missing source shell or base layer.');
        for (const id of ['key', 'fill', 'rim']) {
          const light = new T.DirectionalLight(); lights[id] = light; rig.add(light, light.target);
        }
        lights.hemisphere = new T.HemisphereLight(); rig.add(lights.hemisphere);
        lights.key.castShadow = true; lights.key.shadow.mapSize.set(1024, 1024);
        const groundMaterial = new T.MeshStandardMaterial({color: '#172024', roughness: .92, metalness: .02, transparent: true, opacity: .3, depthWrite: true});
        const ground = new T.Mesh(new T.PlaneGeometry(1, 1), groundMaterial); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.name = 'editorial-ground-not-source-base'; rig.add(ground);
        scene.environment = environment.texture; scene.fog = new T.FogExp2('#091217', .03);
        compositor = createSceneCompositor(gl); exhibition = createExhibitionStage({bounds:meta.bounds}); root.add(gltf.scene, rig, exhibition.group);
        data.current = {meta, sourceRoot:gltf.scene, exhibition, layers, lights, ground, adapters, compositor, ready: false, failed: false, captions: [...document.querySelectorAll('[data-layer-caption]')], caption: null};
        invalidate();
      } catch (error) {cleanup(); if (!cancelled) {console.error('Local source scene unavailable:', error.message); onFailure();}}
    }).catch(error => {cleanup(); if (!cancelled) {console.error('Local scene initialization failed:', error.message); onFailure();}});
    const diagnostics = {
      inspect: () => {
        const d = data.current;
        return {ready: !!d?.ready, frames: frames.current, ...input.get(), ...last.current,
          source: d ? {revision: d.meta.revision, vertices: d.meta.vertices, triangles: d.meta.triangles, sourceObjects: d.meta.layers.reduce((sum, layer) => sum + layer.sourceObjects.length, 0)} : null,
          layers: d?.layers.map(layer => ({id: layer.id, position: layer.node.position.toArray(), restPosition: layer.rest.toArray(), visible: layer.node.visible, triangles: layer.record.triangles})),
          material: d?.adapters[0]?.inspect(), compositor: d?.compositor.inspect(), sourceVisible:d?.sourceRoot.visible,
          renderer: {calls: gl.info.render.calls, triangles: gl.info.render.triangles, programs: gl.info.programs?.length ?? 0, shadowEnabled: gl.shadowMap.enabled, dpr: gl.getPixelRatio()}, memory: {...gl.info.memory}};
      },
      setOverrides: (values = {}) => {overrides.current = {...values}; if (!input.get().hidden) invalidate();},
      loseContext: () => gl.getContext().getExtension('WEBGL_lose_context')?.loseContext(),
    };
    window.__thesis = diagnostics;
    return () => {cancelled = true; abort.abort(); gl.domElement.removeEventListener('webglcontextlost', lose); cleanup(); if (window.__thesis === diagnostics) delete window.__thesis;};
  }, [gl, input, invalidate, onFailure, root, scene]);

  useFrame(() => {
    const d = data.current, state = input.get(); if (!d || d.failed || state.hidden) return;
    try {
      const debug = overrides.current, stageU = Number.isFinite(debug.stageU) ? clamp(debug.stageU, 0, 1) : state.stageU ?? state.u;
      const visualU = Number.isFinite(debug.visualU) ? clamp(debug.visualU, 0, 1) : state.visualU ?? state.u;
      const reduced = state.reduced, detail = state.detail === 'light' ? 'light' : 'full';
      const elements = sampleElementPose(stageU, {reducedMotion: reduced});
      // The single transform writer always applies a source-relative offset to rest.
      d.layers.forEach(layer => {const offset = elements.offsets[layer.id]; layer.node.position.set(layer.rest.x + offset[0], layer.rest.y + offset[1], layer.rest.z + offset[2]);});
      const bounds = liveBounds(d.meta, elements), direction = sampleSceneDirection(stageU, {reducedMotion: reduced}), stageLayout = resolveSceneStage(bounds, direction);
      const pointer = Number.isFinite(debug.stageU) ? {x: 0, y: 0} : state.pointer;
      const pose = sampleCinematicPose(stageU, size.width / size.height, pointer, {bounds, modelRevision: d.meta.revision, reducedMotion: reduced, sharedStage: true});
      const optics = sampleOpticalScore({stageU, visualU, energy: state.energy, dwellWeight: state.dwellWeight, aspect: size.width / size.height, reducedMotion: reduced}, pose, {bounds});
      if (Number.isFinite(debug.focalLengthMm)) optics.focalLengthMm = clamp(debug.focalLengthMm, 10, 160);
      const opticalOverrides = {...(debug.optical ?? {})};
      if (detail === 'light' || reduced) Object.assign(opticalOverrides, {apertureScale: 0, maxBlurPx: 0, asciiWeight: 0, veil: 0, mistStrength:0});
      optics.overrides = opticalOverrides;
      // One final camera write: the lens changes FOV, with no later competing FOV write.
      camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.aspect = size.width / size.height; camera.zoom = 1;
      camera.near = pose.near; camera.far = pose.far; camera.filmGauge = optics.filmGaugeMm; camera.setFocalLength(optics.focalLengthMm);
      camera.setViewOffset(size.width, size.height, size.width * pose.viewOffsetNormalized.x, size.height * pose.viewOffsetNormalized.y, size.width, size.height);
      camera.lookAt(...pose.target); camera.updateProjectionMatrix();
      d.sourceRoot.visible = reduced || (pose.sourcePresence ?? 1) > 0;
      const exhibitionState = d.exhibition.update({direction,camera,quality:detail,reducedMotion:reduced,lightSweep:state.editorial?.lightSweep ?? 0});
      const keyScale = Number.isFinite(debug.keyIntensityScale) ? clamp(debug.keyIntensityScale, 0, 5) : 1;
      for (const id of ['key', 'fill', 'rim']) {
        const light = d.lights[id], spec = direction[id];
        light.position.fromArray(spec.position.map((value, i) => value + stageLayout.center[i]));
        light.target.position.fromArray(stageLayout.lightTarget); light.color.fromArray(spec.color); light.intensity = spec.intensity * (id === 'key' ? keyScale : 1);
      }
      d.lights.hemisphere.color.fromArray(direction.hemisphere.sky); d.lights.hemisphere.groundColor.fromArray(direction.hemisphere.ground); d.lights.hemisphere.intensity = direction.hemisphere.intensity;
      const shadow = d.lights.key.shadow, extent = stageLayout.shadowHalfExtent;
      shadow.camera.left = shadow.camera.bottom = -extent; shadow.camera.right = shadow.camera.top = extent;
      shadow.camera.near = .05; shadow.camera.far = Math.max(20, stageLayout.radius * 10); shadow.camera.updateProjectionMatrix();
      shadow.bias = direction.stage.shadow.bias; shadow.normalBias = direction.stage.shadow.normalBias;
      gl.shadowMap.enabled = detail === 'full'; d.lights.key.castShadow = detail === 'full'; gl.shadowMap.needsUpdate = detail === 'full';
      scene.environmentIntensity = direction.environmentIntensity; scene.fog.color.fromArray(direction.haze.color); scene.fog.density = direction.haze.density;
      d.ground.position.fromArray(stageLayout.groundPosition); d.ground.scale.set(...stageLayout.groundSize, 1); d.ground.material.color.fromArray(direction.groundColor); d.ground.material.opacity = direction.groundOpacity;
      d.ground.visible = !direction.stage.exhibitionOwnsFloor;
      d.layers.forEach(layer => {if (layer.baseColor) layer.node.material.color.copy(layer.baseColor).multiplyScalar(.6 + direction.stage.baseEmphasis * .4);});
      d.adapters.forEach(adapter => adapter.update({progress: visualU, emphasis: pose.surfaceEmphasis, finish:debug.material?.finish ?? 'satin'}));
      if (elements.caption !== d.caption) {d.caption = elements.caption; d.captions.forEach(element => {element.textContent = elements.caption;});}
      const dpr = detail === 'light' ? 1 : Math.min(devicePixelRatio || 1, 1.25); if (gl.getPixelRatio() !== dpr) gl.setPixelRatio(dpr);
      gl.info.reset();
      d.compositor.render(scene, camera, optics, {width: size.width, height: size.height, dpr, samples: detail === 'full' && debug.samples !== 0 ? 2 : 0, protectedRects: debug.protectedRects ?? state.protectedRects ?? []});
      if (stage.current) stage.current.style.opacity = String(reduced ? .35 : 1);
      last.current = {pose: {...pose, fov: camera.fov, focalLengthMm: optics.focalLengthMm}, optics, lights: direction, elements, bounds, detail, stageLayout, exhibition:exhibitionState, keyIntensity: d.lights.key.intensity};
      frames.current++;
      if (!d.ready) {d.ready = true; queueMicrotask(onReady);}
    } catch (error) {d.failed = true; console.error('Local scene rendering failed:', error.message); queueMicrotask(onFailure);}
  }, 1);
  return <primitive object={root} dispose={null} />;
}
export default function CinematicScene(props) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {let probe; try {probe = document.createElement('canvas').getContext('webgl2'); if (!probe) {props.onFailure(); return;} probe.getExtension('WEBGL_lose_context')?.loseContext(); setSupported(true);} catch {props.onFailure();}}, [props.onFailure]);
  return supported ? <Canvas frameloop="demand" dpr={[1, 1.25]} camera={{position: [4, 3, 6], fov: 38}} gl={{antialias: false, alpha: true, powerPreference: 'default'}} onCreated={({gl}) => {gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = T.SRGBColorSpace; gl.setClearColor(0x090d0d, 0); gl.shadowMap.type = T.PCFShadowMap; gl.info.autoReset = false;}}><World {...props} /></Canvas> : null;
}
