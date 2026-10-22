import {shardFiles} from '../../scripts/ci-shards.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, mkdir, rm, readFile, readdir, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {artifactDigest, verifyValidation} from '../../scripts/ci-artifact.mjs';
import {classifyChanges} from '../../scripts/ci-impact.mjs';
import {preparePagesWorkspace} from '../../scripts/prepare-pages-workspace.mjs';

async function fixture(run) {
  const folder = await mkdtemp(path.join(tmpdir(), 'ci-artifact-'));
  try {await run(folder);} finally {
    assert(path.resolve(folder).startsWith(path.resolve(tmpdir()) + path.sep));
    await rm(folder, {recursive: true, force: true});
  }
}
test('publishing requires the same commit/run, every selected check, release metadata and every output byte', async () => {
  await fixture(async folder => {
    const sha = 'a'.repeat(40), provenance = {sha, runId: '42', branch: 'main'};
    await writeFile(path.join(folder, 'release.json'), JSON.stringify({commit: sha}));
    await writeFile(path.join(folder, '.nojekyll'), ''); await writeFile(path.join(folder, 'index.html'), 'public HTML');
    const plan = {...classifyChanges([], {forceFull: true}), head: sha};
    const jobs = Object.fromEntries(['plan', 'quality', 'framework', 'pages-build', 'pages-browser'].map(name => [name, {result: 'success'}]));
    const validation = {version: 1, publishable: true, commit: sha, runId: '42', branch: 'main', event: 'push',
      plan, jobs, build: {commit: sha, digest: await artifactDigest(folder)}};
    await verifyValidation(validation, folder, provenance);
    await writeFile(path.join(folder, 'release.json'), JSON.stringify({commit: 'b'.repeat(40)}));
    await assert.rejects(verifyValidation({...validation, build: {commit: sha, digest: await artifactDigest(folder)}}, folder, provenance), /Release commit mismatch/);
    await writeFile(path.join(folder, 'release.json'), JSON.stringify({commit: sha}));
    for (const override of [{sha: 'b'.repeat(40)}, {runId: '43'}, {branch: 'feature'}])
      await assert.rejects(verifyValidation(validation, folder, {...provenance, ...override}));
    for (const override of [{publishable: false}, {event: 'pull_request'}, {plan: {...plan, pages: false}},
      {jobs: {...jobs, 'pages-browser': {result: 'skipped'}}}])
      await assert.rejects(verifyValidation({...validation, ...override}, folder, provenance));
    await writeFile(path.join(folder, 'index.html'), 'changed after tests');
    await assert.rejects(verifyValidation(validation, folder, provenance), /digest mismatch/);
    await writeFile(path.join(folder, 'index.html'), 'public HTML');
    await writeFile(path.join(folder, 'extra.js'), 'unreviewed');
    await assert.rejects(verifyValidation(validation, folder, provenance), /digest mismatch/);
  });
});
test('cached builds preserve only compiler cache and remove stale source/public/output', async () => {
  await fixture(async folder => {
    const work = path.join(folder, '.pages-workspace');
    for (const name of ['.next/cache', '.next/server', 'app', 'public', 'out']) await mkdir(path.join(work, name), {recursive: true});
    await writeFile(path.join(work, '.next/cache', 'compiler.data'), 'cache');
    await writeFile(path.join(work, 'public', 'stale-secret.txt'), 'must disappear');
    await writeFile(path.join(work, 'out', 'index.html'), 'stale output');
    await preparePagesWorkspace(folder);
    assert.deepEqual(await readdir(work), ['.next']);
    assert.deepEqual(await readdir(path.join(work, '.next')), ['cache']);
    assert.equal(await readFile(path.join(work, '.next/cache/compiler.data'), 'utf8'), 'cache');
    await preparePagesWorkspace(folder);
    assert.equal(await readFile(path.join(work, '.next/cache/compiler.data'), 'utf8'), 'cache');
  });
});
test('workspace cleanup refuses a redirected workspace and leaves its outside content intact', async () => {
  await fixture(async folder => {
    const outside = path.join(folder, 'outside'); await mkdir(outside);
    await writeFile(path.join(outside, 'keep.txt'), 'keep');
    await symlink(outside, path.join(folder, '.pages-workspace'), 'junction');
    await assert.rejects(preparePagesWorkspace(folder), /Unexpected Pages workspace target/);
    assert.equal(await readFile(path.join(outside, 'keep.txt'), 'utf8'), 'keep');
    await assert.rejects(artifactDigest(folder), /Symlink/);
  });
});
test('workflow CLI passes real plan/build records through the gate and rejects selected skips', async () => {
  await fixture(async folder => {
    const sha = 'a'.repeat(40), out = path.join(folder, 'out'); await mkdir(out);
    await writeFile(path.join(out, 'release.json'), JSON.stringify({commit: sha}));
    await writeFile(path.join(out, 'index.html'), 'public');
    const jobs = Object.fromEntries(['plan', 'quality', 'framework', 'pages-build', 'pages-browser'].map(name => [name, {result: 'success'}]));
    const env = {...process.env, GITHUB_SHA: sha, CI_FORCE_FULL: 'true', CI_BASE_SHA: '', GITHUB_EVENT_PATH: '',
      GITHUB_EVENT_NAME: 'push', GITHUB_REF_NAME: 'main', CI_DEFAULT_BRANCH: 'main', GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1',
      CI_JOB_RESULTS: JSON.stringify(jobs), GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '',
      EXPECTED_SHA: sha, RUN_ID: '42', EXPECTED_BRANCH: 'main'};
    const run = (name, args = [], override = {}) => spawnSync(process.execPath,
      [fileURLToPath(new URL(`../../scripts/${name}.mjs`, import.meta.url)), ...args],
      {cwd: folder, env: {...env, ...override}, encoding: 'utf8'});
    for (const [name, args] of [['ci-plan', []], ['ci-artifact', ['record', out]], ['ci-gate', []], ['ci-artifact', ['verify', out]]]) {
      if(name==='ci-gate') {
        const plan=JSON.parse(await readFile(path.join(folder,'ci-plan.json'),'utf8'));
        const build=JSON.parse(await readFile(path.join(folder,'ci-build.json'),'utf8'));
        const provenance={version:1,commit:sha,runId:'42',runAttempt:'1',digest:build.digest};
        const tests=['chromium','webkit','mobile-chromium'].flatMap(browser=>plan.browserTests.map(file=>({id:`${browser}:${file}`,browser,file,title:[file],expectedStatus:'passed'})));
        await writeFile(path.join(folder,'ci-inventory.json'),JSON.stringify({...provenance,tests}));
        await mkdir(path.join(folder,'ci-receipts'));
        for(const {browser,shard} of plan.browserMatrix) {
          const files=shardFiles(plan,browser,shard), selected=tests.filter(t=>t.browser===browser && files.includes(t.file));
          await writeFile(path.join(folder,'ci-receipts',`${browser}-${shard.replace('/','-')}.json`),JSON.stringify({...provenance,browser,shard,files,tests:selected,status:'passed',results:selected.map(t=>({id:t.id,status:'passed',expectedStatus:'passed',retry:0,duration:1}))}));
        }
      }
      const result = run(name, args); assert.equal(result.status, 0, result.stderr);
    }
    const record = () => readFile(path.join(folder, 'ci-validation.json'), 'utf8').then(JSON.parse);
    assert.equal((await record()).publishable, true);
    assert.equal(run('ci-gate', [], {GITHUB_EVENT_NAME: 'pull_request'}).status, 0);
    assert.equal((await record()).publishable, false);
    assert.notEqual(run('ci-artifact', ['verify', out]).status, 0);
    assert.equal(run('ci-gate', [], {GITHUB_REF_NAME: 'feature'}).status, 0);
    assert.equal((await record()).publishable, false);
    assert.notEqual(run('ci-gate', [], {CI_JOB_RESULTS: JSON.stringify({...jobs, 'pages-browser': {result: 'skipped'}})}).status, 0);
  });
});
