import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
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
  const argv = preflightArguments(plan);
  assert.deepEqual(argv.slice(2, 2 + plan.files.length), plan.files);
  assert.deepEqual(argv.slice(-2), ['--project', plan.browser]);
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
  assert.match(source, /pnpm install --frozen-lockfile\n      - name: Validate pinned preflight CLI selection\n        run: node --test tests\/ci\/preflight\.test\.mjs\n      - run: pnpm build:pages/);
});


test('runner refuses a checkout other than the exact dispatched SHA before building', () => {
  const result = spawnSync(process.execPath, ['scripts/ci-preflight.mjs', 'plan'], {
    cwd: new URL('../../', import.meta.url), env: {...process.env, ...valid}, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Checkout does not match dispatched candidate SHA/);
});

test('all preflight profiles put positional files before the variadic project option', () => {
  for (const browser of ['chromium', 'webkit', 'mobile-chromium']) {
    const plan = preflightSelection({...valid, PREFLIGHT_BROWSER: browser,
      PREFLIGHT_TESTS: 'tests/pages/model-inspection.spec.mjs tests/pages/model-drag.spec.mjs'});
    assert.deepEqual(preflightArguments(plan), ['node_modules/@playwright/test/cli.js', 'test', ...plan.files,
      '--config', 'playwright.pages.config.mjs', '--project', browser]);
  }
});

const pinnedCLI = new URL('../../node_modules/@playwright/test/cli.js', import.meta.url);
for (const browser of ['chromium', 'webkit', 'mobile-chromium']) {
  test(`pinned CLI enumerates exactly the preflight files for ${browser}`, {
    skip: !existsSync(pinnedCLI) && 'Dependency-free plan phase: run this regression again after frozen dependency installation',
  }, () => {
    const plan = preflightSelection({...valid, PREFLIGHT_BROWSER: browser,
      PREFLIGHT_TESTS: 'tests/pages/model-inspection.spec.mjs tests/pages/model-drag.spec.mjs'});
    const argv = preflightArguments(plan);
    // Preserve the production arguments; add only no-browser enumeration/reporting.
    argv.splice(2, 0, '--list', '--reporter=json');
    const result = spawnSync(process.execPath, argv, {
      cwd: new URL('../../', import.meta.url), encoding: 'utf8', timeout: 30000,
      env: {...process.env, CI: '1'}, maxBuffer: 4 * 1024 * 1024,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.suites.map(suite => `tests/pages/${suite.file}`).sort(), plan.files);
    const collectTests = suite => [
      ...(suite.specs ?? []).flatMap(spec => spec.tests),
      ...(suite.suites ?? []).flatMap(collectTests),
    ];
    const tests = report.suites.flatMap(collectTests);
    assert.equal(tests.length, 10);
    assert.ok(tests.every(selected => selected.projectName === browser));
  });
}
