import { Component, lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BufferGeometry, PerspectiveCamera } from 'three'
import DevMcp, { inspectionEnabled } from './DevMcp'

type Point = [number, number, number]
type Face = [number, number, number]
type View = 'overview' | 'side' | 'detail'
type MeshData = { points: Point[]; faces: Face[]; positions: Float32Array; indices: Uint16Array; edges: Float32Array }
type SceneProps = { data: MeshData; edgesOnly: boolean; view: View; onFailure: () => void }

// A standard icosahedron split into four triangles per face, projected to a
// synthetic sphere. This is new explanatory code, not the project's Mola code
// or a reconstruction of its final geometry. No source model/data is imported.
function makeMesh(level: number): MeshData {
  const t = (1 + Math.sqrt(5)) / 2
  const normalize = ([x, y, z]: Point): Point => {
    const length = Math.hypot(x, y, z)
    return [x / length, y / length, z / length]
  }
  const points: Point[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t],
    [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((p) => normalize(p as Point))
  let faces: Face[] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9],
    [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2],
    [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  for (let step = 0; step < level; step++) {
    const cache = new Map<string, number>()
    const midpoint = (a: number, b: number) => {
      const key = `${Math.min(a, b)}:${Math.max(a, b)}`
      const existing = cache.get(key)
      if (existing !== undefined) return existing
      const pa = points[a], pb = points[b]
      const index = points.length
      points.push(normalize([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2]))
      cache.set(key, index)
      return index
    }
    faces = faces.flatMap(([a, b, c]): Face[] => {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a)
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]
    })
  }
  const edges: number[] = [], seen = new Set<string>()
  for (const face of faces) {
    for (let i = 0; i < 3; i++) {
      const a = face[i], b = face[(i + 1) % 3], key = `${Math.min(a, b)}:${Math.max(a, b)}`
      if (!seen.has(key)) { seen.add(key); edges.push(...points[a], ...points[b]) }
    }
  }
  return { points, faces, positions: new Float32Array(points.flat()), indices: new Uint16Array(faces.flat()), edges: new Float32Array(edges) }
}

const rotations: Record<View, Point> = { overview: [0.2, 0.4, 0], side: [0.2, 1.15, 0], detail: [-0.25, 0.7, 0] }

function Diagram({ data, edgesOnly, view }: Omit<SceneProps, 'onFailure'>) {
  const titleId = useId()
  const [rx, ry] = rotations[view]
  const transformed = data.points.map(([x, y, z]) => {
    const xx = x * Math.cos(ry) + z * Math.sin(ry), zz = -x * Math.sin(ry) + z * Math.cos(ry)
    return [xx, y * Math.cos(rx) - zz * Math.sin(rx), y * Math.sin(rx) + zz * Math.cos(rx)]
  })
  const triangles = data.faces.map((face) => ({ face, depth: face.reduce((sum, i) => sum + transformed[i][2], 0) / 3 }))
    .filter(({ depth }) => depth >= -0.07).sort((a, b) => a.depth - b.depth)
  return (
    <div data-testid="scene-fallback" className="method-diagram" style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <svg viewBox="0 0 420 340" role="img" aria-labelledby={titleId} style={{ display: 'block', width: '100%', height: '100%' }}>
        <title id={titleId}>Method illustration: a synthetic spherical mesh with {data.faces.length} triangles</title>
        <circle cx="210" cy="168" r="144" fill="none" stroke="currentColor" opacity="0.13" />
        {triangles.map(({ face, depth }, i) => <polygon key={i}
          points={face.map((j) => `${210 + transformed[j][0] * 134},${168 - transformed[j][1] * 134}`).join(' ')}
          fill={edgesOnly ? 'none' : '#c4cdc1'} fillOpacity={0.45 + Math.max(0, depth) * 0.5}
          stroke="#47614e" strokeWidth="0.55" />)}
      </svg>
    </div>
  )
}

