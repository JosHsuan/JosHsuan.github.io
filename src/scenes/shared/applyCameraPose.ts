import type { PerspectiveCamera } from 'three';
import type { ScenePose } from '@/motion/contracts';

/** Call only while the story owns the camera; controls own it during inspection. */
export function applyCameraPose(camera: PerspectiveCamera, pose: ScenePose['camera']) {
  camera.position.set(pose.position.x, pose.position.y, pose.position.z);
  camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
  if (camera.fov !== pose.fov) { camera.fov = pose.fov; camera.updateProjectionMatrix(); }
}
