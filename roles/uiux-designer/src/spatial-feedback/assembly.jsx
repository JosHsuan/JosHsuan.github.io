import { Component, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import { scaffold, node, control, range, svgNode } from '../specimens/helpers.js';
import { spatialScore, staticPose } from '../motion/theatre/spatial/binding.js';
import { ribCount, createRib, ribPose } from './geometry.js';

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
/** Explicit lifetime ownership for mutable Three renderer/camera bindings. */
function bindScene(bridge, gl, invalidate) {
  bridge.invalidate = invalidate;
  const lost = e => { e.preventDefault(); queueMicrotask(bridge.fail); };
  gl.domElement.addEventListener('webglcontextlost', lost);
  const old = gl.debug.onShaderError; gl.debug.onShaderError = () => queueMicrotask(bridge.fail);
  return () => { bridge.invalidate = () => {}; gl.domElement.removeEventListener('webglcontextlost', lost); gl.debug.onShaderError = old; };
}
function writeCamera(camera, pose, scale) {
  camera.position.set(pose.position.x * scale, pose.position.y * scale, pose.position.z * scale);
  camera.fov = pose.fov; camera.lookAt(pose.target.x, pose.target.y, pose.target.z); camera.updateProjectionMatrix();
}
function Assembly({ bridge }) {
  const { camera, invalidate, gl, size } = useThree();
  const geometry = useMemo(() => createRib(), []);
  const story = useRef(null), interaction = useRef(null), ribs = useRef([]), feedback = useRef([]), materials = useRef([]);
  const frames = useRef(0), ready = useRef(false), orientation = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => bindScene(bridge, gl, invalidate), [bridge, invalidate, gl]);
  useFrame((_, delta) => {
    if (!story.current) return;
    const pose = bridge.pose, p = pose.assemblyProgress, dt = Math.min(delta, .05);
    const scale = Math.max(1, 1.15 / (size.width / size.height));
    writeCamera(camera, pose.camera, scale);
    story.current.rotation.z = Math.sin(p * Math.PI) * -.075;
    let moving = false;
    const yaw = bridge.yaw * Math.PI / 180;
    orientation.current = bridge.reduced ? yaw : MathUtils.damp(orientation.current, yaw, 11, dt);
    if (Math.abs(orientation.current - yaw) < .0001) orientation.current = yaw; else moving = true;
    interaction.current.rotation.y = orientation.current;
    for (let i = 0; i < ribCount; i++) {
      const posePart = ribPose(i, p), rib = ribs.current[i], lift = feedback.current[i], material = materials.current[i];
      rib.position.set(posePart.x, posePart.y, posePart.z); rib.rotation.set(posePart.rx, posePart.ry, 0);
      const target = bridge.selected === i ? .46 : bridge.hover === i && !bridge.reduced ? .1 : 0;
      lift.position.y = bridge.reduced ? target : MathUtils.damp(lift.position.y, target, 13, dt);
      if (Math.abs(lift.position.y - target) < .0001) lift.position.y = target; else moving = true;
      material.color.set(bridge.selected === i ? '#ff7a45' : bridge.hover === i ? '#eef5ed' : i === 4 ? '#869ca6' : '#bdc8cb');
      material.wireframe = bridge.wire;
    }
    bridge.report({ frames: ++frames.current, progress: p, camera: camera.position.toArray(), yaw: orientation.current, moving });
    if (moving) invalidate();
    if (!ready.current) { ready.current = true; queueMicrotask(bridge.ready); }
  });
  return <><hemisphereLight args={['#e8f5ff', '#24323b', 2.5]} /><directionalLight position={[2, 5, 4]} intensity={3.4} /><directionalLight position={[-4, 1, -2]} intensity={1.8} color="#ffaf81" />
    <group ref={story}><group ref={interaction}>{Array.from({ length: ribCount }, (_, i) => <group key={i} ref={value => { ribs.current[i] = value; }}><group ref={value => { feedback.current[i] = value; }}><mesh geometry={geometry} onPointerOver={e => { e.stopPropagation(); bridge.setHover(i); }} onPointerOut={() => bridge.setHover(-1)} onClick={e => { e.stopPropagation(); bridge.select(i); }}><meshStandardMaterial ref={value => { materials.current[i] = value; }} metalness={.46} roughness={.33} /></mesh></group></group>)}</group></group>
    <gridHelper args={[8, 20, '#425763', '#263843']} position={[0, -.87, 0]} /></>;
}
function staticDrawing(host) {
  const svg = svgNode('svg', { viewBox: '0 0 440 300', role: 'img', 'aria-label': 'Nine generated curved ribs; select a numbered rib or scrub the sequence to inspect relationships.' });
  const paths = Array.from({ length: ribCount }, () => { const p = svgNode('path', { fill: 'none', 'stroke-width': '7', 'stroke-linecap': 'butt' }); svg.append(p); return p; }); host.replaceChildren(svg);
  return (progress, selected) => paths.forEach((path, i) => {
    const pose = ribPose(i, progress), cx = 220 + pose.z * 36 + pose.x * 30, cy = 170 + pose.z * 15 - pose.y * 30 - (i === selected ? 20 : 0);
    path.setAttribute('d', `M${cx - 75},${cy}Q${cx},${cy - 140} ${cx + 75},${cy}`); path.setAttribute('stroke', i === selected ? '#ff7a45' : '#acbdc6');
  });
}
export default function mount(root, material, context) {
  const { stage, controls, status } = scaffold(root, material); stage.classList.add('assembly-stage'); controls.classList.add('assembly-controls');
  let renderRoot, disposed = false, active = false, controllerReady = false, generation = 0, updateStatic;
  const bridge = { stage, pose: staticPose, selected: -1, hover: -1, yaw: 0, reduced: context.reduced, wire: false, invalidate: () => {}, ready: () => { if (!disposed && active) { status.textContent = '3D ready / nine selectable ribs / Theatre score / demand rendering'; stage.dataset.ready = 'true'; } }, fail: () => { if (!disposed) { disable(); status.textContent = '3D unavailable. The numbered controls and static projection remain active.'; enable.textContent = 'Retry 3D'; } } };
  bridge.setHover = i => { bridge.hover = i; bridge.invalidate(); };
  bridge.report = value => { stage.dataset.frames = String(value.frames); stage.dataset.progress = value.progress.toFixed(4); stage.dataset.camera = value.camera.map(n => n.toFixed(3)).join(','); stage.dataset.yaw = value.yaw.toFixed(4); stage.dataset.scheduler = value.moving ? 'active' : 'idle'; };
  const tell = text => { status.textContent = text; };
  function update() { if (active) bridge.invalidate(); else updateStatic?.(bridge.pose.assemblyProgress, bridge.selected); }
  const controller = spatialScore(value => { bridge.pose = value; update(); }, () => bridge.invalidate());
  function pause(message) { generation++; controller.pause(); tell(message); }
  function disable() { pause('Static projection / no active canvas'); active = false; renderRoot?.unmount(); renderRoot = undefined; stage.dataset.ready = 'false'; stage.dataset.scheduler = 'idle'; updateStatic = staticDrawing(stage); update(); enable.textContent = 'Enable 3D'; yaw.input.disabled = true; wire.disabled = true; }
  const enable = control(controls, 'Enable 3D', () => {
    if (active) { disable(); return; }
    active = true; stage.replaceChildren(); renderRoot = createRoot(stage);
    renderRoot.render(<Boundary onFailure={bridge.fail}><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [4.8, 3.2, 6.8], fov: 35 }} fallback={<p>WebGL unavailable. Use the static projection.</p>} aria-label="Interactive curved rib assembly"><Assembly bridge={bridge} /></Canvas></Boundary>);
    enable.textContent = 'Use diagram'; yaw.input.disabled = false; wire.disabled = false; tell('Loading 3D…');
  });
  const play = control(controls, 'Play spatial score', async () => {
    const token = ++generation; controller.setMode('story'); bridge.selected = -1; bridge.hover = -1; bridge.yaw = 0; yaw.input.value = '0'; yaw.output.textContent = '0'; markSelected();
    tell('Spatial score playing: gather, fan, hold, return.');
    try { const result = await controller.play('spatial'); if (!disposed && token === generation) tell(`Spatial score ${result}.`); } catch { if (!disposed) tell('Motion unavailable. Use the static projection.'); }
  });
  control(controls, 'Pause', () => pause('Spatial score paused. Current pose retained.'));
  const seek = range(controls, 'Manual seek target / %', 0, 100, 1, 0, value => { generation++; controller.setMode('story'); controller.seek('spatial', value / 100); tell(`Sequence position: ${value}%. Camera and rib poses evaluated by Theatre.`); });
  const yaw = range(controls, 'Inspection turn / degrees', -70, 70, 5, 0, value => { pause(`Inspection turn: ${value} degrees. Story paused.`); bridge.yaw = value; update(); });
  const wire = control(controls, 'Wireframe', () => { bridge.wire = !bridge.wire; wire.setAttribute('aria-pressed', String(bridge.wire)); update(); tell(bridge.wire ? 'Wireframe representation.' : 'Surface representation.'); }); wire.setAttribute('aria-pressed', 'false');
  wire.disabled = true; yaw.input.disabled = true;
  control(controls, 'Open inspection pose', () => { generation++; controller.setMode('story'); controller.seek('spatial', .5); seek.input.value = '50'; seek.output.textContent = '50'; tell('Open inspection pose / score at 2.4 seconds.'); });
  control(controls, 'Reset', () => { generation++; controller.applyStaticPose(); bridge.selected = -1; bridge.hover = -1; bridge.yaw = 0; bridge.wire = false; markSelected(); seek.input.value = '0'; seek.output.textContent = '0'; yaw.input.value = '0'; yaw.output.textContent = '0'; wire.setAttribute('aria-pressed', 'false'); update(); tell('Camera, timeline, selection, inspection turn and representation reset.'); });
  const parts = node('div', undefined, { class: 'part-select', role: 'group', 'aria-label': 'Select a rib' }); controls.after(parts);
  const selectionText = node('p', 'No rib selected.', { class: 'assembly-reading' }); parts.after(selectionText);
  const selectors = Array.from({ length: ribCount }, (_, i) => { const button = control(parts, `R${String(i + 1).padStart(2, '0')}`, () => bridge.select(i)); button.setAttribute('aria-pressed', 'false'); return button; });
  function markSelected() { selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === bridge.selected))); selectionText.textContent = bridge.selected < 0 ? 'No rib selected.' : `R${String(bridge.selected + 1).padStart(2, '0')} selected / curved profile / local lift isolates the part.`; stage.dataset.selected = String(bridge.selected); }
  bridge.select = i => { pause(`Rib ${i + 1} selected. Story paused; the selected part lifts from its assembly position.`); bridge.selected = i; markSelected(); update(); };
  const onHide = () => { if (document.hidden) controller.pause(); }; document.addEventListener('visibilitychange', onHide);
  play.disabled = true; seek.input.disabled = true;
  controller.ready.then(() => { if (disposed) return; controllerReady = true; play.disabled = context.reduced; seek.input.disabled = false; tell(context.reduced ? 'Reduced motion / still poses and direct part selection available.' : 'Score ready / no autoplay. Enable 3D, play, or inspect a still pose.'); }).catch(() => { if (!disposed) tell('Score unavailable. Static assembly retained.'); });
  root.querySelector('.specimen').append(node('p', 'Original unitless geometric specimen. No structural analysis or client model. Enable 3D for inspection turn and surface/wire controls. Camera and assembly: Theatre. Inspection and part lift: separate nested groups. Reduced motion disables playback and interpolation.', { class: 'reduced-note' }));
  updateStatic = staticDrawing(stage); update();
  return () => { disposed = true; generation++; document.removeEventListener('visibilitychange', onHide); if (controllerReady) controller.pause(); controller.dispose(); renderRoot?.unmount(); };
}
