import {readFile, writeFile, appendFile} from 'node:fs/promises';
import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {classifyChanges} from './ci-impact.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
export function changedPaths(base, head, cwd = root) {
  // Disabling rename detection exposes both deleted and added paths, including
  // feature-to-core moves. NUL separators preserve whitespace and newlines.
  return execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, head],
    {cwd, encoding: 'utf8'}).split('\0').filter(Boolean);
}
export function isAncestor(base, head, cwd = root) {
  return /^[a-f0-9]{40}$/.test(base) && spawnSync('git', ['merge-base', '--is-ancestor', base, head], {cwd}).status === 0;
}
export function successfulBaseline(runs, head, branch, ancestor = isAncestor) {
  return runs.find(run => run.head_sha !== head && run.conclusion === 'success'
    && run.event === 'push' && run.head_branch === branch && ancestor(run.head_sha, head))?.head_sha || null;
}

async function createPlan() {
  const event = process.env.GITHUB_EVENT_PATH ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')) : {};
  const head = process.env.GITHUB_SHA || git('rev-parse', 'HEAD');
  let base = process.env.CI_BASE_SHA || null;
  let forceFull = process.env.CI_FORCE_FULL === 'true' || event.inputs?.full_validation === true || event.inputs?.full_validation === 'true';
  let baselineReason = forceFull ? 'explicit full validation' : 'explicit local baseline';
  if (!base && !forceFull && process.env.GITHUB_EVENT_NAME === 'pull_request') {
    base = git('merge-base', event.pull_request.base.sha, head);
    baselineReason = 'pull request merge base';
  } else if (!base && !forceFull && ['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)) {
    baselineReason = 'no successful ancestor found; full validation';
    // Search successful pushes, never just event.before. A cancelled/failed
    // previous push must not make its changes disappear from this plan.
    try {
      const repo = process.env.GITHUB_REPOSITORY;
      const branch = process.env.GITHUB_REF_NAME;
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/ci.yml/runs?event=push&status=success&branch=${encodeURIComponent(branch)}&per_page=100`, {
        headers: {Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'},
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw Error(`Baseline query HTTP ${response.status}`);
      const {workflow_runs: runs} = await response.json();
      base = successfulBaseline(runs, head, branch);
      if (base) baselineReason = 'last successful ancestor push; includes intervening failed/cancelled changes';
    } catch (error) {
      console.log(`Unable to establish a successful baseline: ${error.message}; using full validation.`);
    }
  }
  if (!base || !isAncestor(base, head)) {base = null; forceFull = true;}
  const plan = {...classifyChanges(base ? changedPaths(base, head) : [], {forceFull}), head, base, baselineReason};
  await writeFile('ci-plan.json', JSON.stringify(plan, null, 2) + '\n');
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT,
    `framework=${plan.framework}\npages=${plan.pages}\nmatrix=${JSON.stringify({include: plan.browserMatrix.length ? plan.browserMatrix : [{browser: 'chromium', engine: 'chromium', shard: '1/1'}]})}\n`);
  const summary = `## Validation plan\n\nScope: **${plan.scope}**\n\nBaseline: ${base || 'none (full validation)'}\n\n${baselineReason}\n\n${plan.reasons.map(reason => `- ${reason}`).join('\n') || '- Documentation-only / forced full validation'}\n\nBrowser files: ${plan.browserTests.length}/${classifyChanges([], {forceFull: true}).browserTests.length}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await createPlan();
