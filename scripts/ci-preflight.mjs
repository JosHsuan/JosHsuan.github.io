import {appendFile, mkdir, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ALL_BROWSER_TESTS} from './ci-impact.mjs';

export function preflightSelection(env) {
  if (env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw Error('Preflight requires manual dispatch');
  if (env.GITHUB_REF_TYPE !== 'branch' || !/^preflight\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(env.GITHUB_REF_NAME ?? '')
    || env.GITHUB_REF !== `refs/heads/${env.GITHUB_REF_NAME}`
    || env.GITHUB_REF_NAME.includes('..') || env.GITHUB_REF_NAME.includes('//')
    || env.GITHUB_REF_NAME.split('/').some(part => !part || part.startsWith('.') || part.endsWith('.') || part.endsWith('.lock')))
    throw Error('Preflight requires a valid reserved preflight/** candidate branch');
  if (!/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? '')) throw Error('Preflight requires an exact commit SHA');
  if (!/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID ?? '')) throw Error('Preflight requires a workflow run identity');
  const engines = {chromium: 'chromium', webkit: 'webkit', 'mobile-chromium': 'chromium'};
  const browser = env.PREFLIGHT_BROWSER;
  if (!Object.hasOwn(engines, browser)) throw Error('Invalid preflight browser');
  const files = [...new Set((env.PREFLIGHT_TESTS ?? '').trim().split(/[\s,]+/))].sort();
  if (!files.length || files.some(file => !ALL_BROWSER_TESTS.includes(file))) throw Error('Invalid preflight test file selection');
  return {version: 1, publishable: false, purpose: 'targeted-feedback-only', commit: env.GITHUB_SHA,
    runId: env.GITHUB_RUN_ID, branch: env.GITHUB_REF_NAME, browser, engine: engines[browser], files};
}

export function preflightArguments(selection) {
  // --project is variadic: positional file filters must precede it.
  return ['node_modules/@playwright/test/cli.js', 'test', ...selection.files,
    '--config', 'playwright.pages.config.mjs', '--project', selection.browser];
}

async function main() {
  const command = process.argv[2];
  if (!['plan', 'run'].includes(command)) throw Error('Expected preflight plan or run');
  const selection = preflightSelection(process.env);
  const head = spawnSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'});
  if (head.status !== 0 || head.stdout.trim() !== selection.commit) throw Error('Checkout does not match dispatched candidate SHA');
  await mkdir('preflight-results', {recursive: true});
  if (command === 'plan') {
    await writeFile('preflight-results/manifest.json', JSON.stringify({...selection, status: 'pending'}, null, 2) + '\n');
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `engine=${selection.engine}\n`);
    return;
  }
  const result = spawnSync(process.execPath, preflightArguments(selection), {stdio: 'inherit'});
  await writeFile('preflight-results/manifest.json', JSON.stringify({...selection,
    status: result.status === 0 && !result.error ? 'passed' : 'failed', exitCode: result.status,
    error: result.error?.message}, null, 2) + '\n');
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
