import {readFile, writeFile} from 'node:fs/promises';
import {assertRequiredJobs} from './ci-impact.mjs';
const plan = JSON.parse(await readFile('ci-plan.json', 'utf8'));
const results = JSON.parse(process.env.CI_JOB_RESULTS);
if (plan.head !== process.env.GITHUB_SHA) throw Error('Plan is from another commit');
assertRequiredJobs(plan, results);
let build = null;
if (plan.pages) {
  build = JSON.parse(await readFile('ci-build.json', 'utf8'));
  if (build.commit !== plan.head) throw Error('Build is from another commit');
}
await writeFile('ci-validation.json', JSON.stringify({version: 1, commit: plan.head,
  runId: process.env.GITHUB_RUN_ID, event: process.env.GITHUB_EVENT_NAME,
  branch: process.env.GITHUB_REF_NAME, plan, jobs: results, build,
  publishable: plan.pages && process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_REF_NAME === process.env.CI_DEFAULT_BRANCH}, null, 2) + '\n');
console.log(`Required validation passed: ${plan.scope}`);
