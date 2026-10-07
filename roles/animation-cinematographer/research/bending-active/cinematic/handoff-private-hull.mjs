import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const cameraURL = new URL('../../../src/bending-active/cinematic-plan.mjs', import.meta.url);
const rolePrivate = new URL('../../../src/bending-active/framing-hull.private.mjs', import.meta.url);
const casePrivate = new URL('../../../../uiux-designer/cases/bending-active-thesis/components/vendor/framing-hull.private.mjs', import.meta.url);
const work = 'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/cinema-review';
const sha = value => createHash('sha256').update(value).digest('hex');

/** Explicit local handoff. Private geometry is always prepared in D: first. */
export async function handoffPrivateHull(record) {
  const camera = await readFile(cameraURL, 'utf8');
  if (!camera.includes(`THESIS_MODEL_REVISION = '${record.modelSHA256}'`)) throw new Error('Camera revision does not match the existing measured geometry record');
  if (!Array.isArray(record.vertices) || record.vertices.length < 4 || !record.vertices.every(p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite))) throw new Error('Invalid recorded support vertices');
  const content = `// Private model-derived framing support. Local review only; keep gitignored.\n// Model SHA-256: ${record.modelSHA256}\n// Prepared in D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/cinema-review.\nexport const THESIS_FRAMING_HULL = Object.freeze(${JSON.stringify(record.vertices)}.map(point => Object.freeze(point)));\n`;
  const prepared = `${work}/framing-hull.private.mjs`;
  await mkdir(work, { recursive: true });
  await writeFile(prepared, content);
  const handoffs = [];
  for (const target of [rolePrivate, casePrivate]) {
    await mkdir(path.dirname(fileURLToPath(target)), { recursive: true });
    await copyFile(prepared, target);
    const copied = await readFile(target);
    assert.equal(sha(copied), sha(content));
    handoffs.push({ path: fileURLToPath(target), sha256: sha(copied) });
  }
  const report = { preparedAt: new Date().toISOString(), modelSHA256: record.modelSHA256, supportVertices: record.vertices.length, prepared, privateModuleSHA256: sha(content), handoffs };
  await writeFile(`${work}/private-hull-handoff.json`, JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const record = JSON.parse(await readFile(`${work}/convex-hull.json`, 'utf8'));
  const sourceBefore = await readFile(cameraURL, 'utf8');
  const migrate = process.argv.includes('--migrate-embedded');
  const samples = [];
  if (migrate) {
    const previous = await import(cameraURL.href + '?before-private-boundary');
    for (const aspect of [0.46, 0.7, 1, 16 / 9, 2.3]) for (let i = 0; i <= 28; i++) for (const pointer of [{ x: -1, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 1 }]) samples.push({ u: i / 28, aspect, pointer, pose: previous.sampleCinematicPose(i / 28, aspect, pointer) });
  }
  const report = await handoffPrivateHull(record);
  if (migrate) {
    const replacement = "import { THESIS_FRAMING_HULL } from './framing-hull.private.mjs';\nexport { THESIS_FRAMING_HULL };";
    const next = sourceBefore.replace(/\/\/ BEGIN MEASURED THESIS HULL[\s\S]*?\/\/ END MEASURED THESIS HULL/, replacement);
    if (next === sourceBefore) throw new Error('Embedded support marker missing; refuse unrelated source edits');
    await writeFile(cameraURL, next);
    const after = await import(cameraURL.href + '?after-private-boundary');
    for (const sample of samples) assert.deepEqual(after.sampleCinematicPose(sample.u, sample.aspect, sample.pointer), sample.pose);
    Object.assign(report, { previousCameraSHA256: sha(sourceBefore), currentCameraSHA256: sha(next), unchangedPoseSamples: samples.length, geometryRecomputed: false });
    await writeFile(`${work}/private-hull-boundary-verification.json`, JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify(report, null, 2));
}
