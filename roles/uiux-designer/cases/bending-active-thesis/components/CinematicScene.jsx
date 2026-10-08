'use client';
/* eslint-disable react-hooks/immutability -- Three resources have one imperative
 * World frame owner; these are not React state or render-time mutations. */
import {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {createCinematicMaterial} from './materials/cinematic-material';
import {sampleOpticalScore, focalLengthForFov} from './optical-score.mjs';
import {createSceneCompositor} from './scene-compositor.mjs';
import {resolveSceneStage} from './scene-direction.mjs';
import {sampleElementPose, sampleSourceSeparation, SOURCE_LAYER_REVISION} from './element-score.mjs';
import {createExhibitionStage} from './exhibition-stage.mjs';
import {INSPECTION_FRAMING_SUPPORT} from './inspection-framing-support.mjs';
import {sampleContinuousLighting} from './inspection-lighting.mjs';
import {sampleChapterScene, applyChapterLighting} from './chapter-scene-score.mjs';
import {SOURCE_DIAGRAM_REVISION, prepareSourceFamilies, resolveSourceSelection, sampleSourceScenePose} from './source-scene-score.mjs';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
async function loadSourceDiagrams(signal) {
  const response = await fetch('/assets/thesis/source-diagrams.glb', {signal});
  if (!response.ok) throw Error('Source diagrams unavailable');
  const buffer = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)), value => value.toString(16).padStart(2, '0')).join('');
  if (digest !== SOURCE_DIAGRAM_REVISION) throw Error('Source diagram bytes differ from the approved derivative');
  return new GLTFLoader().parseAsync(buffer, '');
}
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

