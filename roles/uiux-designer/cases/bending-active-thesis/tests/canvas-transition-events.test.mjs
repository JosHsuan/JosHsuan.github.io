import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvasTransitionEvents} from '../runtime/orchestration/CanvasTransitionEvents.mjs';
import {EventManager} from '../runtime/core/EventManager.ts';
const request=(id,chapter='system',target='hold')=>({id,chapter,target,status:'requested'});
test('motion completion waits for the matching final renderer acknowledgment',()=>{
 const events=[],service=createCanvasTransitionEvents(e=>events.push(e)),value=request(1);
 service.consume([value,{...value,status:'completed'}],40);
 assert.equal(events.length,1);
 for(const presented of [{chapterId:'form',controllerFrame:50},{chapterId:'system',controllerFrame:39}])assert(service.flush({presented,requiresScene:true}));
 assert.equal(events.length,1);
 assert(!service.flush({presented:{chapterId:'system',controllerFrame:40},requiresScene:true}));
 assert.equal(events.at(-1).status,'completed');
 service.flush({presented:{chapterId:'system',controllerFrame:41},requiresScene:true});assert.equal(events.length,2);
});
test('replacement and disposal each close an unacknowledged request exactly once',()=>{
 const events=[],service=createCanvasTransitionEvents(e=>events.push(e)),a=request(1),b=request(2,'credits');
 service.consume([a,{...a,status:'completed'}],40);
 service.consume([b],41);service.dispose();service.dispose();service.consume([request(3)],42);
 assert.deepEqual(events.map(e=>[e.id,e.status]),[[1,'requested'],[1,'cancelled'],[2,'requested'],[2,'cancelled']]);
 assert.equal(events[1].reason,'superseded');assert.equal(events[3].reason,'disposed');
});
test('offscreen and unavailable-scene completion require no GPU wake loop',()=>{
 for(const [target,requiresScene] of [['away',true],['hold',false]]){
  const events=[],service=createCanvasTransitionEvents(e=>events.push(e)),value=request(1,'make',target);
  service.consume([value,{...value,status:'completed'}],40);
  assert(!service.flush({presented:{chapterId:null,controllerFrame:-1},requiresScene}));
  assert.equal(events.at(-1).status,'completed');
 }
});
test('synchronous teardown from a completion observer cannot also cancel the completed request',()=>{
 const events=[];let service;
 service=createCanvasTransitionEvents(value=>{events.push(value);if(value.status==='completed')service.dispose();});
 const value=request(1);service.consume([value,{...value,status:'completed'}],40);
 service.flush({presented:{chapterId:'system',controllerFrame:40},requiresScene:true});
 assert.deepEqual(events.map(event=>[event.id,event.status]),[[1,'requested'],[1,'completed']]);
 assert.equal(service.inspect().open,null);assert.equal(service.inspect().pending,null);
 service.dispose();service.flush({presented:{},requiresScene:false});assert.equal(events.length,2);
});
test('teardown from a request or cancellation observer closes once and ignores the rest of an in-flight outbox',()=>{
 for(const terminal of ['requested','cancelled']){
  const events=[];let service;
  service=createCanvasTransitionEvents(value=>{events.push(value);if(value.status===terminal)service.dispose();});
  const first=request(1),second=request(2,'form');
  service.consume([first,{...first,status:'completed'},second,{...second,status:'completed'}],40);
  assert.deepEqual(events.map(event=>[event.id,event.status]),[[1,'requested'],[1,'cancelled']]);
  assert.equal(service.inspect().open,null);assert.equal(service.inspect().pending,null);
 }
});
test('typed-bus observer failure cannot interrupt another observer or leave transition ownership open',()=>{
 const faults=[],events=new EventManager(error=>faults.push(error)),scope=events.createScope('transition-observers'),facts=[];
 events.on(scope,'canvasTransition',()=>{throw Error('review observer failed');});
 events.on(scope,'canvasTransition',value=>facts.push(value));
 const service=createCanvasTransitionEvents(value=>events.emit('canvasTransition',value)),value=request(1);
 service.consume([value,{...value,status:'completed'}],40);
 assert.equal(service.flush({presented:{chapterId:'system',controllerFrame:40},requiresScene:true}),false);
 assert.deepEqual(facts.map(fact=>fact.status),['requested','completed']);assert.equal(faults.length,2);
 assert.equal(service.inspect().open,null);service.dispose();assert.equal(facts.length,2);
 scope.dispose();events.dispose();
});
