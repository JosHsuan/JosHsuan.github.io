import { createTheatreController } from '../../../../../src/motion/theatre/createController.ts';
import state from './motion.state.json';
import manifest from './motion.manifest.json';
export const staticPose = { camera:{position:{x:4.8,y:3.2,z:6.8},target:{x:0,y:0,z:0},fov:35},assemblyProgress:0 };
export function createInspectionScore(applyPose,invalidate) {
  return createTheatreController({projectId:'cinema.inspection.v1',sheetId:'Main',stateRevision:manifest.stateRevision,state,clips:{inspection:{start:0,end:4.8}},staticPose,applyPose,invalidate});
}
