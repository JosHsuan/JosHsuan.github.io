import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyChanges, assertRequiredJobs, CASE_ROOT, ALL_BROWSER_TESTS} from '../../scripts/ci-impact.mjs';
import {successfulBaseline, changedPaths, isAncestor} from '../../scripts/ci-plan.mjs';
import {mkdtemp, mkdir, writeFile, rm, rename} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

test('documentation skips expensive jobs; documentation-like public inputs do not', () => {
  const docs = classifyChanges(['README.md', 'docs/architecture.md', `${CASE_ROOT}README.md`]);
  assert.equal(docs.scope, 'documentation'); assert.deepEqual(docs.browserTests, []);
  for (const file of ['content/project.md', 'public/info.md', `${CASE_ROOT}release/public/assets/info.md`, 'new-tool.mjs']) {
    const plan = classifyChanges([file]); assert(plan.framework || plan.fullCase, file);
  }
});
test('model UI includes drag direction, source synchronization, canvas routing, lifecycle and touch coverage without framework builds', () => {
  const plan = classifyChanges([`${CASE_ROOT}components/model-inspector.module.css`]);
  assert.equal(plan.framework, false); assert.equal(plan.fullCase, false);
  for (const name of ['public-release', 'model-inspection', 'model-drag', 'source-artwork', 'canvas-motion', 'runtime-lifecycle', 'mobile-stability'])
    assert(plan.browserTests.includes(`tests/pages/${name}.spec.mjs`), name);
  assert(!plan.browserTests.includes('tests/pages/render-resources.spec.mjs'));
  assert.deepEqual(plan.browserMatrix, [
    {browser: 'chromium', engine: 'chromium', shard: '1/1'},
    {browser: 'webkit', engine: 'webkit', shard: '1/1'},
    {browser: 'mobile-chromium', engine: 'chromium', shard: '1/1'},
  ]);
});

