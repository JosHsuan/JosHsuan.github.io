import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSceneRecovery,SCENE_RECOVERY_KEY} from '../components/scene-recovery.mjs';
function fixture(){const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};}
test('a recently interrupted session gates automatic restart; normal pagehide does not',()=>{
  const storage=fixture();let now=1000;
  const session=createSceneRecovery(storage,()=>now);assert.equal(session.recovery,false);session.begin();
  now+=20000;assert.equal(createSceneRecovery(storage,()=>now).recovery,true);
  session.end();assert.equal(createSceneRecovery(storage,()=>now).recovery,false);
  session.fail();assert.equal(createSceneRecovery(storage,()=>now).recovery,true);
  now+=31*60*1000;assert.equal(createSceneRecovery(storage,()=>now).recovery,true);
  session.begin();assert.equal(JSON.parse(storage.getItem(SCENE_RECOVERY_KEY)).status,'active');
  now+=31*60*1000;assert.equal(createSceneRecovery(storage,()=>now).recovery,false);
});

test('failure is latched against queued heartbeat and pagehide until explicit begin',()=>{
  const storage=fixture();let now=1000;const session=createSceneRecovery(storage,()=>now);
  session.begin();session.fail();const failure=storage.getItem(SCENE_RECOVERY_KEY);
  now+=31*60*1000;session.heartbeat();session.end();assert.equal(storage.getItem(SCENE_RECOVERY_KEY),failure);
  const next=createSceneRecovery(storage,()=>now);assert.equal(next.recovery,true);next.heartbeat();next.end();
  assert.equal(storage.getItem(SCENE_RECOVERY_KEY),failure);
  next.begin();assert.equal(JSON.parse(storage.getItem(SCENE_RECOVERY_KEY)).status,'active');next.end();
  assert.equal(createSceneRecovery(storage,()=>now).recovery,false);
});
test('active heartbeat is throttled and storage denial never prevents reading',()=>{
  const storage=fixture();let now=1000;const session=createSceneRecovery(storage,()=>now);session.begin();
  now+=1000;session.heartbeat();assert.equal(JSON.parse(storage.getItem(SCENE_RECOVERY_KEY)).at,1000);
  now+=30000;session.heartbeat();assert.equal(JSON.parse(storage.getItem(SCENE_RECOVERY_KEY)).at,now);
  const denied=createSceneRecovery(null);assert.equal(denied.recovery,false);assert.doesNotThrow(()=>{denied.begin();denied.heartbeat();denied.fail();denied.end();});
});
