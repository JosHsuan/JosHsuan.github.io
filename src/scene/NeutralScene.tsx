import { Component, useEffect, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import type { OpeningController } from '../opening/controller'
import { CinematicLens } from './CinematicLens'

function Surface({ controller }: { controller: OpeningController }) {
  const { invalidate, gl } = useThree()
  useEffect(() => controller.onFrame(() => invalidate()), [controller, invalidate])
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); controller.finish() }
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => gl.domElement.removeEventListener('webglcontextlost', lost)
  }, [gl, controller])
  return <>
    <mesh frustumCulled={false}><planeGeometry args={[2, 2]} /><shaderMaterial depthTest={false} depthWrite={false}
      vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}"
      fragmentShader="varying vec2 vUv; void main(){float light=exp(-length((vUv-vec2(.72,.55))*vec2(1.,1.5))*3.0);gl_FragColor=vec4(mix(vec3(.012,.02,.026),vec3(.10,.14,.15),light),1.0);}" /></mesh>
    <CinematicLens controller={controller} />
  </>
}

// Neutral lighting only. The rejected chamber and all previous scene objects
// are deliberately absent; the accepted glass pipeline remains unchanged.
export default function NeutralScene({ controller }: { controller: OpeningController }) {
  return <WorkspaceSceneBoundary onFailure={controller.finish}><Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: false, toneMapping: ACESFilmicToneMapping }}><Surface controller={controller} /></Canvas></WorkspaceSceneBoundary>
}

class WorkspaceSceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? <div className="scene-fallback" /> : this.props.children }
}
