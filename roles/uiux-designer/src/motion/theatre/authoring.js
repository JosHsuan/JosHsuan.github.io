/** Isolated UIUX Studio entry; never part of the portfolio or gallery runtime. */
import studioPackage from '@theatre/studio';
import * as exportedCore from '@theatre/core';
import poseDefaults from './pose.json';
import { sectionDrawing } from '../../specimens/section-geometry.js';
const studio = studioPackage.default ?? studioPackage;
const core = exportedCore.default ?? exportedCore;
studio.initialize();
const saved = await fetch('/state.json').then(response => response.json());
const project = core.getProject('uiux.section-study.v1', saved ? { state: saved } : undefined);
const sheet = project.sheet('Main');
const pose = sheet.object('Pose', { camera: { ...poseDefaults.camera, fov: core.types.number(45, { range: [10, 100] }) }, assemblyProgress: core.types.number(0, { range: [0, 1] }) });
await project.ready;
studio.setSelection([pose]);
const drawing = sectionDrawing(document.querySelector('#drawing'));
pose.onValuesChange(value => drawing.apply(value.assemblyProgress));
function capture(time, amount) { sheet.sequence.pause(); sheet.sequence.position = time; studio.transaction(({ set }) => set(pose.props.assemblyProgress, amount)); document.querySelector('#status').textContent = `Captured ${amount} at ${time}s. Verify the actual sequenced track.`; }
document.querySelector('#start').onclick = () => capture(0, 0);
document.querySelector('#spread').onclick = () => capture(1.2, 1);
document.querySelector('#end').onclick = () => capture(2.4, 0);
document.querySelector('#play').onclick = () => { sheet.sequence.position = 0; void sheet.sequence.play({ range: [0, 2.4], iterationCount: 1 }); };
document.querySelector('#export').onclick = () => { const state = studio.createContentOfSaveFile(project.address.projectId); const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2) + '\n'], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'motion.state.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
