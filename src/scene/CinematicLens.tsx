import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { expansionAt } from '../opening/choreography'
import type { OpeningController } from '../opening/controller'
import { GlassPass } from './GlassPass'

export function CinematicLens({ controller }: { controller: OpeningController }) {
  const { gl, scene, camera, size, invalidate } = useThree()
  const pipeline = useRef<{ composer: EffectComposer; glass: GlassPass } | null>(null)
  useEffect(() => {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 })
    const composer = new EffectComposer(gl, target)
    const render = new RenderPass(scene, camera)
    const bloom = new UnrealBloomPass(new Vector2(1,1), 0.035, 0.8, 1.2)
    const glass = new GlassPass()
    const output = new OutputPass()
    composer.addPass(render); composer.addPass(bloom); composer.addPass(glass); composer.addPass(output)
    pipeline.current = { composer, glass }
    return () => { pipeline.current = null; bloom.dispose(); glass.dispose(); output.dispose(); render.dispose(); composer.dispose() }
  }, [gl, scene, camera])
  useEffect(() => {
    const current = pipeline.current
    if (!current) return
    current.composer.renderTarget1.samples = size.width < 720 ? 2 : 4
    current.composer.renderTarget2.samples = size.width < 720 ? 2 : 4
    current.composer.setPixelRatio(Math.min(gl.getPixelRatio(), size.width < 720 ? 1 : 1.5))
    current.composer.setSize(size.width, size.height)
    current.glass.uniforms.resolution.value.set(size.width,size.height)
    // Demand rendering must repaint after effect-owned targets are resized.
    invalidate()
  }, [size, gl, scene, camera, invalidate])
  useEffect(() => {
    const panel = document.querySelector('.terminal')
    const observer = new ResizeObserver(() => invalidate())
    const visibility = new MutationObserver(() => invalidate())
    if (panel) observer.observe(panel)
    if (panel) visibility.observe(panel, { attributes: true, attributeFilter: ['class'] })
    return () => { observer.disconnect(); visibility.disconnect() }
  }, [invalidate])
  useFrame(() => {
    const current = pipeline.current
    if (!current) return
    const panel = document.querySelector<HTMLElement>('.terminal')
    const rect = panel?.getBoundingClientRect()
    current.glass.uniforms.enabledGlass.value = rect && !panel?.classList.contains('terminal-hidden') ? 1 : 0
    if (rect) current.glass.uniforms.panel.value.set(rect.x,size.height-rect.y-rect.height,rect.width,rect.height)
    current.glass.uniforms.depth.value = expansionAt(controller.progress)
    current.composer.render()
    if (import.meta.env.DEV) gl.domElement.dataset.renderCount = String(Number(gl.domElement.dataset.renderCount ?? 0) + 1)
  }, 1)
  return null
}
