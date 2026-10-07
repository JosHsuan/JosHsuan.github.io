/** Local Studio only. This file is excluded from every review/runtime artifact. */
import studioPackage from '@theatre/studio';
import * as exportedCore from '@theatre/core';
const studio = studioPackage.default ?? studioPackage;
const core = exportedCore.default ?? exportedCore;
studio.initialize();
const saved = await fetch('/state.json').then(response => response.json());
const project = core.getProject('uiux.spatial-score.v1', { state: saved });
const sheet = project.sheet('Main');
const pose = sheet.object('Pose', { camera: { position: { x: 4.8, y: 3.2, z: 6.8 }, target: { x: 0, y: 0, z: 0 }, fov: core.types.number(35, { range: [10, 100] }) }, assemblyProgress: core.types.number(0, { range: [0, 1] }) });
await project.ready; studio.setSelection([pose]);
const checkpoints = [
  [0, 0, 4.8, 3.2, 6.8], [.4, .05, 4.6, 3.1, 6.7], [1.2, .38, 3.2, 3.6, 7.4],
  [2.4, 1, -1.8, 4.2, 8.2], [3.6, .88, -3.8, 3.7, 7.4], [4.8, 0, 4.8, 3.2, 6.8],
];
document.querySelector('#capture').onclick = () => {
  sheet.sequence.pause();
  for (const [time, progress, x, y, z] of checkpoints) {
    sheet.sequence.position = time;
    studio.transaction(({ set }) => { set(pose.props.assemblyProgress, progress); set(pose.props.camera.position, { x, y, z }); });
  }
  sheet.sequence.position = 0;
  document.querySelector('#status').textContent = 'Six poses captured through Studio transactions. Verify assemblyProgress and all three camera position tracks before export.';
};
document.querySelector('#play').onclick = () => { sheet.sequence.position = 0; void sheet.sequence.play({ range: [0, 4.8], iterationCount: 1 }); };
pose.onValuesChange(value => { document.querySelector('#drawing').textContent = JSON.stringify(value, null, 2); });
document.querySelector('#export').onclick = () => {
  const state = studio.createContentOfSaveFile(project.address.projectId);
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'spatial-motion.state.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
