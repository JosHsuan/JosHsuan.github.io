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
    assert(!/\.(3dm|psd|psb|ai|sql|map|private\.[^/]+)$|(^|\/)(content|research|verification|node_modules)\//i.test(relative), 'Private/editor artifact: ' + relative);
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
  assert.equal((html.match(/data-story-chapter=/g) || []).length, 0, 'Home must not scroll into a case');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, 'One personal introduction heading');
  assert(html.includes('data-home-introduction'), 'Public introduction is present');
  assert(html.includes('data-home-project-link') && html.includes('href="#projects"'), 'Native introduction-to-project-index link');
  assert(!html.includes('data-cinematic-stage'), 'Home does not mount the case stage');
  const introduction=html.match(/<section id="about"[\s\S]*?<\/section>/)?.[0];
  assert(introduction&&!/model-poster|<canvas|data-project-model-preview/.test(introduction), 'Home introduction stays model-free');
  assert.equal((html.match(/data-project-card=/g)||[]).length,2,'Only selected evidence-backed projects');
  for(const route of ['about','projects','contact','projects/bending-active','projects/xr-bending-active']){
    const page=await readFile(path.join(out,route,'index.html'),'utf8');
    assert.equal((page.match(/<h1[ >]/g)||[]).length,1,`${route}: one heading`);
    assert(!page.includes('noindex'),route);
    assert(page.includes(`${manifest.origin}/${route}/`),`${route}: canonical`);
    if(route==='projects/bending-active')assert.equal((page.match(/data-story-chapter=/g)||[]).length,7);
    else {
      assert(!page.includes('data-cinematic-stage'),`${route}: no case runtime stage`);
      if(route!=='projects')assert(!page.includes('model-poster'),`${route}: no unrelated model`);
    }
  }
  const xr=await readFile(path.join(out,'projects/xr-bending-active/index.html'),'utf8');
  for(const marker of ['data-xr-study','xr-context','xr-method','xr-prototype','xr-contribution','xr-limits','xr-credits','Wataru Nomura'])assert(xr.includes(marker),`XR: ${marker}`);
  assert(html.includes('https://joshsuan.github.io/'));
  console.log(`Public release audit passed: ${files.length} output files, ${manifest.assets.length} approved assets; no private inputs.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await auditPages();
