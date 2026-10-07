import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const role = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await readFile(path.join(role, 'catalog/materials.json'), 'utf8'));
const assets = JSON.parse(await readFile(path.join(role, 'catalog/assets.manifest.json'), 'utf8'));
if (catalog.role !== 'uiux-designer' || catalog.materials.length !== 26 || new Set(catalog.materials.map(item => item.id)).size !== 26) throw new Error('Material catalog scope mismatch');
for (const asset of assets) {
  const file = path.resolve(role, asset.path);
  if (!file.startsWith(role) || !asset.sha256) throw new Error('Asset path/hash missing');
  const bytes = await readFile(file);
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Asset hash mismatch: ${asset.path}`);
  if (asset.kind === 'font' && !['00010000', '4f54544f'].includes(bytes.subarray(0, 4).toString('hex'))) throw new Error('Invalid font payload');
  if (asset.licensePath) await stat(path.join(role, asset.licensePath));
}
for (const material of catalog.materials) {
  if (material.publicationApproval !== false || material.role !== 'uiux-designer' || !material.dependency || !material.tradeoff || !material.proposal) throw new Error('Incomplete proposal boundary');
  for (const file of [...material.assets, ...material.notices, ...material.sourceFiles]) await stat(path.join(role, file));
  for (const source of material.sources) if (!source.url.startsWith('https://')) throw new Error('Unsafe source URL');
}
const features = JSON.parse(await readFile(path.join(role, 'catalog/features.manifest.json'), 'utf8'));
const featureHTML = await readFile(path.join(role, 'dist/features/index.html'), 'utf8');
if (features.role !== 'uiux-designer' || features.publicationApproval !== false || features.features.length !== 6 || new Set(features.features.map(feature => feature.id)).size !== 6) throw new Error('Feature proposal boundary mismatch');
for (const feature of features.features) {
  if (!featureHTML.includes(`id="${feature.anchor}"`) || !feature.implemented || !feature.spatialVerb || !feature.basis.every(id => catalog.materials.some(material => material.id === id))) throw new Error(`Invalid feature reference: ${feature.id}`);
}
await stat(path.join(role, 'dist/features.js'));
const applied = JSON.parse(await readFile(path.join(role, 'catalog/applied-feedback.manifest.json'), 'utf8'));
const appliedMaterials = catalog.materials.filter(material => material.appliedFeedback);
if (applied.publicationApproval !== false || applied.role !== 'uiux-designer' || applied.materials.length !== 19 || appliedMaterials.length !== 19) throw new Error('Applied material proposal scope mismatch');
for (const entry of applied.materials) {
  const material = appliedMaterials.find(item => item.id === entry.id);
  if (!material || material.category !== entry.category || material.appliedFeedback.name !== entry.name || !entry.basis.every(id => catalog.materials.some(item => item.id === id && item.collection === 'spatial-feedback-v1'))) throw new Error(`Invalid applied feedback mapping: ${entry.id}`);
}
const manifest = JSON.parse(await readFile(path.join(role, 'src/motion/theatre/motion.manifest.json'), 'utf8'));
const stateBytes = await readFile(path.join(role, 'src/motion/theatre/motion.state.json'));
if (createHash('sha256').update(stateBytes).digest('hex') !== manifest.stateRevision) throw new Error('Motion export hash mismatch');
const state = JSON.parse(stateBytes.toString('utf8')); const pose = state.sheetsById.Main.sequence.tracksByObject.Pose;
const key = pose.trackIdByPropPath['["assemblyProgress"]'];
const frames = pose.trackData[key].keyframes;
for (const [position, value] of [[0, 0], [1.2, 1], [2.4, 0]]) if (!frames.some(frame => frame.position === position && frame.value === value)) throw new Error('Studio checkpoint missing');
const spatialManifest = JSON.parse(await readFile(path.join(role, 'src/motion/theatre/spatial/motion.manifest.json'), 'utf8'));
const spatialBytes = await readFile(path.join(role, 'src/motion/theatre/spatial/motion.state.json'));
if (createHash('sha256').update(spatialBytes).digest('hex') !== spatialManifest.stateRevision) throw new Error('Spatial score hash mismatch');
const spatialTracks = JSON.parse(spatialBytes).sheetsById.Main.sequence.tracksByObject.Pose;
for (const [index, binding] of [['assemblyProgress'], ['camera', 'position', 'x'], ['camera', 'position', 'y'], ['camera', 'position', 'z']].entries()) {
  const frames = spatialTracks.trackData[spatialTracks.trackIdByPropPath[JSON.stringify(binding)]]?.keyframes;
  if (!frames || frames.length !== 6 || spatialManifest.checkpoints.some(point => !frames.some(frame => Math.abs(frame.position - point[0]) < 1e-8 && frame.value === point[index + 1]))) throw new Error('Spatial Studio checkpoint missing');
}
const publicInputs = path.resolve(role, '../../content');
for (const relative of ['projects/index.json', 'research/index.json', 'assets.manifest.json']) if (JSON.parse(await readFile(path.join(publicInputs, relative), 'utf8')).length !== 0) throw new Error('A proposal entered production content');
if (JSON.parse(await readFile(path.join(publicInputs, 'profile/index.json'), 'utf8')) !== null) throw new Error('Profile was populated');
async function walk(directory) { const items = await readdir(directory, { withFileTypes: true }); return (await Promise.all(items.map(item => item.isDirectory() ? walk(path.join(directory, item.name)) : path.join(directory, item.name)))).flat(); }
const files = await walk(path.join(role, 'dist'));
for (const file of files) {
  const name = path.relative(path.join(role, 'dist'), file).replaceAll('\\', '/');
  if (/codex-home|config\.toml|catalog-server|authoring\.js|credentials|auth\.json/.test(name)) throw new Error(`Role/server internals exposed: ${name}`);
  if (name.endsWith('.js') && !name.startsWith('samples/')) { const text = await readFile(file, 'utf8'); if (/Theatre_Studio_PublicAPI|createContentOfSaveFile|__THEATREJS_STUDIO/.test(text)) throw new Error('Studio implementation entered the gallery'); }
}
console.log(`UIUX validation passed: ${catalog.materials.length} materials (${appliedMaterials.length} with applied feedback), ${features.features.length} connected features, ${assets.length} hashed/licensed files, actual Studio checkpoints, isolated public output, empty production content.`);
