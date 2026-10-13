import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMotionSession} from './motion-session.mjs';
import {EventManager} from '../runtime/core/EventManager.ts';

function harness(render=()=>{}){
 let id=0,now=0;const queue=new Map(),all=new Map(),samples=[],facts=[],events=new EventManager(),scope=events.createScope('test');
 for(const type of ['Started','Presented','Completed','Cancelled','Failed'])events.on(scope,'reviewMotion'+type,value=>facts.push({type,...value}));
 const session=createMotionSession({owner:'test',events,render:(phase,meta)=>{samples.push(phase);render(phase,meta);},requestFrame:cb=>{queue.set(++id,cb);all.set(id,cb);return id;},cancelFrame:id=>queue.delete(id)});
 return {session,events,queue,all,samples,facts,step(ms=50){now+=ms;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(cb=>cb(now));},run(){for(let i=0;i<1000&&queue.size;i++)this.step();},cleanup(){session.dispose();scope.dispose();events.dispose();}};
}
test('completion follows final presentation exactly once; idle owns no frame',()=>{
 const h=harness();h.session.start({duration:.2});h.run();assert.equal(h.session.inspect().phase,1);assert.equal(h.queue.size,0);assert.equal(h.facts.filter(f=>f.type==='Completed').length,1);assert.deepEqual(h.facts.slice(-2).map(f=>f.type),['Presented','Completed']);h.step();assert.equal(h.facts.filter(f=>f.type==='Completed').length,1);h.cleanup();
});
test('a static target presents and completes synchronously without scheduling',()=>{
 const h=harness();h.session.start({from:1,to:1});assert.equal(h.samples.at(-1),1);assert.equal(h.session.inspect().state,'completed');assert.equal(h.queue.size,0);assert.deepEqual(h.facts.map(f=>f.type),['Started','Presented','Completed']);h.cleanup();
});
test('replacement and late stale callbacks cannot overwrite the new operation or frame handle',()=>{
 const h=harness();h.session.start();const old=h.all.get(1);h.session.start({from:.7,to:.9});old(100);assert.equal(h.session.inspect().phase,.7);assert.equal(h.session.inspect().scheduled,true);assert.equal(h.queue.size,1);h.run();assert.equal(h.session.inspect().phase,.9);assert.equal(h.facts.filter(f=>f.type==='Cancelled').length,1);assert.equal(h.facts.filter(f=>f.type==='Completed').length,1);h.cleanup();
});
test('pause freezes time and resume excludes background elapsed time and stale callbacks',()=>{
 const h=harness();h.session.start();h.step();h.step();const phase=h.session.inspect().phase,old=[...h.queue.values()][0];h.session.pause();h.step(10000);assert.equal(h.session.inspect().phase,phase);h.session.resume();old(11000);assert.equal(h.session.inspect().scheduled,true);h.step(10000);assert.equal(h.session.inspect().phase,phase);h.run();assert.equal(h.session.inspect().state,'completed');h.cleanup();
});
test('seek/reset render once without scheduling or resuming the old timeline',()=>{
 const h=harness();h.session.start();h.step();h.session.seek(.8);h.session.resume();assert.equal(h.session.inspect().phase,.8);assert.equal(h.queue.size,0);h.session.reset(.3);assert.equal(h.samples.at(-1),.3);assert.equal(h.session.inspect().state,'idle');assert.equal(h.queue.size,0);h.cleanup();
});
test('invalid command is rejected before changing a live operation',()=>{
 const h=harness();h.session.start();const id=h.session.inspect().operationId;for(const command of [{duration:Infinity},{duration:0},{duration:31},{from:-1},{to:NaN}])assert.throws(()=>h.session.start(command));assert.equal(h.session.inspect().operationId,id);assert.equal(h.queue.size,1);h.cleanup();
});
test('presenter failure has failure fact and no completion or queued frames',()=>{
 let fail=false;const h=harness(()=>{if(fail)throw Error('presenter test');});h.session.start();fail=true;h.step();assert.equal(h.session.inspect().state,'failed');assert.equal(h.queue.size,0);assert.equal(h.facts.filter(f=>f.type==='Failed').length,1);assert.equal(h.facts.filter(f=>f.type==='Completed').length,0);h.cleanup();
});
test('initial presenter failure is reported and thrown to the host',()=>{
 const h=harness(()=>{throw Error('initial test');});assert.throws(()=>h.session.start(),/initial test/);assert.equal(h.session.inspect().state,'failed');assert.equal(h.queue.size,0);assert.equal(h.facts.at(-1).type,'Failed');h.cleanup();
});
test('disposal cancels, removes scoped listeners and leaves injected host alive',()=>{
 const h=harness(),target=new EventTarget();let n=0;h.session.listen(target,'click',()=>n++);h.session.on('custom',()=>n++);target.dispatchEvent(new Event('click'));h.session.start();h.session.dispose();h.session.dispose();target.dispatchEvent(new Event('click'));h.events.emit('custom',{});assert.equal(n,1);assert.equal(h.events.inspect().nativeListeners,0);assert.equal(h.events.inspect().disposed,false);assert.equal(h.events.inspect().scopes,1);assert.equal(h.queue.size,0);assert.throws(()=>h.session.start(),/disposed/);h.cleanup();
});
