'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {sampleCinematicPose} from './vendor/cinematic-plan.mjs';
import {createCinematicMaterial} from './materials/cinematic-material';

function World({input, stage, onReady, onFailure}) {
  const {gl, camera, scene, invalidate, size} = useThree();
  const root = useMemo(() => new T.Group(), []), data = useRef(null), frames = useRef(0), lastPose = useRef(null);
  useEffect(() => input.subscribe(() => {if (!input.get().hidden) invalidate();}), [input, invalidate]);
  useEffect(() => {
    let cancelled = false, cleanup = () => {};
    const lose = e => {e.preventDefault(); onFailure();}; gl.domElement.addEventListener('webglcontextlost', lose);
    Promise.allSettled([new GLTFLoader().loadAsync('/assets/assembly.glb'), new HDRLoader().loadAsync('/assets/studio-small.hdr'), fetch('/assets/model.json').then(r => {if (!r.ok) throw Error('Model metadata unavailable'); return r.json();})]).then(results => {
      const gltf = results[0].status === 'fulfilled' ? results[0].value : null;
      const hdr = results[1].status === 'fulfilled' ? results[1].value : null;
      if (cancelled || results.some(r => r.status === 'rejected')) {
        gltf?.scene.traverse(node => {if (node.isMesh) {node.geometry.dispose(); (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => m.dispose());}}); hdr?.dispose();
        if (!cancelled) onFailure(); return;
      }
      const meta = results[2].value, generator = new T.PMREMGenerator(gl), environment = generator.fromEquirectangular(hdr);
      generator.dispose(); hdr.dispose();
      const materials = [], geometries = [];
      gltf.scene.traverse(node => {if (!node.isMesh) return;
        geometries.push(node.geometry); (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => m.dispose());
        const adapter = createCinematicMaterial({bounds: meta.bounds}); materials.push(adapter); node.material = adapter.material;
      });
      cleanup = () => {root.remove(gltf.scene); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); if (scene.environment === environment.texture) scene.environment = null; environment.dispose(); data.current = null;};
      scene.environment = environment.texture; scene.environmentIntensity = 1; root.add(gltf.scene); data.current = {meta, materials, ready: false}; invalidate();
    }).catch(() => {cleanup(); if (!cancelled) onFailure();});
    window.__thesis = {inspect: () => ({ready: !!data.current?.ready, frames: frames.current, ...input.get(), pose: lastPose.current, material: data.current?.materials[0]?.inspect(), renderer: {calls: gl.info.render.calls, triangles: gl.info.render.triangles, programs: gl.info.programs.length}, memory: {...gl.info.memory}}), loseContext: () => gl.getContext().getExtension('WEBGL_lose_context')?.loseContext()};
    return () => {cancelled = true; gl.domElement.removeEventListener('webglcontextlost', lose); cleanup(); delete window.__thesis;};
  }, [gl, input, invalidate, onFailure, root, scene]);
  useFrame(() => {
    const d = data.current, state = input.get(); if (!d || state.hidden) return;
    const pose = sampleCinematicPose(state.u, size.width / size.height, state.pointer, {bounds: d.meta.bounds, modelRevision: d.meta.revision, reducedMotion: state.reduced});
    // The sole final camera writer combines reading position and decorative tilt.
    camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.fov = pose.fov; camera.near = pose.near; camera.far = pose.far;
    camera.setViewOffset(size.width, size.height, size.width * pose.viewOffsetNormalized.x, size.height * pose.viewOffsetNormalized.y, size.width, size.height);
    camera.lookAt(...pose.target); camera.updateProjectionMatrix();
    d.materials.forEach(m => m.update({progress: state.u, emphasis: pose.surfaceEmphasis}));
    if (stage.current) stage.current.style.opacity = String(pose.modelVisibility);
    lastPose.current = pose; frames.current++;
    if (!d.ready) {d.ready = true; queueMicrotask(onReady);}
  });
  return <><primitive object={root} dispose={null} /><hemisphereLight args={['#e4eee7', '#28352e', .8]} /><directionalLight position={[3, 5, 3]} intensity={2.4} color="#f2efd9" /><directionalLight position={[-4, 2, -2]} intensity={2.1} color="#cfdfed" /></>;
}
export default function CinematicScene(props) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {let probe; try {probe = document.createElement('canvas').getContext('webgl2'); if (!probe) {props.onFailure(); return;} probe.getExtension('WEBGL_lose_context')?.loseContext(); setSupported(true);} catch {props.onFailure();}}, [props.onFailure]);
  return supported ? <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{position: [4, 3, 6], fov: 38}} gl={{antialias: true, alpha: true, powerPreference: 'default'}} onCreated={({gl}) => {gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = T.SRGBColorSpace; gl.setClearColor(0x090d0d, 0);}}><World {...props} /></Canvas> : null;
}
