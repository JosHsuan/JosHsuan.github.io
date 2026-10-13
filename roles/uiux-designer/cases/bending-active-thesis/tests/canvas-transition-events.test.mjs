import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvasTransitionEvents} from '../runtime/orchestration/CanvasTransitionEvents.mjs';
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
