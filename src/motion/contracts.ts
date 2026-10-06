export type MotionMode = 'story' | 'inspect' | 'static';
export type PlayheadDriver = 'paused' | 'time' | 'scroll';
export type PlayResult = 'completed' | 'cancelled' | 'skipped';
export type Clip = Readonly<{ start: number; end: number }>;
export type Vector3Value = { x: number; y: number; z: number };
export type ScenePose = {
  camera: { position: Vector3Value; target: Vector3Value; fov: number };
  assemblyProgress: number;
};

export interface SceneMotionController<ClipId extends string = string> {
  readonly ready: Promise<void>;
  setMode(mode: MotionMode): void;
  play(clipId: ClipId, options?: { signal?: AbortSignal }): Promise<PlayResult>;
  pause(): void;
  seek(clipId: ClipId, progress: number): void;
  applyStaticPose(): void;
  dispose(): void;
}

/** Runtime boundary. The driver owns subscriptions; the controller owns playback. */
export interface MotionDriver {
  ready: Promise<void>;
  play(range: [number, number]): Promise<boolean>;
  pause(): void;
  seek(seconds: number): void;
  setStoryOwnership(owned: boolean): void;
  applyStaticPose(): void;
  dispose(): void;
}

export function clipTime(clip: Clip, progress: number) {
  if (!Number.isFinite(progress) || !Number.isFinite(clip.start) || !Number.isFinite(clip.end) || clip.start < 0 || clip.end <= clip.start) {
    throw new Error('Motion requires finite progress and an ordered, positive clip range.');
  }
  return clip.start + Math.min(1, Math.max(0, progress)) * (clip.end - clip.start);
}
