import { createTheatreController } from '@/motion/theatre/createController';
import state from './motion.state.json';
import manifest from './motion.manifest.json';
export const staticPose = { camera: { position: { x: 4.8, y: 3.2, z: 6.8 }, target: { x: 0, y: 0, z: 0 }, fov: 35 }, assemblyProgress: 0 };
export function spatialScore(applyPose, invalidate) {
  return createTheatreController({ projectId: manifest.projectId, sheetId: manifest.sheetId, stateRevision: manifest.stateRevision, state, clips: manifest.clips, staticPose, applyPose, invalidate });
}