// Both WebGL libraries are fetched only when an in-view user chooses 3D.
// Type-only imports above do not pull Three.js into the DOM/fallback bundle.
const LazyScene = lazy(async () => {
  const { Canvas, useThree } = await import('@react-three/fiber')
  function Scene({ data, edgesOnly, view }: SceneProps) {
    const geometry = useRef<BufferGeometry>(null)
    const camera = useRef<PerspectiveCamera>(null)
    const originalCamera = useThree((state) => state.camera)
    const size = useThree((state) => state.size)
    const set = useThree((state) => state.set)
    const invalidate = useThree((state) => state.invalidate)
    useEffect(() => {
      const chosen = camera.current
      if (!chosen) return
      chosen.lookAt(0, 0, 0)
      chosen.updateProjectionMatrix()
      set({ camera: chosen })
      invalidate()
      return () => { set({ camera: originalCamera }) }
      // The pre-existing camera is captured once for this mounted scene.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [set, invalidate])
    useEffect(() => {
      if (!camera.current || !size.height) return
      camera.current.aspect = size.width / size.height
      camera.current.updateProjectionMatrix()
      invalidate()
    }, [size.width, size.height, invalidate])
    useEffect(() => {
      geometry.current?.computeVertexNormals()
      geometry.current?.computeBoundingSphere()
      invalidate()
    }, [data, edgesOnly, view, invalidate])
    return <>
      <perspectiveCamera ref={camera} name="MethodCamera" position={[2.9, 1.65, 3.2]} fov={38} near={0.1} far={30} />
      <ambientLight name="AmbientLight" intensity={1.2} />
      <directionalLight name="KeyLight" position={[3, 4, 5]} intensity={2.3} />
      <directionalLight name="FillLight" position={[-4, 1, -2]} intensity={1.1} />
      <group name="SubdivisionMethod" rotation={rotations[view]} scale={view === 'detail' ? 1.24 : 1}>
        <mesh name="MethodSurface" visible={!edgesOnly} userData={{ source: 'new-method-illustration', triangles: data.faces.length, vertices: data.points.length }}>
          <bufferGeometry key={`surface-${data.points.length}`} ref={geometry}>
            <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            <bufferAttribute attach="index" args={[data.indices, 1]} />
          </bufferGeometry>
          <meshStandardMaterial name="MethodSurfaceMaterial" color="#b6c4b5" roughness={0.85} metalness={0.02} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
        <lineSegments name="MethodEdges" scale={1.002}>
          <bufferGeometry key={`edges-${data.points.length}`}><bufferAttribute attach="attributes-position" args={[data.edges, 3]} /></bufferGeometry>
          <lineBasicMaterial name="MethodEdgeMaterial" color="#344b3c" transparent opacity={edgesOnly ? 0.9 : 0.44} />
        </lineSegments>
      </group>
    </>
  }
  function WebGLScene(props: SceneProps) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
    const { onFailure } = props
    // Remove this listener before Canvas disposes its WebGL context on a normal
    // viewport unmount; only unexpected loss of a live context is a failure.
    useLayoutEffect(() => {
      if (!canvas) return
      const handleLoss = (event: Event) => { event.preventDefault(); onFailure() }
      canvas.addEventListener('webglcontextlost', handleLoss)
      return () => canvas.removeEventListener('webglcontextlost', handleLoss)
    }, [canvas, onFailure])
    return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [2.9, 1.65, 3.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: inspectionEnabled }}
      fallback={<Diagram {...props} />} onCreated={({ gl }) => setCanvas(gl.domElement)}
      style={{ width: '100%', height: '100%' }} aria-label="Interactive mesh refinement method illustration">
      <DevMcp><Scene {...props} /></DevMcp>
    </Canvas>
  }
  return { default: WebGLScene }
})

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function MethodScene() {
  const container = useRef<HTMLElement>(null)
  const id = useId()
  const [level, setLevel] = useState(1)
  const [edgesOnly, setEdgesOnly] = useState(false)
  const [view, setView] = useState<View>('overview')
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [choice, setChoice] = useState<boolean | null>(null)
  const [failed, setFailed] = useState(false)
  const data = useMemo(() => makeMesh(level), [level])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const node = container.current
    if (!node) return
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const wants3D = choice ?? !reducedMotion
  const active = visible && wants3D && !failed
  const fallback = <Diagram data={data} edgesOnly={edgesOnly} view={view} />
  const fail = useCallback(() => setFailed(true), [])
  return <section ref={container} className="method-scene" data-testid="project-interactive" aria-labelledby={`${id}-title`}>
    <div className="method-intro">
      <p className="eyebrow">Method study / Interactive illustration</p>
      <h3 id={`${id}-title`}>From a coarse mesh to finer detail</h3>
      <p>Explore how one refinement step replaces each triangle with four smaller faces. The geometry here is a new, synthetic illustration of mesh subdivision, related to <em>Stare at the Silence</em>.</p>
    </div>
    <div className="method-viewport" data-testid="method-viewport" style={{ height: 'clamp(300px, 45vw, 430px)', width: '100%', overflow: 'hidden', background: '#e9ece5', border: '1px solid #d6dcd2', borderRadius: 2 }}>
      {active ? <SceneBoundary fallback={fallback} onFailure={fail}>
        <Suspense fallback={fallback}><LazyScene data={data} edgesOnly={edgesOnly} view={view} onFailure={fail} /></Suspense>
      </SceneBoundary> : fallback}
    </div>
    <fieldset className="method-controls" style={{ border: 0, margin: '1.2rem 0 0', padding: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <legend className="sr-only">Mesh illustration controls</legend>
      <label htmlFor={`${id}-refine`}>Refinement level <output>{level}</output>
        <input id={`${id}-refine`} aria-label="Refinement level" type="range" min="0" max="3" step="1" value={level} onChange={(event) => setLevel(Number(event.target.value))} style={{ display: 'block', width: 160, maxWidth: '100%' }} />
      </label>
      <div role="group" aria-label="Display mode" style={{ display: 'flex', gap: '.4rem' }}>
        <button type="button" aria-pressed={!edgesOnly} onClick={() => setEdgesOnly(false)}>Surface</button>
        <button type="button" aria-pressed={edgesOnly} onClick={() => setEdgesOnly(true)}>Edges</button>
      </div>
      <label htmlFor={`${id}-view`}>View
        <select id={`${id}-view`} aria-label="View" value={view} onChange={(event) => setView(event.target.value as View)} style={{ display: 'block' }}>
          <option value="overview">Overview</option><option value="side">Side</option><option value="detail">Detail</option>
        </select>
      </label>
      {wants3D && !failed
        ? <button type="button" data-testid="disable-3d" onClick={() => setChoice(false)}>Use diagram</button>
        : <button type="button" data-testid="enable-3d" onClick={() => { setFailed(false); setChoice(true) }}>Enable 3D</button>}
    </fieldset>
    <p aria-live="polite" className="method-state" style={{ fontSize: '.875rem', marginTop: '.9rem' }}>{data.faces.length.toLocaleString('en-US')} triangles · {data.points.length.toLocaleString('en-US')} vertices in this illustration. {failed ? '3D is unavailable; the diagram and controls remain usable.' : active ? '3D view active; changes render on demand.' : 'Diagram view; all method controls remain available.'}</p>
    <p className="method-caption" style={{ fontSize: '.8rem', maxWidth: '76ch' }}>A new spherical mesh illustrates triangle refinement, separate from the coursework geometry. The coursework builds on Mola and Benjamin Dillenburger’s methods; fabrication is not simulated here.</p>
  </section>
}
