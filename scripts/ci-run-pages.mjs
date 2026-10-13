import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {ALL_BROWSER_TESTS, browserMatrix} from './ci-impact.mjs';
const [browser, shard] = process.argv.slice(2);
const plan = JSON.parse(await readFile('ci-plan.json', 'utf8'));
if (plan.head !== process.env.GITHUB_SHA) throw Error('Browser plan is from another commit');
if (!plan.pages || !plan.browserTests.length || plan.browserTests.some(test => !ALL_BROWSER_TESTS.includes(test))) throw Error('Invalid browser test selection');
if (!browserMatrix(plan.browserTests, plan.fullCase).some(job => job.browser === browser && job.shard === shard)) throw Error('Unexpected browser/shard');
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config', 'playwright.pages.config.mjs',
  '--project', browser, '--shard', shard, ...plan.browserTests], {stdio: 'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
