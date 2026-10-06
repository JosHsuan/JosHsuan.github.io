import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { filesUnder, readContentSource } from './content-source';
import { motionManifestSchema } from '../src/motion/manifest';

const content = await readContentSource();
const manifests = (await filesUnder(resolve('src/scenes'))).filter((file) => file.endsWith('motion.manifest.json'));
for (const file of manifests) {
  const manifest = motionManifestSchema.parse(JSON.parse(await readFile(file, 'utf8')));
  const model = content.assets.find((asset) => asset.id === manifest.modelAssetId);
  if (!model || model.revision !== manifest.modelRevision) throw new Error(`Motion/model revision mismatch: ${file}`);
  const state = await readFile(resolve(dirname(file), 'motion.state.json'));
  JSON.parse(state.toString('utf8'));
  if (createHash('sha256').update(state).digest('hex') !== manifest.stateRevision) throw new Error(`Motion state hash mismatch: ${file}`);
}
console.log(`${manifests.length} motion manifests validated. Authored motion/checkpoint validation requires an actual scene.`);
