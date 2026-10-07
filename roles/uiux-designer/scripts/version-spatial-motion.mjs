import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const directory = new URL('../src/motion/theatre/spatial/', import.meta.url);
const bytes = await readFile(new URL('motion.state.json', directory));
const tracks = JSON.parse(bytes).sheetsById.Main.sequence.tracksByObject.Pose;
const points = [[0, 0, 4.8, 3.2, 6.8], [.4, .05, 4.6, 3.1, 6.7], [1.2, .38, 3.2, 3.6, 7.4], [2.4, 1, -1.8, 4.2, 8.2], [3.6, .88, -3.8, 3.7, 7.4], [4.8, 0, 4.8, 3.2, 6.8]];
const bindings = [['assemblyProgress'], ['camera', 'position', 'x'], ['camera', 'position', 'y'], ['camera', 'position', 'z']];
for (const [index, binding] of bindings.entries()) {
  const frames = tracks.trackData[tracks.trackIdByPropPath[JSON.stringify(binding)]]?.keyframes;
  if (!frames || frames.length !== 6 || points.some(point => !frames.some(frame => Math.abs(frame.position - point[0]) < 1e-8 && frame.value === point[index + 1]))) throw new Error(`Missing authored spatial track: ${binding.join('.')}`);
}
await writeFile(new URL('motion.manifest.json', directory), JSON.stringify({ schemaVersion: 1, role: 'uiux-designer', projectId: 'uiux.spatial-score.v1', sheetId: 'Main', core: '0.7.2', studio: '0.7.2', stateRevision: createHash('sha256').update(bytes).digest('hex'), clips: { spatial: { start: 0, end: 4.8 } }, requiredBindings: bindings.map(binding => `Pose.${binding.join('.')}`), checkpoints: points, authoredAt: '2026-10-07', provenance: 'Seeded from the earlier genuine UIUX section Studio export. Camera position sequenced with the real Studio Sequence all menu. Six designed poses captured with studio.transaction and downloaded with createContentOfSaveFile. No hand-written keyframes.' }, null, 2) + '\n');
console.log('Versioned actual Studio export: four tracks, six checkpoints, 24 authored keyframes.');
