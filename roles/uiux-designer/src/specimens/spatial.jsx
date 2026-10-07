import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color, DoubleSide, Float32BufferAttribute, PlaneGeometry } from 'three';
import { hatchVertex, hatchFragment } from './hatch.js';
import { createResponse } from '../spatial-feedback/response.js';

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function fieldHeight(x, z, amplitude) { return Math.sin(x * 2.2) * Math.cos(z * 2) * amplitude * .45; }
/** Own this canvas's imperative renderer hook for the lifetime of the binding. */
function bindRendererGuard(renderer, onFailure) {
  const canvas = renderer.domElement;
  const lost = event => { event.preventDefault(); onFailure(); };
  const previous = renderer.debug.onShaderError;
  renderer.debug.onShaderError = () => queueMicrotask(onFailure);
  canvas.addEventListener('webglcontextlost', lost);
  return () => { canvas.removeEventListener('webglcontextlost', lost); renderer.debug.onShaderError = previous; };
}
function bandLift(z, center, lift) { return Math.exp(-Math.pow((z - center) / .22, 2)) * lift; }
function Drawing({ amplitude, band, spatial }) {
  return <svg viewBox="0 0 440 270" role="img" aria-label={`Generated wave field, amplitude ${amplitude.toFixed(2)}; static projection`}>
    {Array.from({ length: 16 }, (_, i) => { const z = (i / 15 - .5) * 2.2, selected = band >= 0 && Math.abs(z - (band - 2) * .44) < .24; return <path key={i} d={Array.from({ length: 31 }, (_, j) => { const x = (j / 30 - .5) * 3; return `${j ? 'L' : 'M'}${220 + (x - z * .6) * 78},${140 + (x + z) * 23 - (fieldHeight(x, z, amplitude) + bandLift(z, (band - 2) * .44, spatial && band >= 0 ? .35 : 0)) * 92}`; }).join(' ')} stroke={selected || band < 0 && i === 7 ? '#ff7a45' : '#a7adb5'} fill="none" strokeWidth={selected ? '2' : '1'} />; })}
  </svg>;
}
function Model({ amplitude, view, density, angle, band, spatial, reduced, onSelect, stageRef, onReady, onFailure }) {
  const { camera, invalidate, gl, size } = useThree(); const reported = useRef(false), response = useRef(null), frames = useRef(0);
  const geometry = useMemo(() => { const shape = new PlaneGeometry(3, 2.2, 40, 30); shape.rotateX(-Math.PI / 2); shape.setAttribute('color', new Float32BufferAttribute(new Float32Array(shape.attributes.position.count * 3), 3)); return shape; }, []);
  const uniforms = useMemo(() => ({ uDensity: { value: 18 }, uFocus: { value: .5 }, uHighlight: { value: 0 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => { const distance = 4.2 * Math.max(1, 1.3 / (size.width / size.height)); camera.position.set(Math.sin(angle) * distance, distance * .65, Math.cos(angle) * distance); camera.lookAt(0, 0, 0); invalidate(); }, [angle, camera, invalidate, size.width, size.height]);
  useEffect(() => {
    const base = new Color('#a7b5b8'), selected = new Color('#ff7a45');
    response.current = createResponse({ initial: { amplitude: .65, density: 18, center: 0, lift: 0, highlight: 0 }, reduced,
      onActivity: moving => { if (stageRef.current) stageRef.current.dataset.moving = String(moving); },
      render: value => {
        const positions = geometry.attributes.position, colors = geometry.attributes.color; let deformation = 0;
        for (let i = 0; i < positions.count; i++) { const x = positions.getX(i), z = positions.getZ(i), lift = bandLift(z, value.center, value.lift), mask = bandLift(z, value.center, value.highlight); positions.setY(i, fieldHeight(x, z, value.amplitude) + lift); deformation = Math.max(deformation, lift); colors.setXYZ(i, base.r + (selected.r - base.r) * mask, base.g + (selected.g - base.g) * mask, base.b + (selected.b - base.b) * mask); }
        positions.needsUpdate = true; colors.needsUpdate = true; geometry.computeVertexNormals(); geometry.computeBoundingSphere();
        uniforms.uDensity.value = value.density; uniforms.uFocus.value = .5 - value.center / 2.2; uniforms.uHighlight.value = value.highlight;
        if (stageRef.current) { stageRef.current.dataset.deformation = deformation.toFixed(4); stageRef.current.dataset.focus = uniforms.uFocus.value.toFixed(4); }
        invalidate();
      },
    });
    return () => { response.current?.destroy(); response.current = null; };
  }, [geometry, uniforms, invalidate, reduced, stageRef]);
  useEffect(() => { const value = { amplitude, density, center: band >= 0 ? (band - 2) * .44 : 0, lift: spatial && band >= 0 ? .35 : 0, highlight: band >= 0 ? 1 : 0 }; if (spatial) response.current?.to(value); else response.current?.snap(value); invalidate(); }, [amplitude, density, band, spatial, view, invalidate]);
  useEffect(() => bindRendererGuard(gl, onFailure), [gl, onFailure]);
  useFrame(() => { if (stageRef.current) stageRef.current.dataset.frames = String(++frames.current); if (!reported.current) { reported.current = true; queueMicrotask(onReady); } });
  return <><hemisphereLight args={['#eef5f6', '#28313b', 2]} /><directionalLight position={[3, 6, 4]} intensity={2} /><mesh geometry={geometry} onClick={event => { event.stopPropagation(); if (event.delta <= 5 && event.uv) onSelect(Math.min(4, Math.floor((1 - event.uv.y) * 5))); }}>{view === 'hatch' ? <shaderMaterial uniforms={uniforms} vertexShader={hatchVertex} fragmentShader={hatchFragment} side={DoubleSide} /> : <meshStandardMaterial vertexColors metalness={.2} roughness={.5} side={DoubleSide} wireframe={view === 'wireframe'} />}</mesh></>;
}
function Spatial({ material, context }) {
  const [amplitude, setAmplitude] = useState(.65); const [density, setDensity] = useState(18); const [angle, setAngle] = useState(.7); const [view, setView] = useState(material.demo === 'hatch' ? 'hatch' : 'wireframe'); const [active, setActive] = useState(false); const [ready, setReady] = useState(false); const [failed, setFailed] = useState(false);
  const onReady = useMemo(() => () => setReady(true), [setReady]); const onFailure = useMemo(() => () => { setFailed(true); setActive(false); setReady(false); }, [setFailed, setActive, setReady]);
  const [band, setBand] = useState(-1), [spatial, setSpatial] = useState(true); const stageRef = useRef(null);
  const reset = () => { setAmplitude(.65); setDensity(18); setAngle(.7); setBand(-1); setView(material.demo === 'hatch' ? 'hatch' : 'wireframe'); };
  return <section className="specimen applied-feedback"><h1>{material.name}</h1><p className="explanation">{material.description}</p>
    <div ref={stageRef} className="stage spatial-stage" data-applied="true" data-feedback={spatial ? 'spatial' : 'baseline'} data-band={band}>{active && !failed ? <Boundary onFailure={onFailure}><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [2.8, 2.7, 3.3], fov: 34 }} fallback={<p>WebGL is unavailable; use the diagram.</p>} aria-label="Generated wave field"><Model amplitude={amplitude} view={view} density={density} angle={angle} band={band} spatial={spatial} reduced={context.reduced} onSelect={value => setBand(previous => previous === value ? -1 : value)} stageRef={stageRef} onReady={onReady} onFailure={onFailure} /></Canvas></Boundary> : <Drawing amplitude={amplitude} band={band} spatial={spatial} />}</div>
    <div className="spatial-bands" role="group" aria-label="Inspect a field band">{Array.from({ length: 5 }, (_, i) => <button key={i} aria-pressed={band === i} onClick={() => setBand(previous => previous === i ? -1 : i)}>Band {i + 1}</button>)}<button onClick={() => setBand(-1)}>Clear band</button></div>
    <div className="controls"><label>Feedback<select value={spatial ? 'spatial' : 'baseline'} onChange={event => setSpatial(event.target.value === 'spatial')}><option value="spatial">Spatial</option><option value="baseline">Baseline</option></select></label><button onClick={() => { setActive(value => !value); setFailed(false); setReady(false); }}>{active ? 'Use diagram' : failed ? 'Retry 3D' : 'Enable 3D'}</button><button aria-pressed={view === 'wireframe'} onClick={() => setView('wireframe')}>Wireframe</button><button aria-pressed={view === 'surface'} onClick={() => setView('surface')}>Surface</button>{material.demo === 'hatch' && <button aria-pressed={view === 'hatch'} onClick={() => setView('hatch')}>Hatch</button>}<button onClick={() => setAngle(value => value - Math.PI / 6)}>Rotate left</button><button onClick={() => setAngle(value => value + Math.PI / 6)}>Rotate right</button><button onClick={reset}>Reset</button><label>Amplitude<input type="range" min="0" max="1" step=".05" value={amplitude} onChange={event => setAmplitude(Number(event.target.value))} /><output className="value">{amplitude.toFixed(2)}</output></label>{material.demo === 'hatch' && <label>Hatch density<input type="range" min="6" max="36" step="1" value={density} onChange={event => setDensity(Number(event.target.value))} /><output className="value">{density}</output></label>}</div>
    <p className="specimen-status" role="status">{failed ? '3D unavailable. The parametric diagram remains active.' : active ? ready ? '3D ready / demand rendering' : 'Loading 3D…' : 'Static projection / no active canvas'}</p><p className="band-status" role="status">{band < 0 ? 'No band selected.' : `Band ${band + 1} selected${spatial ? ' and locally lifted' : '; baseline geometry retained'}.`}</p><p className="reduced-note">Select a numbered band or click the mesh. The actual vertices and hatch reference respond. Unitless geometry; no measured physical field or structural analysis. Reduced motion uses direct poses.</p></section>;
}
export default function spatial(root, material, context) { const reactRoot = createRoot(root); reactRoot.render(<Spatial material={material} context={context} />); return () => reactRoot.unmount(); }
