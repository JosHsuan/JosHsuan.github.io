import assert from 'node:assert/strict';
import test from 'node:test';
import {createJourneyPhaseBudget} from '../pages/journey-phase-budget.mjs';
const A='entry-pause-capture',B='native-reading-resume';
function fixture(){let time=100;return{budget:createJourneyPhaseBudget(()=>time),at:value=>{time=value;}};}
test('two sequential phases accept the exact 60000ms boundary without a CI multiplier',()=>{
 const {budget:b,at}=fixture();b.start(A);at(60100);b.check();b.finish();b.start(B);at(120100);b.finish();
 const s=b.snapshot();assert.equal(s.outerRunnerLimitMs,135000);assert.equal(s.phaseLimitMs,60000);assert.deepEqual(s.phases.map(p=>[p.name,p.elapsedMs,p.status]),[[A,60000,'completed'],[B,60000,'completed']]);assert.throws(()=>b.start(A));assert.throws(()=>b.check());
});
test('overrun after a pending await returns prevents the next native input and phase',async()=>{
 const {budget:b,at}=fixture();let inputs=0;b.start(A);await Promise.resolve().then(()=>at(60100.001));
 assert.throws(()=>{b.check();inputs++;},/exceeded/);assert.equal(inputs,0);assert.throws(()=>b.start(B));assert.throws(()=>b.finish());
 const row=b.snapshot().phases[0];assert.equal(row.status,'failed');assert.equal(row.reason,'phase-budget-exceeded');assert.equal(row.elapsedMs,60000.001);b.fail(Error('secondary'));assert.deepEqual(b.snapshot().phases[0],row);
});
test('phase completion rejects overrun, and phase B cannot borrow unused phase A time',()=>{
 const {budget:b,at}=fixture();b.start(A);at(101);b.finish();b.start(B);at(60101.01);assert.throws(()=>b.finish(),/exceeded/);assert.equal(b.snapshot().phases[1].status,'failed');assert.throws(()=>b.start(B));
});
test('phase order, double start and inactive checks fail closed',()=>{
 const {budget:b}=fixture();assert.throws(()=>b.start(B));assert.throws(()=>b.check());assert.throws(()=>b.finish());b.start(A);assert.throws(()=>b.start(A));assert.throws(()=>b.start(B));b.finish();assert.throws(()=>b.check());assert.throws(()=>b.start(A));b.start(B);b.finish();assert.throws(()=>b.finish());
});
test('operation failure remains primary even after budget overrun or broken diagnostic clock',()=>{
 for(const time of [60101,NaN,Infinity,99]){
  const {budget:b,at}=fixture();b.start(A);const primary=Error('ORIGINAL_OPERATION_FAILURE');let caught;at(time);
  try{throw primary;}catch(error){b.fail(error);caught=error;}
  assert.equal(caught,primary);const row=b.snapshot().phases[0];assert.equal(row.reason,'operation-failed');assert.equal(row.error,primary.message);assert.equal(row.status,'failed');assert.throws(()=>b.start(B));if(!Number.isFinite(time)||time<100)assert.match(row.clockError,/finite and monotonic/);
 }
});
test('monotonic clock validation and defensive receipt copies',()=>{
 for(const invalid of [NaN,Infinity,-Infinity,99]){const {budget:b,at}=fixture();b.start(A);at(invalid);assert.throws(()=>b.check(),/finite and monotonic/);b.fail(Error('clock-invalid'));assert.equal(b.snapshot().phases[0].status,'failed');}
 const {budget:b,at}=fixture();b.start(A);at(120);b.check();const copy=b.snapshot();copy.phases[0].elapsedMs=999;copy.phases.push({name:'invented'});assert.equal(b.snapshot().phases[0].elapsedMs,20);assert.equal(b.snapshot().phases.length,1);
});
test('failure formatting cannot mask the original exception or permit a restart',()=>{
 const {budget:b}=fixture();b.start(A);const hostile={get message(){throw Error('diagnostic getter');}};assert.doesNotThrow(()=>b.fail(hostile));assert.throws(()=>b.start(B));assert.throws(()=>b.check());
});
