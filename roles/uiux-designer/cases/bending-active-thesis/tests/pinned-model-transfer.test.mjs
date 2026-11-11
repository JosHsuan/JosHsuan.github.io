import test from 'node:test';
import assert from 'node:assert/strict';
import {readPinnedModelResponse} from '../components/pinned-model-transfer.mjs';

test('decoded native chunks preserve exact bytes and report strictly increasing progress',async()=>{
 const progress=[],source=new Uint8Array([1,2,3,4,5]);
 const response=new Response(new ReadableStream({start(controller){
  controller.enqueue(source.subarray(0,2));controller.enqueue(new Uint8Array());controller.enqueue(source.subarray(2));controller.close();
 }}),{headers:{'content-encoding':'gzip','content-length':'3'}});
 const result=await readPinnedModelResponse(response,{bytes:5,signal:new AbortController().signal,onProgress:loaded=>progress.push(loaded)});
 assert.deepEqual(new Uint8Array(result),source);assert.deepEqual(progress,[2,5]);assert.equal(response.body.locked,false);
});

test('truncated and oversized bodies cannot satisfy a pinned source allocation',async()=>{
 for(const length of [2,6]){
  const response=new Response(new Uint8Array(length));
  await assert.rejects(readPinnedModelResponse(response,{bytes:5,signal:new AbortController().signal}),/byte count differs/);
  assert.equal(response.body.locked,false);
 }
});

test('abort after a native chunk cancels the reader without another progress fact',async()=>{
 const transfer=new AbortController();let cancelled=0,progress=0;
 const response=new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array([1]));},cancel(){cancelled++;}}));
 await assert.rejects(readPinnedModelResponse(response,{bytes:5,signal:transfer.signal,onProgress(){progress++;transfer.abort();}}),{name:'AbortError'});
 assert.equal(progress,1);assert.equal(cancelled,1);assert.equal(response.body.locked,false);
});
