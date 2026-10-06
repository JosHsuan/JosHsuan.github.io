import { types } from '@theatre/core';
import { createMotionController } from '../createController';
import type { Clip, ScenePose } from '../contracts';
import { acquireProject } from './projectRegistry';

export function createTheatreController<Id extends string>(options: {
  projectId: string;
  sheetId: string;
  stateRevision: string;
  state: unknown;
  clips: Record<Id, Clip>;
  staticPose: ScenePose;
  applyPose: (pose: ScenePose) => void;
  invalidate: () => void;
}) {
  const lease = acquireProject(options.projectId, options.stateRevision, options.state);
  const sheet = lease.project.sheet(options.sheetId);
  let ownsStory = false;
  let disposed = false;
  const pose = sheet.object('Pose', {
    camera: {
      position: options.staticPose.camera.position,
      target: options.staticPose.camera.target,
      fov: types.number(options.staticPose.camera.fov, { range: [10, 100] }),
    },
    assemblyProgress: types.number(options.staticPose.assemblyProgress, { range: [0, 1] }),
  });
  const apply = (value: ScenePose) => { options.applyPose(value); options.invalidate(); };
  const unsubscribe = pose.onValuesChange((value) => { if (!disposed && ownsStory) apply(value); });
  return createMotionController({
    ready: lease.project.ready,
    play: (range) => sheet.sequence.play({ range, iterationCount: 1 }),
    pause: () => sheet.sequence.pause(),
    seek: (seconds) => { sheet.sequence.position = seconds; if (ownsStory) apply(pose.value); },
    setStoryOwnership(owned) { ownsStory = owned; if (owned && !disposed) apply(pose.value); },
    applyStaticPose: () => apply(options.staticPose),
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      sheet.detachObject('Pose');
      lease.release();
    },
  }, options.clips);
}
