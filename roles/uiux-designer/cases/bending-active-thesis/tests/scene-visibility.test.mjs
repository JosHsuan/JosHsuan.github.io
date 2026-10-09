import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForSceneVisibility} from '../components/scene-visibility.mjs';

function lifecycle(hidden) {
  const listeners=new Set();
  return {get:()=>({hidden}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
    set(value){hidden=value;listeners.forEach(fn=>fn());},get subscriptions(){return listeners.size;}};
}
test('a hidden completed load waits for the existing lifecycle without owning a timer', async () => {
  const input=lifecycle(true),abort=new AbortController();
  let initialized=false;
  const result=waitForSceneVisibility(input,abort.signal).then(visible=>{initialized=visible;return visible;});
  await Promise.resolve();
  assert.equal(initialized,false);assert.equal(input.subscriptions,1);
  input.set(true);await Promise.resolve();assert.equal(initialized,false);
  input.set(false);assert.equal(await result,true);assert.equal(input.subscriptions,0);
});
test('unmount cancellation releases a hidden load and cannot initialize after resume', async () => {
  const input=lifecycle(true),abort=new AbortController();
  const result=waitForSceneVisibility(input,abort.signal);
  abort.abort();assert.equal(await result,false);assert.equal(input.subscriptions,0);
  input.set(false);assert.equal(input.subscriptions,0);
});
test('visible and already-aborted loads leave no subscription', async () => {
  const input=lifecycle(false),abort=new AbortController();
  assert.equal(await waitForSceneVisibility(input,abort.signal),true);
  abort.abort();assert.equal(await waitForSceneVisibility(input,abort.signal),false);
  assert.equal(input.subscriptions,0);
});
