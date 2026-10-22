import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {ALL_BROWSER_TESTS, browserMatrix} from './ci-impact.mjs';
import {shardFiles} from './ci-shards.mjs';
const [browser, shard] = process.argv.slice(2);
const plan = JSON.parse(await readFile('ci-plan.json', 'utf8'));
const build = JSON.parse(await readFile('ci-build.json','utf8'));
const inventory = JSON.parse(await readFile('ci-inventory.json','utf8'));
if (plan.head !== process.env.GITHUB_SHA || build.commit!==plan.head) throw Error('Browser plan is from another commit');
if (!plan.pages || !plan.browserTests.length || plan.browserTests.some(test => !ALL_BROWSER_TESTS.includes(test))) throw Error('Invalid browser test selection');
if (JSON.stringify(plan.browserMatrix)!==JSON.stringify(browserMatrix(plan.browserTests,plan.fullCase))) throw Error('Unexpected browser matrix');
const provenance={version:1,commit:plan.head,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,digest:build.digest};
for(const [key,value] of Object.entries(provenance)) if(!value || inventory[key]!==value) throw Error('Stale inventory');
const files=shardFiles(plan,browser,shard);
if(!files.length) throw Error('Empty shard');
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config', 'playwright.pages.config.mjs',
  '--project', browser, '--reporter','line,./scripts/ci-receipt-reporter.mjs', ...files],
  {stdio: 'inherit',env:{...process.env,CI_RECEIPT_OUTPUT:'ci-shard-result.json'}});
if (result.error) throw result.error;
const receipt=JSON.parse(await readFile('ci-shard-result.json','utf8'));
await writeFile(`ci-receipt-${browser}-${shard.replace('/','-')}.json`,JSON.stringify({...provenance,browser,shard,files,...receipt},null,2)+'\n');
process.exitCode = result.status ?? 1;
