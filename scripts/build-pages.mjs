import {readFile, writeFile, mkdir, copyFile, rm, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync, execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {auditPages} from './audit-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'roles/uiux-designer/cases/bending-active-thesis');
const release = path.join(source, 'release');
const work = path.join(root, '.pages-workspace');
const digest = data => createHash('sha256').update(data).digest('hex');
assert.equal(process.version, 'v24.19.0', 'Use the exact committed Node version');
const manifest = JSON.parse(await readFile(path.join(release, 'manifest.json'), 'utf8'));
const story = await readFile(path.join(release, 'story.json'));
assert.equal(digest(story), manifest.storySHA256);
// Verify the complete public handoff before replacing generated workspace files.
for (const asset of manifest.assets) {
  assert.match(asset.path, /^(assets|licenses)\/[a-zA-Z0-9/._-]+$/);
  assert(!asset.path.split('/').includes('..'));
  const filename = path.join(release, 'public', asset.path);
  assert((await realpath(filename)).startsWith(path.join(release, 'public') + path.sep));
  const bytes = await readFile(filename);
  assert.equal(bytes.length, asset.bytes); assert.equal(digest(bytes), asset.sha256, asset.path);
}
assert.equal(path.dirname(path.resolve(work)), path.resolve(root));
assert.equal(path.basename(work), '.pages-workspace');
await rm(work, {recursive: true, force: true});
await mkdir(work, {recursive: true});
const sources = [
  'app/page.jsx', 'app/layout.jsx', 'app/globals.css', 'app/page.module.css',
  'components/CinematicExperience.jsx', 'components/CinematicScene.jsx',
  'components/EvidenceInspector.jsx', 'components/evidence-inspector.module.css',
  'components/cinematic.module.css', 'components/story-input.js', 'components/story-response.mjs',
  'components/element-score.mjs', 'components/optical-score.mjs', 'components/scene-compositor.mjs',
  'components/scene-direction.mjs', 'components/vendor/cinematic-plan.mjs',
  'components/exhibition-stage.mjs', 'components/editorial-score.mjs',
  'components/materials/cinematic-material.js', 'release/story.json',
];
for (const relative of sources) {
  await mkdir(path.dirname(path.join(work, relative)), {recursive: true});
  await copyFile(path.join(source, relative), path.join(work, relative));
}
for (const asset of manifest.assets) {
  const destination = path.join(work, 'public', asset.path);
  await mkdir(path.dirname(destination), {recursive: true});
  await copyFile(path.join(release, 'public', asset.path), destination);
}
await writeFile(path.join(work, 'next.config.mjs'), `import config from '../roles/uiux-designer/cases/bending-active-thesis/next.config.mjs';\nimport {fileURLToPath} from 'node:url';\nexport default {...config, outputFileTracingRoot:fileURLToPath(new URL('../',import.meta.url))};\n`);
await writeFile(path.join(work, 'public/.nojekyll'), '');
await writeFile(path.join(work, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${manifest.origin}/sitemap.xml\n`);
await writeFile(path.join(work, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${manifest.origin}/</loc></url></urlset>\n`);
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
await writeFile(path.join(work, 'public/release.json'), JSON.stringify({release: manifest.id, commit, modelRevision: 'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e'}) + '\n');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', work, '--webpack'], {cwd: root, stdio: 'inherit', env: {...process.env, THESIS_PUBLIC_RELEASE: '1', NEXT_PUBLIC_BASE_PATH: '', NEXT_TELEMETRY_DISABLED: '1'}});
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Public static build failed');
await auditPages();
