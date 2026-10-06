'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { sceneRegistry } from '@/scenes/registry';
import type { MotionMode } from '@/motion/contracts';
import { SceneFallback } from './SceneFallback';

const components = Object.fromEntries(Object.entries(sceneRegistry).map(([id, scene]) => [id, lazy(scene.load)]));

function ReadySignal({ onReady }: { onReady: () => void }) {
  const reported = useRef(false);
  useFrame(() => {
    if (!reported.current) { reported.current = true; queueMicrotask(onReady); }
  });
  return null;
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [canvas, onFailure]);
  return null;
}

export default function SceneCanvas({ sceneId, mode, onFailure, onReady }: { sceneId: string; mode: MotionMode; onFailure: () => void; onReady: () => void }) {
  const Scene = components[sceneId];
  if (!Scene) return <SceneFallback />;
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} fallback={<SceneFallback />}>
    <ContextGuard onFailure={onFailure} />
    <Suspense fallback={null}><Scene mode={mode} /><ReadySignal onReady={onReady} /></Suspense>
  </Canvas>;
}
