import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {preflightSelection, preflightArguments} from '../../scripts/ci-preflight.mjs';

const valid = {GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF_TYPE: 'branch',
  GITHUB_REF_NAME: 'preflight/scroll-camera', GITHUB_REF: 'refs/heads/preflight/scroll-camera',
  GITHUB_SHA: 'a'.repeat(40), GITHUB_RUN_ID: '123', PREFLIGHT_BROWSER: 'chromium',
  PREFLIGHT_TESTS: 'tests/pages/typography.spec.mjs'};

test('preflight is pinned, allowlisted and explicitly nonpublishable', () => {
  const plan = preflightSelection({...valid, PREFLIGHT_TESTS: `${valid.PREFLIGHT_TESTS}, tests/pages/public-release.spec.mjs\n${valid.PREFLIGHT_TESTS}`});
  assert.equal(plan.publishable, false);
  assert.equal(plan.commit, valid.GITHUB_SHA);
  assert.equal(plan.files.length, 2);
  assert.deepEqual(preflightArguments(plan).slice(-2), plan.files);
  for (const browser of ['chromium', 'webkit', 'mobile-chromium'])
    assert.equal(preflightSelection({...valid, PREFLIGHT_BROWSER: browser}).engine, browser === 'webkit' ? 'webkit' : 'chromium');
});

test('preflight rejects noncandidate, malformed and injection refs', () => {
  for (const branch of ['main', 'preflight', 'preflight/', 'preflightish/a', 'preflight/.a', 'preflight/a..b', 'preflight/a//b',
    'preflight/a.lock', 'preflight/a.', 'preflight/a b', 'preflight/a;echo', 'preflight/a$(echo)', 'preflight/a\\b'])
    assert.throws(() => preflightSelection({...valid, GITHUB_REF_NAME: branch, GITHUB_REF: `refs/heads/${branch}`}));
  for (const override of [{GITHUB_EVENT_NAME:'push'}, {GITHUB_REF_TYPE:'tag'}, {GITHUB_REF:'refs/heads/main'},
    {GITHUB_RUN_ID:''}, {GITHUB_RUN_ID:'1;echo'}, {GITHUB_SHA:'abc'}, {GITHUB_SHA:'g'.repeat(40)}, {GITHUB_SHA:'a'.repeat(40)+';echo'}])
    assert.throws(() => preflightSelection({...valid, ...override}));
});

test('preflight rejects unknown paths, profiles and shell payloads', () => {
  for (const selection of ['', ' ', 'tests/pages/missing.spec.mjs', '../tests/pages/typography.spec.mjs',
    '/tests/pages/typography.spec.mjs', '--grep=.*', 'tests/pages/typography.spec.mjs;echo',
    '$(echo tests/pages/typography.spec.mjs)', 'tests/pages/*.spec.mjs'])
    assert.throws(() => preflightSelection({...valid, PREFLIGHT_TESTS:selection}));
  for (const browser of ['', 'firefox', 'constructor', '__proto__', 'chromium;echo', 'chromium --grep x'])
    assert.throws(() => preflightSelection({...valid, PREFLIGHT_BROWSER:browser}));
});

test('workflow is manual-only, read-only, candidate-pinned and contains no publication artifact', () => {
  const source = readFileSync(new URL('../../.github/workflows/preflight.yml', import.meta.url), 'utf8');
  assert.match(source, /on:\n  workflow_dispatch:/);
  assert.doesNotMatch(source, /^  (push|pull_request|workflow_run|schedule):/m);
  assert.match(source, /permissions:\n  contents: read\nconcurrency:/);
  assert.match(source, /ref: \$\{\{ github.sha \}\}/);
  assert.match(source, /persist-credentials: false/);
  assert.doesNotMatch(source, /validated-release|static-export-pages|publishable: true|pages: write|id-token: write|secrets\./);
  assert.doesNotMatch(source, /run:.*inputs\./);
  assert.match(source, /name: preflight-\$\{\{ github.run_id \}\}/);
  assert.match(source, /pnpm install --frozen-lockfile/);
});


test('runner refuses a checkout other than the exact dispatched SHA before building', () => {
  const result = spawnSync(process.execPath, ['scripts/ci-preflight.mjs', 'plan'], {
    cwd: new URL('../../', import.meta.url), env: {...process.env, ...valid}, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Checkout does not match dispatched candidate SHA/);
});
