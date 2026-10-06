import { clipTime, type Clip, type MotionDriver, type MotionMode, type PlayResult, type SceneMotionController } from './contracts';

export function createMotionController<Id extends string>(driver: MotionDriver, clips: Record<Id, Clip>): SceneMotionController<Id> {
  let disposed = false;
  let ready = false;
  let mode: MotionMode = 'static';
  let cancelPending: (() => void) | undefined;
  let pendingSeek: number | undefined;
  for (const clip of Object.values<Clip>(clips)) clipTime(clip, 0);
  const assertLive = () => { if (disposed) throw new Error('Motion controller has been disposed.'); };
  const getClip = (id: Id) => { const clip = clips[id]; if (!clip) throw new Error(`Unknown clip: ${id}`); return clip; };
  const pause = () => {
    cancelPending?.();
    cancelPending = undefined;
    pendingSeek = undefined;
    driver.pause();
  };
  driver.setStoryOwnership(false);
  driver.applyStaticPose();

  const controller: SceneMotionController<Id> = {
    ready: driver.ready.then(() => {
      if (disposed) return;
      ready = true;
      driver.setStoryOwnership(mode === 'story');
      if (mode === 'static') driver.applyStaticPose();
      if (mode === 'story' && pendingSeek !== undefined) { driver.seek(pendingSeek); pendingSeek = undefined; }
    }),
    setMode(next) {
      assertLive();
      pause();
      mode = next;
      driver.setStoryOwnership(next === 'story');
      if (next === 'static') driver.applyStaticPose();
    },
    play(id, { signal } = {}) {
      assertLive();
      const clip = getClip(id);
      pause();
      if (signal?.aborted) return Promise.resolve('cancelled');
      if (mode !== 'story') return Promise.resolve('skipped');
      return new Promise<PlayResult>((resolve, reject) => {
        let settled = false;
        const finish = (result: PlayResult | Error) => {
          if (settled) return;
          settled = true;
          signal?.removeEventListener('abort', abort);
          if (cancelPending === cancel) cancelPending = undefined;
          if (result instanceof Error) reject(result); else resolve(result);
        };
        const cancel = () => finish('cancelled');
        const abort = () => { if (!settled) { cancel(); driver.pause(); } };
        cancelPending = cancel;
        signal?.addEventListener('abort', abort, { once: true });
        controller.ready.then(async () => {
          if (settled || disposed || mode !== 'story') return;
          driver.seek(clip.start);
          const completed = await driver.play([clip.start, clip.end]);
          finish(completed ? 'completed' : 'cancelled');
        }).catch((error: unknown) => finish(error instanceof Error ? error : new Error(String(error))));
      });
    },
    pause() { if (!disposed) pause(); },
    seek(id, progress) {
      assertLive();
      const seconds = clipTime(getClip(id), progress);
      pause();
      if (mode !== 'story') return;
      if (ready) driver.seek(seconds); else pendingSeek = seconds;
    },
    applyStaticPose() { controller.setMode('static'); },
    dispose() {
      if (disposed) return;
      disposed = true;
      pause();
      driver.setStoryOwnership(false);
      driver.dispose();
    },
  };
  return controller;
}
