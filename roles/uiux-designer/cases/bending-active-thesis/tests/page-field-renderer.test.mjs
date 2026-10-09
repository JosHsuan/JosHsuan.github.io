import test from 'node:test';
import assert from 'node:assert/strict';
import {createPageFieldRenderer,resolvePageFieldBudget,PAGE_FIELD_LIMITS,pageFieldGlyph} from '../components/page-field-renderer.mjs';

function fakeCanvas(){
  let width=300,height=150;const writes=[],events=new Map();
  const context={clears:0,glyphs:0,setTransform(){},clearRect(){this.clears++;},drawImage(){this.glyphs++;},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
  return {context,writes,events,get width(){return width;},set width(value){width=value;writes.push([width,height]);},get height(){return height;},set height(value){height=value;writes.push([width,height]);},getContext(type){assert.equal(type,'2d');return context;},addEventListener(name,handler){events.set(name,handler);},removeEventListener(name){events.delete(name);}};
}
const field={fieldTime:0,fieldWeight:.3,fieldEnvelope:[.65,.5,.5,.62],fieldFlow:[.035,-.018],fieldPointerUv:[.5,.5],fieldPointerStrength:0,asciiCellPx:11,asciiTint:[.64,.29,.105]};
// Existing lifecycle cases use a 1x clock; cadence regression below deliberately
// separates the controller timestamp from accelerated authored scene time.
const draw=(renderer,state,width,height)=>renderer.render({frameTimeMs:(state.field?.fieldTime??0)*1000,...state},width,height);

test('viewport field bounds both physical pixels and cell evaluations at any display size',()=>{
  for(const [width,height] of [[390,844],[430,932],[1440,1000],[3840,2160],[6000,4000],[20000,200]])for(const cell of [6,9,11,28]){
    const budget=resolvePageFieldBudget(width,height,cell);
    assert.ok(budget.width*budget.height<=PAGE_FIELD_LIMITS.pixels);assert.ok(budget.cells<=PAGE_FIELD_LIMITS.cells);
    assert.equal(budget.cells,budget.columns*budget.rows);assert.ok(budget.cellPx>=cell);assert.ok(budget.width<=4096&&budget.height<=4096);
  }
  assert.throws(()=>resolvePageFieldBudget(100,100,11,{cells:.5}),RangeError);
});

test('page field survives absent 3D, follows only supplied time and has no repeated backing allocations',()=>{
  const canvas=fakeCanvas(),atlas=fakeCanvas(),renderer=createPageFieldRenderer(canvas,{createCanvas:()=>atlas});
  const first=draw(renderer,{field,canvasPlacement:{visible:false}},1440,1000);
  assert.equal(first.draws,1);assert.ok(first.drawnGlyphs>0);assert.equal(first.atlasBuilds,1);
  const writes=canvas.writes.length;
  draw(renderer,{field:{...field,fieldTime:.01,fieldPointerStrength:1}},1440,1000);
  assert.equal(renderer.inspect().draws,1);
  for(let frame=1;frame<=90;frame++)draw(renderer,{field:{...field,fieldTime:frame/30}},1440,1000);
  assert.ok(renderer.inspect().draws>30);assert.ok(renderer.inspect().draws<=91);
  assert.equal(canvas.writes.length,writes);assert.equal(renderer.inspect().atlasBuilds,1);
});

test('Pause and hidden do no 2D work; Reduced clears once and failure/disposal release resources',()=>{
  const canvas=fakeCanvas(),renderer=createPageFieldRenderer(canvas,{createCanvas:fakeCanvas});draw(renderer,{field},430,932);
  const before={...renderer.inspect()},clears=canvas.context.clears,writes=canvas.writes.length;
  draw(renderer,{field:{...field,fieldTime:20},paused:true},932,430);
  draw(renderer,{field:{...field,fieldTime:30},hidden:true},932,430);
  assert.equal(renderer.inspect().draws,before.draws);assert.equal(canvas.context.clears,clears);assert.equal(canvas.writes.length,writes);
  draw(renderer,{field,systemReduced:true},430,932);draw(renderer,{field,systemReduced:true},430,932);assert.equal(canvas.context.clears,clears+1);
  canvas.events.get('contextlost')({preventDefault(){}});draw(renderer,{field},430,932);assert.equal(renderer.inspect().contextLost,true);
  canvas.events.get('contextrestored')();draw(renderer,{field},430,932);assert.equal(renderer.inspect().draws,before.draws+1);
  renderer.dispose();renderer.dispose();assert.equal(canvas.width,1);assert.equal(canvas.height,1);assert.equal(canvas.events.size,0);
  assert.equal(draw(renderer,{field},430,932).skipReason,'disposed');
});

test('orientation native assignments never transiently exceed physical field budget',()=>{
  const canvas=fakeCanvas(),renderer=createPageFieldRenderer(canvas,{createCanvas:fakeCanvas});
  for(const [width,height] of [[400,2200],[2200,400],[400,2200]])draw(renderer,{field},width,height);
  assert.ok(canvas.writes.length>4);for(const [width,height] of canvas.writes)assert.ok(width*height<=PAGE_FIELD_LIMITS.pixels);
  // Original glyph silhouette checks: punctuation stays sparse; plus has arms.
  assert.ok(pageFieldGlyph(0,-.22,0)>.99);assert.equal(pageFieldGlyph(.4,.4,0),0);assert.ok(pageFieldGlyph(.3,0,3)>.99);
});

test('optional 2D allocation and drawing failures disable only the field and never strand its caller',()=>{
  const denied=fakeCanvas();denied.getContext=()=>{throw Error('2D context unavailable');};
  const noContext=createPageFieldRenderer(denied,{createCanvas:fakeCanvas});
  assert.equal(draw(noContext,{field},430,932).failed,true);assert.doesNotThrow(()=>noContext.dispose());
  for(const failure of ['atlas','draw']){
    const canvas=fakeCanvas(),atlas=fakeCanvas();let attempts=0;
    if(failure==='atlas')atlas.context.createImageData=()=>{attempts++;throw Error('Atlas allocation failed');};
    else canvas.context.drawImage=()=>{attempts++;throw Error('Drawing storage lost');};
    const renderer=createPageFieldRenderer(canvas,{createCanvas:()=>atlas});
    const report=draw(renderer,{field},430,932);assert.equal(report.failed,true);assert.equal(report.ready,false);assert.equal(report.skipReason,'failed');
    assert.match(report.failureReason,/failed|lost/);assert.equal(canvas.width,1);assert.equal(canvas.height,1);
    assert.equal(draw(renderer,{field:{...field,fieldTime:10}},430,932).failed,true);assert.equal(attempts,1);
    assert.doesNotThrow(()=>renderer.dispose());
  }
  assert.throws(()=>createPageFieldRenderer(null),TypeError);
  assert.throws(()=>createPageFieldRenderer(fakeCanvas(),{pixelBudget:0}),RangeError);
});

test('accelerated story tempo cannot exceed 30 field updates per real controller second',()=>{
  for(const tempo of [1,2.4]){
    const renderer=createPageFieldRenderer(fakeCanvas(),{createCanvas:fakeCanvas});
    for(let frame=0;frame<=60;frame++)renderer.render({frameTimeMs:frame*1000/60,field:{...field,fieldTime:frame*tempo/60}},390,844);
    const result=renderer.inspect();assert.equal(result.draws,31);assert.equal(result.frameTimeMs,1000);
    assert.equal(result.fieldTime,tempo,'The artwork still reaches its accelerated scene-time sample');
    renderer.dispose();
  }
  const renderer=createPageFieldRenderer(fakeCanvas(),{createCanvas:fakeCanvas});
  for(const frameTimeMs of [undefined,NaN,Infinity,-1])assert.throws(()=>renderer.render({field,frameTimeMs},390,844),RangeError);
  assert.equal(renderer.inspect().failed,false,'Invalid integration arguments are not reported as resource failures');
});