test('scoped diagram changes always exercise the event-driven library reveal and linked source interaction',()=>{
  for(const file of ['components/SourceDiagram.jsx','components/source-diagram.module.css','runtime/features/DiagramManager.mjs','tests/source-diagram.test.mjs']){
    const plan=classifyChanges([CASE_ROOT+file]);
    assert.equal(plan.framework,false);assert.equal(plan.fullCase,false);
    for(const name of ['public-release','library-reveal','source-artwork','model-inspection','canvas-motion'])
      assert(plan.browserTests.includes(`tests/pages/${name}.spec.mjs`),`${file} must verify ${name}`);
  }
});
test('combined feature updates select the union, not just the final path', () => {
  const plan = classifyChanges([`${CASE_ROOT}components/model-information.mjs`, `${CASE_ROOT}runtime/features/ReadingManager.mjs`]);
  assert(plan.browserTests.includes('tests/pages/motion-feedback.spec.mjs'));
  assert(plan.browserTests.includes('tests/pages/mobile-stability.spec.mjs'));
  assert.equal(new Set(plan.browserTests).size, plan.browserTests.length);
});
test('core, scene, assets and unknown case modules require every browser spec', () => {
  for (const file of ['runtime/core/EventManager.ts', 'runtime/orchestration/ExperienceDirector.mjs',
    'runtime/presentation/SceneRuntime.mjs', 'components/materials/cinematic-material.js',
    'release/public/assets/thesis/source-diagrams.glb', 'runtime/new-feature.mjs',
    'runtime/features/EntryManager.mjs','components/EntryLoader.jsx','runtime/motion/entry-motion.mjs',
    'runtime/presentation/LibraryDiagramPresenter.mjs','runtime/motion/library-reveal.mjs']) {
    const plan = classifyChanges([CASE_ROOT + file]);
    assert.equal(plan.framework, false); assert.deepEqual(plan.browserTests, ALL_BROWSER_TESTS);
    assert.deepEqual(plan.browserMatrix, [
      {browser: 'chromium', engine: 'chromium', shard: '1/4'},
      {browser: 'chromium', engine: 'chromium', shard: '2/4'},
      {browser: 'chromium', engine: 'chromium', shard: '3/4'},
      {browser: 'chromium', engine: 'chromium', shard: '4/4'},
      {browser: 'webkit', engine: 'webkit', shard: '1/2'},
      {browser: 'webkit', engine: 'webkit', shard: '2/2'},
      {browser: 'mobile-chromium', engine: 'chromium', shard: '1/2'},
      {browser: 'mobile-chromium', engine: 'chromium', shard: '2/2'},
    ]);
  }
});
test('dependencies, workflow and cache/build tooling trigger all checks; root-only changes stay independent', () => {
  for (const file of ['pnpm-lock.yaml', 'package.json', '.github/workflows/ci.yml',
    'scripts/build-pages.mjs', 'scripts/ci-impact.mjs', 'next.config.ts']) {
    const plan = classifyChanges([file]); assert.equal(plan.scope, 'full', file);
  }
  const root = classifyChanges(['src/components/Layout.tsx']);
  assert.equal(root.scope, 'framework'); assert.equal(root.pages, false);
  assert.equal(classifyChanges([], {forceFull: true}).scope, 'full');
});
test('changed tests run, while shared helpers require the entire case', () => {
  const plan = classifyChanges(['tests/pages/model-inspection.spec.mjs']);
  assert.deepEqual(plan.browserTests, ['tests/pages/model-inspection.spec.mjs', 'tests/pages/public-release.spec.mjs']);
  assert.equal(classifyChanges(['tests/pages/case-helpers.mjs']).fullCase, true);
  for(const name of ['model-drag','library-reveal','entry-readiness']){
    const file=`tests/pages/${name}.spec.mjs`;
    assert(ALL_BROWSER_TESTS.includes(file),`Release discovery must include ${name}`);
    assert.deepEqual(classifyChanges([file]).browserTests,[file,'tests/pages/public-release.spec.mjs'].sort());
  }
});
test('the gate rejects selected skips/failures/cancellations and unexpected unselected executions', () => {
  for (const plan of [classifyChanges(['README.md']), classifyChanges([`${CASE_ROOT}components/ModelInspector.jsx`]), classifyChanges([], {forceFull: true})]) {
    const jobs = Object.fromEntries(Object.entries({plan: true, quality: plan.framework || plan.pages,
      framework: plan.framework, 'pages-build': plan.pages, 'pages-browser': plan.pages})
      .map(([name, required]) => [name, {result: required ? 'success' : 'skipped'}]));
    assert.doesNotThrow(() => assertRequiredJobs(plan, jobs));
    for (const name of Object.keys(jobs)) {
      for (const result of ['failure', 'cancelled', jobs[name].result === 'success' ? 'skipped' : 'success'])
        assert.throws(() => assertRequiredJobs(plan, {...jobs, [name]: {result}}));
    }
  }
});
test('successful baseline excludes failed/cancelled, PR, other-branch, current and non-ancestor runs', () => {
  const head = 'a'.repeat(40), good = 'b'.repeat(40);
  const run = (sha, extra = {}) => ({head_sha: sha, conclusion: 'success', event: 'push', head_branch: 'main', ...extra});
  const runs = [run(head), run('c'.repeat(40), {conclusion: 'failure'}), run('d'.repeat(40), {conclusion: 'cancelled'}),
    run('e'.repeat(40), {event: 'pull_request'}), run('f'.repeat(40), {head_branch: 'other'}), run('0'.repeat(40)), run(good)];
  assert.equal(successfulBaseline(runs, head, 'main', sha => sha === good), good);
  assert.equal(successfulBaseline(runs.slice(0, -1), head, 'main', sha => sha === good), null);
});
test('NUL git diffs include cumulative changes and both sides of feature-to-core renames', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'ci-impact-'));
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${folder.replaceAll('\\', '/')}`, ...args], {cwd: folder, encoding: 'utf8'}).trim();
  try {
    git('init', '-b', 'main'); git('config', 'user.name', 'CI fixture'); git('config', 'user.email', 'ci@example.invalid');
    await mkdir(path.join(folder, CASE_ROOT, 'components'), {recursive: true});
    const original = `${CASE_ROOT}components/ModelInspector.jsx`;
    await writeFile(path.join(folder, original), 'original'); git('add', '.'); git('commit', '-m', 'baseline');
    const base = git('rev-parse', 'HEAD');
    await writeFile(path.join(folder, 'first failed change.mjs'), 'first'); git('add', '.'); git('commit', '-m', 'intervening failed push');
    await mkdir(path.join(folder, CASE_ROOT, 'runtime/core'), {recursive: true});
    const moved = `${CASE_ROOT}runtime/core/MovedManager.mjs`;
    await rename(path.join(folder, original), path.join(folder, moved)); git('add', '.'); git('commit', '-m', 'move');
    const head = git('rev-parse', 'HEAD'), files = changedPaths(base, head, folder);
    assert(files.includes('first failed change.mjs')); assert(files.includes(original)); assert(files.includes(moved));
    assert.equal(classifyChanges(files).scope, 'full'); assert(isAncestor(base, head, folder));
  } finally {
    assert(path.resolve(folder).startsWith(path.resolve(tmpdir()) + path.sep));
    await rm(folder, {recursive: true, force: true});
  }
});

// Explicit plane opt-ins and their native input owners must keep site-wide
// ownership/focus/static-policy coverage even when other case tests are scoped.
test('native model, diagram and reading changes retain whole-plane integration coverage',()=>{
 for(const file of ['components/ModelInspector.jsx','components/SourceDiagram.jsx','runtime/features/ReadingManager.mjs']){
  const plan=classifyChanges([CASE_ROOT+file]);
  assert(plan.browserTests.includes('tests/pages/global-window-motion.spec.mjs'),file);
  assert.equal(plan.framework,false);
 }
});
