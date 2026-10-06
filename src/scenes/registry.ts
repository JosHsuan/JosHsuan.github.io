import type { ComponentType } from 'react';
import type { MotionMode } from '@/motion/contracts';

export type SceneProps = { mode: MotionMode };
export type SceneDefinition = {
  load: () => Promise<{ default: ComponentType<SceneProps> }>;
  poster: { path: string; alt: string; width: number; height: number };
  label: string;
};

// Add only explicit lazy imports after a scene and its public assets are approved.
export const sceneRegistry: Readonly<Record<string, SceneDefinition>> = {};
export function getScene(id: string): SceneDefinition | undefined { return sceneRegistry[id]; }
