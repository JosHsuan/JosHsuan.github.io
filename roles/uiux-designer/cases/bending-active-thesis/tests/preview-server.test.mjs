import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer, request} from 'node:http';
import {mkdtemp, mkdir, writeFile, readFile, rm, symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createPreviewHandler, negotiateEncoding} from '../scripts/serve.mjs';

let fixture, publicRoot, server, port;
const payload = Buffer.from('Binary transport fixture — no project geometry.\n'.repeat(4096));
before(async () => {
  fixture = await mkdtemp(path.join(os.tmpdir(), 'thesis-preview-http-'));
  publicRoot = path.join(fixture, 'public');
  await mkdir(publicRoot);
  await Promise.all(['index.html', 'payload.glb', 'light.hdr', 'script.js', 'style.css', 'record.json', 'image.webp'].map(name => writeFile(path.join(publicRoot, name), payload)));
  await writeFile(path.join(fixture, 'private.txt'), 'Outside the served directory');
  server = createServer(createPreviewHandler(publicRoot));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(async () => {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (fixture) {
    const resolved = path.resolve(fixture), temporaryRoot = path.resolve(os.tmpdir());
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert.ok(path.basename(resolved).startsWith('thesis-preview-http-'));
    await rm(resolved, {recursive: true, force: true});
  }
});
function http(url, {method = 'GET', encoding, host = '127.0.0.1:4184'} = {}) {
  return new Promise((resolve, reject) => {
    const headers = {Host: host};
    if (encoding !== undefined) headers['Accept-Encoding'] = encoding;
    const req = request({hostname: '127.0.0.1', port, path: url, method, headers, agent: false}, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks)}));
    });
    req.on('error', reject); req.end();
  });
}

test('gzip and identity negotiation honours explicit q=0, wildcard, preferences and empty headers', () => {
  for (const [header, expected] of [[undefined, 'identity'], ['', 'identity'], ['gzip', 'gzip'], ['br, GZip; q=0.8', 'gzip'], ['gzip;q=0, *;q=1', 'identity'], ['*;q=0.5', 'gzip'], ['gzip;q=0.3, identity;q=0.8', 'identity'], ['gzip;q=1, identity;q=0', 'gzip'], ['gzip;q=0, identity;q=0', null], ['*;q=0', null], ['gzip;q=0, gzip;q=1', 'identity'], ['gzip;q=bogus', 'identity'], ['gzip;q=1.2', 'identity']]) {
    assert.equal(negotiateEncoding(header, true), expected, header);
  }
  assert.equal(negotiateEncoding('gzip', false), 'identity');
  assert.equal(negotiateEncoding('gzip, identity;q=0', false), null);
});

test('real gzip HTTP responses round-trip GLB/HDR/text bytes and retain exact byte lengths and privacy headers', async () => {
  for (const filename of ['payload.glb', 'light.hdr', 'script.js', 'style.css', 'record.json', 'index.html']) {
    const response = await http('/' + filename, {encoding: 'gzip'});
    assert.equal(response.status, 200); assert.equal(response.headers['content-encoding'], 'gzip');
    assert.equal(response.headers.vary, 'Accept-Encoding');
    assert.equal(response.headers['content-length'], String(response.body.length));
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.headers['x-robots-tag'], 'noindex, nofollow, noarchive');
    assert.deepEqual(gunzipSync(response.body), payload);
    assert.deepEqual(await readFile(path.join(publicRoot, filename)), payload);
    assert.ok(response.body.length < payload.length);
  }
});

test('HEAD returns the selected GET headers with no body for both gzip and raw variants', async () => {
  for (const encoding of ['gzip', 'gzip;q=0']) {
    const get = await http('/payload.glb', {encoding}), head = await http('/payload.glb', {method: 'HEAD', encoding});
    assert.equal(head.status, get.status); assert.equal(head.body.length, 0);
    for (const name of ['content-length', 'content-encoding', 'content-type', 'vary', 'cache-control', 'x-robots-tag']) assert.equal(head.headers[name], get.headers[name]);
  }
});

test('raw fallback and already compressed images are never double-compressed; unavailable representation returns 406', async () => {
  for (const url of ['/payload.glb', '/image.webp']) {
    const response = await http(url, {encoding: url.endsWith('.webp') ? 'gzip' : 'gzip;q=0, *;q=1'});
    assert.equal(response.status, 200); assert.equal(response.headers['content-encoding'], undefined);
    assert.equal(response.headers['content-length'], String(payload.length)); assert.deepEqual(response.body, payload);
  }
  const unacceptable = await http('/payload.glb', {encoding: 'gzip;q=0, identity;q=0'});
  assert.equal(unacceptable.status, 406);
  const image = await http('/image.webp', {encoding: 'gzip, identity;q=0'});
  assert.equal(image.status, 406);
});

test('exact Host, method and lexical path containment remain enforced', async () => {
  assert.equal((await http('/', {host: 'localhost:4184'})).status, 403);
  assert.equal((await http('/', {host: '127.0.0.1:' + port})).status, 403);
  assert.equal((await http('/', {method: 'POST'})).status, 403);
  assert.equal((await http('/..%2fprivate.txt')).status, 403);
  assert.equal((await http('/%2e%2e%5cprivate.txt')).status, process.platform === 'win32' ? 403 : 404);
  assert.equal((await http('/missing.glb')).status, 404);
  const malformed = await http('/%zz'); assert.equal(malformed.status, 404);
});

test('resolved path containment rejects a directory link escaping the served root', async t => {
  const outside = path.join(fixture, 'outside');
  await mkdir(outside); await writeFile(path.join(outside, 'private.txt'), 'Outside the served directory');
  try { await symlink(outside, path.join(publicRoot, 'escape'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (error.code === 'EPERM') return t.skip('Host does not permit symlink creation'); throw error; }
  assert.equal((await http('/escape/private.txt')).status, 403);
});

test('new build bytes are read afresh rather than returned from a stale compression cache', async () => {
  const filename = path.join(publicRoot, 'mutable.json');
  await writeFile(filename, 'First version');
  const first = await http('/mutable.json', {encoding: 'gzip'});
  await writeFile(filename, 'A changed build version with a different byte count');
  const second = await http('/mutable.json', {encoding: 'gzip'});
  assert.equal(gunzipSync(first.body).toString(), 'First version');
  assert.equal(gunzipSync(second.body).toString(), 'A changed build version with a different byte count');
});
