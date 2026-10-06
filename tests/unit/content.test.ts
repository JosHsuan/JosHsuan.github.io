import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicSnapshot } from '../../src/content/schema';
const empty = { projects: [], research: [], profile: null, assets: [] };
test('empty content is valid and drafts never enter the snapshot', () => {
  assert.deepEqual(createPublicSnapshot(empty).projects, []);
  assert.deepEqual(createPublicSnapshot({ ...empty, projects: [{ id: 'draft', slug: 'draft', status: 'draft' }] }).projects, []);
});
test('private fields, duplicate slugs and incomplete publication fail closed', () => {
  const draft = { id: 'draft', slug: 'draft', status: 'draft' };
  assert.throws(() => createPublicSnapshot({ ...empty, projects: [{ ...draft, privatePath: 'private' }] }));
  assert.throws(() => createPublicSnapshot({ ...empty, projects: [draft, draft] }));
  assert.throws(() => createPublicSnapshot({ ...empty, projects: [{ ...draft, status: 'published' }] }));
});
