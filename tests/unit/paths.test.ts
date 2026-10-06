import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicAssetUrl, validateBasePath } from '../../src/lib/paths';
import { clipTime } from '../../src/motion/contracts';

test('root and subpath assets are prefixed once and unsafe paths are rejected', () => {
  assert.equal(publicAssetUrl('/models/model.glb', ''), '/models/model.glb');
  assert.equal(publicAssetUrl('/models/model.glb', '/portfolio'), '/portfolio/models/model.glb');
  for (const path of ['https://example.com/a.glb', '//models/a.glb', '/models/../file', '/models/%2e%2e/a', '/portfolio/models/a.glb']) assert.throws(() => publicAssetUrl(path));
  for (const base of ['/', '/..', '/a/b', '//a']) assert.throws(() => validateBasePath(base));
});
test('clip mapping clamps overshoot and rejects invalid values', () => {
  assert.equal(clipTime({ start: 2, end: 8 }, 0.5), 5);
  assert.equal(clipTime({ start: 2, end: 8 }, -1), 2);
  assert.equal(clipTime({ start: 2, end: 8 }, 2), 8);
  assert.throws(() => clipTime({ start: 8, end: 2 }, 0));
  assert.throws(() => clipTime({ start: 0, end: 2 }, NaN));
});
