import type { MotionMode, PlayheadDriver, SceneMotionController } from '@/motion/contracts';

export class SceneDirector<Id extends string = string> {
  mode: MotionMode = 'static';
  driver: PlayheadDriver = 'paused';
  private disposed = false;
  private generation = 0;
  constructor(private readonly motion: SceneMotionController<Id>, private readonly setInspectionEnabled: (enabled: boolean) => void) {
    setInspectionEnabled(false);
  }
  setMode(mode: MotionMode) {
    if (this.disposed) return;
    this.generation++;
    this.driver = 'paused';
    this.setInspectionEnabled(false);
    this.motion.setMode(mode);
    this.mode = mode;
    if (mode === 'inspect') this.setInspectionEnabled(true);
  }
  async play(clip: Id) {
    if (this.disposed || this.mode !== 'story') return 'skipped' as const;
    const generation = ++this.generation;
    this.driver = 'time';
    try { return await this.motion.play(clip); }
    finally { if (generation === this.generation) this.driver = 'paused'; }
  }
  seekFromScroll(clip: Id, progress: number) {
    if (this.disposed || this.mode !== 'story' || this.driver === 'time') return;
    this.driver = 'scroll';
    this.motion.seek(clip, progress);
  }
  pause() { this.generation++; this.motion.pause(); this.driver = 'paused'; }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.driver = 'paused';
    this.setInspectionEnabled(false);
    this.motion.dispose();
  }
}
