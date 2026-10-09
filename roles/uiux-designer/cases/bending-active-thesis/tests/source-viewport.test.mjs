import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSourceViewport} from '../components/source-viewport.mjs';

test('ordinary desktop source coordinates retain the existing clipping contract',()=>{
  const result=resolveSourceViewport({left:734,right:1354,top:190,bottom:710,height:520},{width:1440,height:1000},{left:0,top:0,width:1440,height:1000});
  assert.equal(result.weight,1);
  assert.deepEqual(result.viewport,{left:734/1440,top:.19,width:620/1440,height:.52});
});

test('a stable tall phone Canvas fits the source inside the shorter visible reading area',()=>{
  const rect={left:18,right:372,top:170,bottom:704,height:534};
  const expanded=resolveSourceViewport(rect,{width:390,height:700},{left:0,top:0,width:390,height:844});
  const collapsed=resolveSourceViewport(rect,{width:390,height:844},{left:0,top:0,width:390,height:844});
  assert.equal(expanded.viewport.top*844,170);
  assert.equal((expanded.viewport.top+expanded.viewport.height)*844,614);
  assert.equal((collapsed.viewport.top+collapsed.viewport.height)*844,704);
  assert(expanded.weight>0&&expanded.weight<1);
  assert.equal(collapsed.weight,1);
});

test('offset Canvas coordinates and clipping remain bounded while offscreen sources stay inactive',()=>{
  const canvas={left:10,top:20,width:370,height:800};
  const active=resolveSourceViewport({left:0,right:400,top:50,bottom:1000,height:950},{width:390,height:844},canvas);
  assert.equal(active.viewport.left,6/370);assert.equal(active.viewport.top,72/800);
  assert(active.viewport.left+active.viewport.width<=1);assert(active.viewport.top+active.viewport.height<=1);
  const absent=resolveSourceViewport({left:18,right:372,top:900,bottom:1300,height:400},{width:390,height:844},canvas);
  assert.equal(absent.weight,0);
});
