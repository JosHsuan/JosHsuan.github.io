import test from 'node:test';
import assert from 'node:assert/strict';
import {DisposableScope} from '../runtime/core/DisposableScope.ts';
import {EventManager} from '../runtime/core/EventManager.ts';

test('feature cleanup is reverse ordered, independently releasable and idempotent after a failure', () => {
  const log=[],errors=[],scope=new DisposableScope('feature',error=>errors.push(error));
  scope.add(()=>log.push('first'));
  const individual=scope.add(()=>log.push('individual'));
  scope.add(()=>{log.push('failing');throw Error('cleanup');});
  scope.add(()=>log.push('last'));
  individual.dispose();individual.dispose();scope.dispose();scope.dispose();
  assert.deepEqual(log,['individual','last','failing','first']);
  assert.equal(errors.length,1);assert.equal(scope.size,0);
  let lateReleased=false;
  assert.throws(()=>scope.add(()=>{lateReleased=true;}),/disposed/);
  assert(lateReleased);
});

test('native listener ownership survives identical callbacks in independent features', () => {
  const events=new EventManager(),target=new EventTarget(),left=events.createScope('left'),right=events.createScope('right');
  let calls=0,bound=false;
  function receive(){calls++;bound=this===target;}
  events.listen(left,target,'change',receive);events.listen(right,target,'change',receive);
  target.dispatchEvent(new Event('change'));assert.equal(calls,2);assert(bound);
  left.dispose();target.dispatchEvent(new Event('change'));assert.equal(calls,3);
  right.dispose();target.dispatchEvent(new Event('change'));assert.equal(calls,3);
  assert.equal(events.inspect().nativeListeners,0);assert.equal(events.inspect().scopes,0);
  assert.throws(()=>events.listen(right,target,'change',receive),/disposed/);
});

test('once and aborted native registrations release their scope handles without further delivery', () => {
  const events=new EventManager(),scope=events.createScope('native'),target=new EventTarget(),abort=new AbortController();
  let calls=0;
  events.listen(scope,target,'once',()=>calls++,{once:true});
  target.dispatchEvent(new Event('once'));target.dispatchEvent(new Event('once'));
  assert.equal(calls,1);assert.equal(scope.size,0);assert.equal(events.inspect().nativeListeners,0);
  events.listen(scope,target,'change',()=>calls++,{signal:abort.signal});
  abort.abort();target.dispatchEvent(new Event('change'));
  assert.equal(calls,1);assert.equal(scope.size,0);assert.equal(events.inspect().nativeListeners,0);
  events.listen(scope,target,'change',()=>calls++,{signal:abort.signal});
  assert.equal(scope.size,0);scope.dispose();
});

test('delivery mutation skips released listeners and defers newly registered ones', () => {
  const events=new EventManager(),a=events.createScope('a'),b=events.createScope('b'),c=events.createScope('c'),seen=[];
  let added=false;
  events.on(a,'selected',value=>{
    seen.push('a'+value);b.dispose();
    if(!added){added=true;events.on(c,'selected',next=>seen.push('c'+next));}
  });
  events.on(b,'selected',value=>seen.push('b'+value));
  events.emit('selected',1);assert.deepEqual(seen,['a1']);
  events.emit('selected',2);assert.deepEqual(seen,['a1','a2','c2']);
  events.dispose();assert.equal(events.inspect().subscriptions,0);
});

test('observer failure and disposal during dispatch do not resurrect delivery or cross instances', () => {
  const errors=[],first=new EventManager(error=>errors.push(error)),second=new EventManager(),seen=[];
  const a=first.createScope('a'),b=first.createScope('b'),other=second.createScope('other');
  first.on(a,'selected',()=>{throw Error('observer failed');});
  first.on(b,'selected',value=>seen.push(value));second.on(other,'selected',()=>seen.push('other'));
  first.emit('selected',1);assert.deepEqual(seen,[1]);assert.equal(errors.length,1);
  first.on(a,'stop',()=>first.dispose());first.on(b,'stop',()=>seen.push('late'));
  first.emit('stop',undefined);first.emit('selected',2);
  assert.deepEqual(seen,[1]);assert.equal(first.inspect().scopes,0);
  second.emit('selected',3);assert.deepEqual(seen,[1,'other']);second.dispose();
});
