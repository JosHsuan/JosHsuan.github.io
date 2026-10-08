import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const revision = '9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8';
const manifestPath = path.join(here, 'source-verification.json');
const sha = data => createHash('sha256').update(data).digest('hex');
const files = [
  'src/cameras/PerspectiveCamera.js',
  'src/textures/DepthTexture.js',
  'examples/jsm/postprocessing/BokehPass.js',
  'examples/jsm/shaders/BokehShader.js',
  'examples/jsm/effects/AsciiEffect.js',
  'examples/jsm/postprocessing/OutputPass.js',
  'LICENSE',
];
const pkg = JSON.parse(await readFile(path.join(root, 'node_modules/three/package.json'), 'utf8'));
assert.equal(pkg.version, '0.186.1', 'Read the source for the exact installed Three version.');

if (process.argv.includes('--refresh')) {
  const records = [];
  for (const file of files) {
    const local = await readFile(path.join(root, 'node_modules/three', file));
    const url = `https://raw.githubusercontent.com/mrdoob/three.js/${revision}/${file}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
    assert.ok(response.ok, `${file}: upstream HTTP ${response.status}`);
    const upstream = Buffer.from(await response.arrayBuffer());
    records.push({file, installedSHA256: sha(local), upstreamUrl: url, upstreamSHA256: sha(upstream), byteIdentical: sha(local) === sha(upstream)});
  }
  const report = {
    checkedDate: '2026-10-08',
    role: '3d-artist / animation-cinematographer',
    installedPackage: 'three', version: pkg.version, upstreamRevision: revision,
    license: 'MIT; supplied package retains node_modules/three/LICENSE',
    evidenceScope: 'Read-only installed source versus pinned public upstream; no source code vendored, runtime shader compilation or visual acceptance claimed.',
    files: records,
  };
  await writeFile(manifestPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Recorded ${records.length} primary source comparisons; ${records.filter(x => x.byteIdentical).length} byte-identical.`);
} else {
  const report = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(report.version, pkg.version);
  assert.equal(report.upstreamRevision, revision);
  assert.deepEqual(report.files.map(item => item.file), files);
  for (const item of report.files) assert.equal(sha(await readFile(path.join(root, 'node_modules/three', item.file))), item.installedSHA256, item.file);
  console.log(`Verified ${files.length} installed source hashes for Three ${pkg.version}.`);
}
