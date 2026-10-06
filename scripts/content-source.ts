import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { createPublicSnapshot } from '../src/content/schema';
import { publicAssetUrl } from '../src/lib/paths';
import { sceneRegistry } from '../src/scenes/registry';

export async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in generated/public trees: ${entry.name}`);
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await filesUnder(path)); else paths.push(path);
  }
  return paths;
}

export async function readContentSource() {
  const read = async (path: string) => JSON.parse(await readFile(resolve(path), 'utf8')) as unknown;
  const [projects, research, profile, assets] = await Promise.all([
    read('content/projects/index.json'), read('content/research/index.json'), read('content/profile/index.json'), read('content/assets.manifest.json'),
  ]);
  const snapshot = createPublicSnapshot({ projects, research, profile, assets }, Object.keys(sceneRegistry));
  const publicRoot = resolve('public');
  const allowed = new Set<string>();
  for (const asset of snapshot.assets) {
    publicAssetUrl(asset.path, '');
    const path = resolve(publicRoot, `.${asset.path}`);
    if (!path.startsWith(publicRoot + sep)) throw new Error('Asset escaped public directory.');
    const hash = createHash('sha256').update(await readFile(path)).digest('hex');
    if (hash !== asset.sha256) throw new Error(`Asset hash mismatch: ${asset.id}`);
    allowed.add(path);
  }
  for (const definition of Object.values(sceneRegistry)) {
    if (!snapshot.assets.some((asset) => asset.path === definition.poster.path)) throw new Error('Scene poster must be in the approved asset manifest.');
  }
  for (const path of await filesUnder(publicRoot)) {
    const local = relative(publicRoot, path).replaceAll('\\', '/');
    if (local.endsWith('/.gitkeep') || local === '.nojekyll') continue;
    if (!allowed.has(path)) throw new Error(`Unlisted public asset: ${local}`);
  }
  return snapshot;
}
