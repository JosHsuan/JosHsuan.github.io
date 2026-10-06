import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { filesUnder, readContentSource } from './content-source';

const root = resolve('out');
const files = await filesUnder(root);
const snapshot = await readContentSource();
const routes = ['index.html', 'projects/index.html', 'research/index.html', 'about/index.html', 'contact/index.html', '404.html'];
for (const route of routes) if (!files.includes(resolve(root, route))) throw new Error(`Missing exported route: ${route}`);
for (const path of files) {
  const name = relative(root, path).replaceAll('\\', '/');
  if (/(^|\/)(dev|authoring|content|docs)(\/|$)|\.map$|\.(blend|3dm|env|tsx?|ya?ml)$/.test(name)) throw new Error(`Unexpected public file: ${name}`);
  if (/\.(js|html|json|txt)$/.test(name)) {
    const text = await readFile(path, 'utf8');
    if (/@theatre\/studio|Theatre_Studio_PublicAPI|createContentOfSaveFile|__THEATREJS_STUDIO/.test(text)) throw new Error(`Studio marker in public output: ${name}`);
  }
}
for (const asset of snapshot.assets) {
  const bytes = await readFile(resolve(root, `.${asset.path}`));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Exported asset differs: ${asset.id}`);
}
await writeFile(resolve(root, '.nojekyll'), '');
console.log(`Public artifact audit passed: ${files.length} files; editor exclusion also enforced during webpack compilation.`);
