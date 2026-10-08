import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

export async function auditPages() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const out = path.join(root, '.pages-workspace/out');
  const manifest = JSON.parse(await readFile(path.join(root, 'roles/uiux-designer/cases/bending-active-thesis/release/manifest.json'), 'utf8'));
  const expected = new Map(manifest.assets.map(asset => [asset.path, asset]));
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, {withFileTypes: true})) {
      assert(!entry.isSymbolicLink(), 'No links in the deployment artifact');
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file); else files.push(file);
    }
  }
  await walk(out);
  for (const file of files) {
    const relative = path.relative(out, file).replaceAll('\\', '/');
    assert(!/\.(3dm|sql|map|private\.[^/]+)$|(^|\/)(content|research|verification|node_modules)\//i.test(relative), 'Private/editor artifact: ' + relative);
    const bytes = await readFile(file);
    if (relative.startsWith('assets/') || relative.startsWith('licenses/')) {
      const asset = expected.get(relative); assert(asset, 'Unapproved asset: ' + relative);
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, relative);
      expected.delete(relative);
    }
    if (/\.(html|js|json|txt|css)$/.test(relative)) {
      const text = bytes.toString('utf8');
      assert(!/JosHsuan_Website|Window備份|portfolio-preparation|framing-hull\.private|@theatre\/studio|sourceObjectId|sourceGroups/.test(text), 'Private source information: ' + relative);
    }
  }
  assert.equal(expected.size, 0, 'Missing approved public assets');
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  assert(html.includes('Bending-Active')); assert(!html.includes('noindex'));
  assert.equal((html.match(/data-story-chapter=/g) || []).length, 7);
  assert(html.includes('https://joshsuan.github.io/'));
  console.log(`Public release audit passed: ${files.length} output files, ${manifest.assets.length} approved assets; no private inputs.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await auditPages();
