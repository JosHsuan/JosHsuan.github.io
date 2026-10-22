import {shardFiles} from './ci-shards.mjs';
import {browserMatrix} from './ci-impact.mjs';
const same = (a,b) => JSON.stringify(a)===JSON.stringify(b);
export function verifyReceipts(plan, build, inventory, receipts, {runId,runAttempt}) {
  const provenance={version:1,commit:plan.head,runId,runAttempt,digest:build.digest};
  for(const doc of [inventory,...receipts]) for(const [key,value] of Object.entries(provenance))
    if(!value || doc[key]!==value) throw Error(`Receipt provenance mismatch: ${key}`);
  if(build.commit!==plan.head || !same(plan.browserMatrix,browserMatrix(plan.browserTests,plan.fullCase))) throw Error('Invalid receipt plan');
  const allIds=inventory.tests.map(test=>test.id);
  if(!allIds.length || new Set(allIds).size!==allIds.length) throw Error('Invalid inventory IDs');
  const matrix=plan.browserMatrix;
  if(receipts.length!==matrix.length) throw Error('Missing or duplicate shard receipt');
  const knownBrowsers=new Set(matrix.map(job=>job.browser));
  for(const test of inventory.tests) {
    if(!knownBrowsers.has(test.browser) || !plan.browserTests.includes(test.file) || test.expectedStatus!=='passed') throw Error('Unexpected inventory test or skip');
  }
  for(const browser of knownBrowsers) for(const file of plan.browserTests)
    if(!inventory.tests.some(test=>test.browser===browser && test.file===file)) throw Error('Missing file in candidate inventory');
  for(const job of matrix) {
    const matching=receipts.filter(r=>r.browser===job.browser && r.shard===job.shard);
    if(matching.length!==1) throw Error('Missing or duplicate shard');
    const receipt=matching[0], files=shardFiles(plan,job.browser,job.shard);
    if(!same(receipt.files,files) || receipt.status!=='passed') throw Error('Invalid shard selection or status');
    const expected=inventory.tests.filter(test=>test.browser===job.browser && files.includes(test.file));
    const canonical=tests=>[...tests].sort((a,b)=>a.id.localeCompare(b.id,'en'));
    if(!same(canonical(receipt.tests),canonical(expected))) throw Error('Shard inventory mismatch');
    if(receipt.results.length!==expected.length || new Set(receipt.results.map(r=>r.id)).size!==expected.length) throw Error('Incomplete or duplicate test execution');
    const ids=new Set(expected.map(test=>test.id));
    for(const result of receipt.results) if(!ids.has(result.id) || result.status!=='passed' || result.expectedStatus!=='passed' || result.retry!==0 || !Number.isFinite(result.duration) || result.duration<0) throw Error('Unexpected test result or skip');
  }
  return true;
}
