import test from 'node:test';
import assert from 'node:assert/strict';
import {partitionFiles,shardFiles} from '../../scripts/ci-shards.mjs';
import {browserMatrix} from '../../scripts/ci-impact.mjs';
import {verifyReceipts} from '../../scripts/ci-receipts.mjs';
import {readFileSync} from 'node:fs';
test('whole-file balancing is deterministic, exhaustive, disjoint, and conservative for new files',()=>{
 const weights={a:100,b:60,c:50,d:1};
 const files=['a','b','c','d','new'];
 const result=partitionFiles(files,'chromium',2,weights);
 assert.deepEqual(result,partitionFiles([...files].reverse(),'chromium',2,weights));
 assert.deepEqual(result.flat().sort(),files.sort());
 assert.equal(new Set(result.flat()).size,files.length);
 assert.deepEqual(result,[['a','b'],['c','d','new']]);
 assert.throws(()=>partitionFiles(['a','a'],'chromium',2,weights));
});
function fixture(){
 const files=['a','b','c','d'].map(name=>`tests/pages/${name}.spec.mjs`);
 const plan={head:'a'.repeat(40),browserTests:files,fullCase:true,browserMatrix:browserMatrix(files,true)};
 const build={commit:plan.head,digest:'b'.repeat(64)};
 const context={runId:'123',runAttempt:'1'};
 const provenance={version:1,commit:plan.head,...context,digest:build.digest};
 const tests=['chromium','webkit','mobile-chromium'].flatMap(browser=>files.map(file=>({id:`${browser}:${file}`,browser,file,title:['suite',file],expectedStatus:'passed'})));
 const inventory={...provenance,tests};
 const receipts=plan.browserMatrix.map(({browser,shard})=>{
  const files=shardFiles(plan,browser,shard), selected=tests.filter(t=>t.browser===browser && files.includes(t.file));
  return {...provenance,browser,shard,files,tests:selected,status:'passed',results:selected.map(t=>({id:t.id,status:'passed',expectedStatus:'passed',retry:0,duration:12}))};
 });
 return {plan,build,context,inventory,receipts};
}
const verify=f=>verifyReceipts(f.plan,f.build,f.inventory,f.receipts,f.context);
test('exact candidate test union succeeds across unchanged 4/2/2 runners',()=>assert.equal(verify(fixture()),true));
for(const [name,mutate] of Object.entries({
 'missing shard':f=>f.receipts.pop(),
 'duplicate shard':f=>f.receipts[1]=f.receipts[0],
 'missing execution':f=>f.receipts[0].results.pop(),
 'duplicate execution':f=>f.receipts[0].results.push(f.receipts[0].results[0]),
 'wrong commit':f=>f.receipts[0].commit='c'.repeat(40),
 'wrong run':f=>f.receipts[0].runId='124',
 'wrong attempt':f=>f.receipts[0].runAttempt='2',
 'wrong artifact':f=>f.receipts[0].digest='c'.repeat(64),
 'wrong browser':f=>f.receipts[0].browser='firefox',
 'wrong file':f=>f.receipts[0].files=['other'],
 'skipped execution':f=>f.receipts[0].results[0].status='skipped',
 'expected failure':f=>f.receipts[0].results[0].expectedStatus='failed',
 'retried execution':f=>f.receipts[0].results[0].retry=1,
 'failed suite':f=>f.receipts[0].status='failed',
 'missing inventory file':f=>f.inventory.tests=f.inventory.tests.slice(1),
 'duplicate inventory':f=>f.inventory.tests.push(f.inventory.tests[0]),
 'unexpected intentional skip':f=>f.inventory.tests[0].expectedStatus='skipped',
 'changed matrix':f=>f.plan.browserMatrix.pop(),
})) test(`receipt gate rejects ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>verify(f));});
test('only reserved candidate push branch is excluded; all PR and main required gate remain',()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8');
 assert.match(workflow,/on:\n  push:\n    branches-ignore: \['preflight\/\*\*'\]\n  pull_request:\n  workflow_dispatch:/);
 assert.match(workflow,/name: Required validation gate/);
 assert.match(workflow,/pattern: pages-receipt-\*/);
 assert.match(workflow,/name: pages-test-inventory/);
});
