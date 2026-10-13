import {mkdir, readdir, realpath, rm, lstat} from 'node:fs/promises';
import path from 'node:path';

export async function preparePagesWorkspace(root) {
  root = await realpath(root);
  const work = path.join(root, '.pages-workspace');
  await mkdir(work, {recursive: true});
  if ((await lstat(work)).isSymbolicLink() || await realpath(work) !== work) throw Error('Unexpected Pages workspace target');
  // Keep only Next's compiler cache. Stale app/public/output files are always
  // removed, and no cached output is eligible for publication.
  for (const entry of await readdir(work, {withFileTypes: true})) {
    const target = path.join(work, entry.name);
    if (path.dirname(target) !== work) throw Error('Workspace path escaped');
    if (entry.name === '.next' && entry.isDirectory() && !entry.isSymbolicLink()) {
      for (const child of await readdir(target, {withFileTypes: true})) {
        const filename = path.join(target, child.name);
        if (path.dirname(filename) !== target) throw Error('Cache path escaped');
        if (child.name === 'cache' && child.isDirectory() && !child.isSymbolicLink()) continue;
        await rm(filename, {recursive: true, force: true});
      }
    } else await rm(target, {recursive: true, force: true});
  }
  return work;
}