// A representation may change every chapter beat. Reserve the wrapped height
// of every approved description once, without letting those changes move the
// native document or its reading stops. Only the current span is spoken.
function prepareLayerCaptions(descriptions) {
  const slots=[...document.querySelectorAll('[data-layer-caption]')].map(element=>{
    const current=document.createElement('span');
    current.dataset.layerCaptionCurrent='';current.textContent=element.textContent;
    const variants=[...new Set([current.textContent,...descriptions])];
    const sizing=variants.map(description=>{
      const span=document.createElement('span');span.dataset.layerCaptionSizer='';
      span.setAttribute('aria-hidden','true');span.textContent=description;return span;
    });
    element.replaceChildren(current,...sizing);element.dataset.layerCaptionSized='';
    return {element,current};
  });
  return {
    captions:slots.map(slot=>slot.current),
    dispose(){slots.forEach(({element,current})=>{
      // Failure may already have replaced the outer paragraph with its static
      // message. Preserve that message; otherwise unwrap our latest caption.
      if(current.parentNode===element)element.replaceChildren(document.createTextNode(current.textContent));
      element.removeAttribute('data-layer-caption-sized');
    });},
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
      loadSourceDiagrams(abort.signal),
      fetch('/assets/thesis/source-diagrams.json', {signal:abort.signal}).then(response => {if (!response.ok) throw Error('Source-diagram metadata unavailable'); return response.json();}),
    ]);
    load.then(results => {
      const gltf = results[0].status === 'fulfilled' ? results[0].value : null;
      const hdr = results[1].status === 'fulfilled' ? results[1].value : null;
      const diagrams = results[3].status === 'fulfilled' ? results[3].value : null;
      if (cancelled || results.some(result => result.status === 'rejected')) {
        disposeObject(gltf?.scene); disposeObject(diagrams?.scene); hdr?.dispose(); if (!cancelled) onFailure(); return;
      }
      const meta = results[2].value, rig = new T.Group(), previousEnvironment = scene.environment, previousFog = scene.fog, previousBackground = scene.background;
      let environment = null, compositor = null, exhibition = null, captionSlots = null, disposed = false;
      const lights = {}, adapters = [], layers = [], diagramNodes = new Map();
      cleanup = () => {
        if (disposed) return; disposed = true;
        root.remove(gltf.scene, diagrams.scene, rig); disposeObject(gltf.scene); disposeObject(diagrams.scene); disposeObject(rig);
        if (exhibition) {root.remove(exhibition.group); exhibition.dispose();}
        Object.values(lights).forEach(light => light.dispose?.());
        adapters.forEach(adapter => adapter.dispose()); compositor?.dispose();
        captionSlots?.dispose();
        if (scene.environment === environment?.texture) scene.environment = previousEnvironment;
        scene.fog = previousFog; scene.background = previousBackground; environment?.dispose(); hdr.dispose(); data.current = null;
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
        const diagramMeta = results[4].value;
        const maxBounds=liveBounds(meta,sampleSourceSeparation(1));
        const inspectionBounds={min:meta.bounds.min.map((v,i)=>Math.min(v,maxBounds.min[i])),max:meta.bounds.max.map((v,i)=>Math.max(v,maxBounds.max[i]))};
        const families=prepareSourceFamilies(diagramMeta,{bounds:inspectionBounds,points:INSPECTION_FRAMING_SUPPORT.points,revision:meta.revision});
        diagrams.scene.traverse(node => {
          if (!node.isMesh && !node.isLineSegments) return;
          const id=node.userData.representationId, record=diagramMeta.representations.find(value=>value.id===id);
          if (!record) throw Error('Unknown source diagram node');
          const entry=diagramNodes.get(id) ?? {record,nodes:[],mesh:null};
          (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>material.dispose());
          if (node.isLineSegments) {
            if (!node.userData.sourceEdgeOverlay || (node.geometry.index?.count ?? node.geometry.attributes.position.count)/2!==record.sourceEdgeSegments) throw Error('Unexpected original polygon-edge record');
            node.material=new T.LineBasicMaterial({color:'#e98943',transparent:true,opacity:.7,depthWrite:false});
          } else {
            if (!node.userData.sourceGeometry || entry.mesh || node.geometry.attributes.position.count!==record.vertices || (node.geometry.index?.count ?? record.vertices)/3!==record.triangles) throw Error('Source diagram counts differ from inspected record');
            if (id==='curvature') {
              if (node.geometry.attributes.color?.count!==record.vertexColors) throw Error('Authored curvature colors are missing');
              node.material=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,side:T.DoubleSide});
            } else if (id==='origami' || id==='opening') {
              node.material=new T.MeshStandardMaterial({color:id==='origami'?'#b5bdba':'#abb8be',roughness:.72,metalness:.32,side:T.DoubleSide,polygonOffset:id==='origami',polygonOffsetFactor:1,polygonOffsetUnits:1});
            } else {
              const adapter=createCinematicMaterial({bounds:record.bounds});adapters.push(adapter);node.material=adapter.material;
            }
            node.castShadow=true;node.receiveShadow=true;entry.mesh=node;
          }
          node.visible=false;entry.nodes.push(node);diagramNodes.set(id,entry);
        });
        if (diagramNodes.size!==7 || [...diagramNodes.values()].some(entry=>!entry.mesh)) throw Error('Missing source representation mesh');
        for (const id of ['key', 'fill', 'rim']) {
          const light = new T.DirectionalLight(); lights[id] = light; rig.add(light, light.target);
        }
        lights.hemisphere = new T.HemisphereLight(); rig.add(lights.hemisphere);
        lights.key.castShadow = true; lights.key.shadow.mapSize.set(1024, 1024);
        const groundMaterial = new T.MeshStandardMaterial({color: '#172024', roughness: .92, metalness: .02, transparent: true, opacity: .3, depthWrite: true});
        const ground = new T.Mesh(new T.PlaneGeometry(1, 1), groundMaterial); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.name = 'editorial-ground-not-source-base'; rig.add(ground);
        scene.environment = environment.texture; scene.fog = new T.FogExp2('#091217', .03);
        compositor = createSceneCompositor(gl); exhibition = createExhibitionStage({bounds:meta.bounds}); root.add(gltf.scene, diagrams.scene, rig, exhibition.group);
        captionSlots=prepareLayerCaptions([...diagramMeta.representations.map(record=>record.description),sampleSourceSeparation(0).caption,sampleSourceSeparation(1).caption]);
        data.current = {meta,diagramMeta,diagramRoot:diagrams.scene,diagramNodes,families,inspectionBounds,previousBackground,studyBackground:new T.Color(),sourceRoot:gltf.scene,exhibition,layers,lights,ground,adapters,compositor,ready:false,failed:false,captions:captionSlots.captions,caption:null,visibleSource:[],presentationKey:null};
        invalidate();
      } catch (error) {cleanup(); if (!cancelled) {console.error('Local source scene unavailable:', error.message); onFailure();}}
    }).catch(error => {cleanup(); if (!cancelled) {console.error('Local scene initialization failed:', error.message); onFailure();}});
    const diagnostics = {
      inspect: () => {
        const d = data.current;
        return {ready: !!d?.ready, frames: frames.current, ...input.get(), ...last.current,
          source: d ? {revision: d.meta.revision, vertices: d.meta.vertices, triangles: d.meta.triangles, sourceObjects: d.meta.layers.reduce((sum, layer) => sum + layer.sourceObjects.length, 0)} : null,
          layers: d?.layers.map(layer => ({id: layer.id, position: layer.node.position.toArray(), restPosition: layer.rest.toArray(), visible: layer.node.visible, triangles: layer.record.triangles})),
          material: d?.adapters[0]?.inspect(), compositor: d?.compositor.inspect(), sourceVisible:(d?.visibleSource.length ?? 0)>0,
          diagramSource:d?{revision:d.diagramMeta.revision,bytes:d.diagramMeta.bytes,representations:d.diagramMeta.representations.map(record=>({id:record.id,vertices:record.vertices,triangles:record.triangles,vertexColors:record.vertexColors}))}:null,
          renderer: {calls: gl.info.render.calls, triangles: gl.info.render.triangles, programs: gl.info.programs?.length ?? 0, shadowEnabled: gl.shadowMap.enabled, dpr: gl.getPixelRatio()}, memory: {...gl.info.memory}};
      },
      setOverrides: (values = {}) => {overrides.current = {...values}; if (!input.get().hidden) invalidate();},
      hitTest: (clientX,clientY) => {
        const d=data.current,r=last.current?.representation;
        if (!d?.ready || !r || !['form','system','pattern'].includes(r.chapterId) || !Number.isFinite(clientX+clientY)) return null;
        const rect=gl.domElement.getBoundingClientRect(),x=(clientX-rect.left)/rect.width,y=(clientY-rect.top)/rect.height;
        if (x<0||x>1||y<0||y>1) return null;
        const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x*2-1,1-y*2),camera);
        return ray.intersectObjects(d.visibleSource,false).length ? {source:true,representationId:r.id,chapterId:r.chapterId,index:r.index} : null;
      },
      loseContext: () => gl.getContext().getExtension('WEBGL_lose_context')?.loseContext(),
    };
    window.__thesis = diagnostics;
    return () => {cancelled = true; abort.abort(); gl.domElement.removeEventListener('webglcontextlost', lose); cleanup(); if (window.__thesis === diagnostics) delete window.__thesis;};
  }, [camera, gl, input, invalidate, onFailure, root, scene]);

  useFrame(() => {
    const d = data.current, state = input.get(); if (!d || d.failed || state.hidden) return;
    try {
      const debug = overrides.current, aspect=size.width/size.height;
      // Explicit Pause freezes the shared chapter phase. Only the OS preference
      // requests the reduced optical policy; pausing must not change the shot.
      const reduced = state.systemReduced === true, detail = state.detail === 'light' ? 'light' : 'full';
      const fallbackIndex=Math.min(6,Math.floor(clamp(state.stageU??state.u??0,0,1)*7));
      let playback=debug.playback ?? state.playback ?? {chapterWeights:Array.from({length:7},(_,i)=>Number(i===fallbackIndex)),phases:Array(7).fill(.32),activeSeconds:0};
      if(Number.isFinite(debug.stageU)) {const index=Math.min(6,Math.floor(clamp(debug.stageU,0,1)*7));playback={...playback,chapterWeights:Array.from({length:7},(_,i)=>Number(i===index))};}
      const chapterScene=debug.chapterScene ?? ((!debug.playback && !Number.isFinite(debug.stageU)) ? state.chapterScene : null) ?? sampleChapterScene(playback,{reducedMotion:state.systemReduced??reduced,quality:detail,aspect,pointer:state.pointer});
      const selected=resolveSourceSelection(playback,debug.sourceSelection ?? state.sourceSelection,chapterScene);
      const viewports=debug.modelViewports ?? state.modelViewports;
      const slot=viewports?.[selected.chapterId] ?? {viewport:state.inspectionViewport,weight:selected.chapterId==='form'?(state.inspectionWeight??0):0};
      const studyWeight=clamp(slot.weight??0,0,1), family=d.families[selected.family];
      const stageU=playback.chapterWeights.reduce((sum,w,i)=>sum+w*(i+.5)/7,0)/playback.chapterWeights.reduce((a,b)=>a+b,0);
      const visualU=Number.isFinite(debug.visualU)?clamp(debug.visualU,0,1):(state.visualU??stageU);
      const storyElements = sampleElementPose(stageU, {reducedMotion: reduced});
      const elements = sampleSourceSeparation(storyElements.separationWeight);
      // The single transform writer always applies a source-relative offset to rest.
      d.layers.forEach(layer => {const offset = elements.offsets[layer.id]; layer.node.position.set(layer.rest.x + offset[0], layer.rest.y + offset[1], layer.rest.z + offset[2]);});
      const entry=d.diagramNodes.get(selected.id),bounds=entry?.record.bounds ?? liveBounds(d.meta,elements);
      const direction = applyChapterLighting(sampleContinuousLighting(stageU, {reducedMotion: reduced}),chapterScene);
      // The fixed verified comparison-family envelope owns stage scale and all
      // shadow coverage. No model rescaling and no floor following a loop offset.
      const stageLayout = resolveSceneStage(family.bounds, direction);
      const pointer = Number.isFinite(debug.stageU) ? {x: 0, y: 0} : state.pointer;
      const pose=sampleSourceScenePose({playback,chapterScene,families:d.families,selection:selected,aspect,viewport:slot.viewport,weight:studyWeight,
        inspection:state.inspection,interactionChapter:state.modelInteractionChapter,pointer,reducedMotion:reduced});
      const opticalInput={stageU,visualU,energy:state.energy,dwellWeight:state.dwellWeight,aspect,reducedMotion:reduced,chapterScene};
      const optics=sampleOpticalScore(opticalInput,pose,{bounds});
      optics.focalLengthMm=Number.isFinite(debug.focalLengthMm)?clamp(debug.focalLengthMm,10,160):focalLengthForFov(pose.fov,aspect,optics.filmGaugeMm);
      const opticalOverrides = {...(debug.optical ?? {})};
      const opticalWeight = detail === 'light' || reduced ? 0 : 1-studyWeight*.8;
      for (const key of ['apertureScale', 'maxBlurPx', 'asciiWeight', 'veil', 'mistStrength']) {
        optics[key] *= opticalWeight;
        if (Number.isFinite(opticalOverrides[key])) opticalOverrides[key] *= opticalWeight;
      }
      optics.studyWeight = studyWeight;
      optics.overrides = opticalOverrides;
      // One final camera write: the lens changes FOV, with no later competing FOV write.
      camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.aspect = size.width / size.height; camera.zoom = 1;
      camera.near = pose.near; camera.far = pose.far; camera.filmGauge = optics.filmGaugeMm; camera.setFocalLength(optics.focalLengthMm);
      camera.setViewOffset(size.width, size.height, size.width * pose.viewOffsetNormalized.x, size.height * pose.viewOffsetNormalized.y, size.width, size.height);
      camera.lookAt(...pose.target); camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
      const present=(pose.sourcePresence??1)>0;
      d.sourceRoot.visible=selected.id==='assembly' && present;
      for(const [id,value] of d.diagramNodes) value.nodes.forEach(node=>{node.visible=id===selected.id && present;});
      d.visibleSource=present?(entry?[entry.mesh]:d.layers.map(layer=>layer.node)):[];
      const exhibitionState = d.exhibition.update({direction,camera,bounds:family.bounds,quality:detail,reducedMotion:reduced,lightSweep:0});
      scene.background=direction.backgroundColor?d.studyBackground.fromArray(direction.backgroundColor):d.previousBackground;
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
      gl.shadowMap.enabled = detail === 'full'; d.lights.key.castShadow = detail === 'full' && direction.key.castShadow !== false;
      const shadowKey=JSON.stringify([detail,selected.id,elements.separationWeight,direction.key.position,stageLayout.center,stageLayout.shadowHalfExtent,present]);
      const shadowUpdated=detail==='full'&&shadowKey!==d.shadowKey;
      gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=shadowUpdated;d.shadowKey=shadowKey;
      scene.environmentIntensity = direction.environmentIntensity; scene.fog.color.fromArray(direction.haze.color); scene.fog.density = direction.haze.density;
      d.ground.position.fromArray(stageLayout.groundPosition); d.ground.scale.set(...stageLayout.groundSize, 1); d.ground.material.color.fromArray(direction.groundColor); d.ground.material.opacity = direction.groundOpacity;
      d.ground.visible = !direction.stage.exhibitionOwnsFloor;
      d.layers.forEach(layer => {if (layer.baseColor) layer.node.material.color.copy(layer.baseColor).multiplyScalar(.6 + direction.stage.baseEmphasis * .4);});
      d.adapters.forEach(adapter => adapter.update({progress: playback.phases?.[selected.chapterIndex]??0, emphasis: pose.surfaceEmphasis, finish:debug.material?.finish ?? 'satin'}));
      const hover=state.modelHover?.chapterId===selected.chapterId?clamp(state.modelHover.strength??0,0,1):0;
      // Bounded appearance feedback; authored COLOR_0 bytes and all geometry stay
      // untouched. The color study receives only a neutral brightness response.
      for(const value of d.diagramNodes.values()) {
        if(value.mesh.material.emissive) {value.mesh.material.emissive.setRGB(.045,.019,.004);value.mesh.material.emissiveIntensity=value===entry?hover:0;}
        else if(value.record.id==='curvature') value.mesh.material.color.setScalar(1+(value===entry?hover*.035:0));
      }
      const label=entry?.record.label ?? 'Source assembly';
      const representation={...selected,label,vertices:entry?.record.vertices??d.meta.vertices,triangles:entry?.record.triangles??d.meta.triangles,
        assetRevision:entry?d.diagramMeta.revision:d.meta.revision,bounds,fitBounds:family.bounds,framingSupportPoints:family.points.length,
        viewport:slot.viewport??null,weight:studyWeight,hover,sourceGeometryUnmodified:true,vertexColors:entry?.record.vertexColors??0};
      const presentationKey=`${selected.chapterId}:${selected.id}:${selected.pinned}`;
      // React's one-time readiness render can replace the initial source label.
      // Reconcile the live DOM value, while dispatching only real source changes.
      for(const surface of document.querySelectorAll(`[data-model-viewport][data-study-chapter="${selected.chapterId}"]`)) {
        if(surface.dataset.sourceIndex!==String(selected.index))surface.dataset.sourceIndex=String(selected.index);
        if(surface.dataset.representationId!==selected.id)surface.dataset.representationId=selected.id;
        const labelNode=surface.closest('[data-model-study]')?.querySelector('[data-source-label]');if(labelNode&&labelNode.textContent!==label)labelNode.textContent=label;
      }
      if(presentationKey!==d.presentationKey) {
        d.presentationKey=presentationKey;
        window.dispatchEvent(new CustomEvent('thesis:representation-presented',{detail:{chapterId:selected.chapterId,index:selected.index,representationId:selected.id,label,pinned:selected.pinned}}));
      }
      const caption=entry?entry.record.description:elements.caption;
      if (caption !== d.caption) {d.caption = caption; d.captions.forEach(element => {element.textContent = caption;});}
      const dpr = detail === 'light' ? 1 : Math.min(devicePixelRatio || 1, 1.25); if (gl.getPixelRatio() !== dpr) gl.setPixelRatio(dpr);
      gl.info.reset();
      d.compositor.render(scene, camera, optics, {width: size.width, height: size.height, dpr, samples: detail === 'full' && debug.samples !== 0 ? 2 : 0, protectedRects: debug.protectedRects ?? state.protectedRects ?? []});
      if (stage.current) stage.current.style.opacity = '1';
      last.current = {mode:'autonomous-source-story',renderedControllerFrame:state.controllerFrame??0,studyWeight,representation,playback,chapterScene,pose: {...pose, fov: camera.fov, focalLengthMm: optics.focalLengthMm}, optics, lights: direction, elements, bounds, detail, stageLayout, exhibition:exhibitionState, shadowUpdated,keyIntensity: d.lights.key.intensity};
      frames.current++;
      if (!d.ready) {d.ready = true; queueMicrotask(onReady);}
    } catch (error) {d.failed = true; console.error('Local scene rendering failed:', error.message); queueMicrotask(onFailure);}
  }, 1);
  return <primitive object={root} dispose={null} />;
}
export default function CinematicScene({onFailure,...props}) {
  const [supported, setSupported] = useState(false);
  // The discrete WebGL capability result gates hydration, never per-frame state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {let probe; try {probe = document.createElement('canvas').getContext('webgl2'); if (!probe) {onFailure(); return;} probe.getExtension('WEBGL_lose_context')?.loseContext(); setSupported(true);} catch {onFailure();}}, [onFailure]);
  return supported ? <Canvas frameloop="demand" dpr={[1, 1.25]} camera={{position: [4, 3, 6], fov: 38}} gl={{antialias: false, alpha: true, powerPreference: 'default'}} onCreated={({gl}) => {gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = T.SRGBColorSpace; gl.setClearColor(0x090d0d, 0); gl.shadowMap.type = T.PCFShadowMap; gl.info.autoReset = false;}}><World {...props} onFailure={onFailure}/></Canvas> : null;
}
