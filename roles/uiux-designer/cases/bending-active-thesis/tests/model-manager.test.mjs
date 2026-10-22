import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelManager,MODEL_STUDIES,expireSourceSelection} from '../runtime/features/ModelManager.mjs';
import {createStoryInput} from '../components/story-input.js';
import {createInspectionState} from '../components/inspection-state.mjs';
import {createChapterPlayback,advanceChapterPlayback,sampleChapterPlayback} from '../components/chapter-playback.mjs';
import {resolveSourceSelection} from '../components/source-scene-score.mjs';

function setup(){
 const input=createStoryInput(),inspection=createInspectionState(),captures=new Set(),label={textContent:'Origami representation'},announcement={textContent:''};
 const surface={dataset:{sourceIndex:'0'},setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id),
  closest:()=>({querySelector:selector=>selector==='[data-source-label]'?label:announcement})};
 let source=true;
 let sourceIndex=0;
 const manager=createModelManager({input,inspection,hitTest:()=>source?{source:true,chapterId:'form',index:sourceIndex}:null});
 manager.bindSurface('form',surface);
 const pointer=(patch={})=>({button:0,isPrimary:true,pointerId:1,pointerType:'mouse',clientX:10,clientY:20,timeStamp:0,currentTarget:surface,...patch});
 return {input,inspection,surface,captures,label,announcement,manager,pointer,setSource:value=>{source=value;},setSourceIndex:value=>{sourceIndex=value;}};
}

test('only a real source press captures; visible object follows both drag axes and releases without comparing',()=>{
 const f=setup(),study=MODEL_STUDIES[0];
 f.setSource(false);f.manager.begin(f.pointer(),study,f.surface,true);assert.equal(f.captures.size,0);
 f.setSource(true);f.manager.begin(f.pointer(),study,f.surface,true);assert(f.captures.has(1));
 f.manager.move(f.pointer({clientX:30,clientY:30}),true);
 assert.equal(f.inspection.target.azimuth,25.4);assert.equal(f.inspection.target.elevation,31.8);assert.equal(f.input.get().modelEngaged,true);
 f.manager.move(f.pointer({clientX:-10,clientY:10}),true);
 assert.equal(f.inspection.target.azimuth,34.6);assert.equal(f.inspection.target.elevation,28.2);
 f.manager.end(f.pointer({timeStamp:100}),false,true);
 assert.equal(f.captures.size,0);assert.equal(f.input.get().sourceSelection,null);assert.equal(f.input.get().modelEngaged,false);
 assert.equal(f.input.get().modelHeldSource,null);
});

test('native touch tap compares without capture; touch pan never rotates or selects',()=>{
 for(const drag of [false,true]){
  const f=setup(),study=MODEL_STUDIES[0];
  f.manager.begin(f.pointer({pointerType:'touch'}),study,f.surface,true);
  assert.equal(f.captures.size,0);assert.equal(f.input.get().modelEngaged,false);
  if(drag){
   f.manager.move(f.pointer({pointerType:'touch',clientX:40,clientY:60}),true);
   assert.equal(f.inspection.target.azimuth,30);assert.equal(f.inspection.target.elevation,30);
  }
  f.manager.end(f.pointer({pointerType:'touch',timeStamp:200}),false,true);
  assert.equal(f.input.get().sourceSelection?.index,drag?undefined:1);
  assert.equal(f.captures.size,0);assert.equal(f.input.get().modelEngaged,false);
  assert.equal(f.input.get().modelHeldSource,null);
  if(!drag){assert.equal(f.label.textContent,'Origami representation');assert.equal(f.surface.dataset.sourceIndex,'0');assert.match(f.announcement.textContent,/Opening representation.*Comparison requested/);}
 }
});

test('keyboard ownership survives a source press blur and Escape clears the comparison',()=>{
 const f=setup(),study=MODEL_STUDIES[0];let prevented=0;
 const key=value=>({key:value,repeat:false,currentTarget:f.surface,preventDefault(){prevented++;}});
 f.manager.key(key('ArrowRight'),study,true);assert.equal(f.inspection.target.azimuth,23);
 f.manager.begin(f.pointer(),study,f.surface,true);f.manager.blur();
 assert(f.captures.has(1));assert.equal(f.manager.inspect().pointerId,1);
 f.manager.end(f.pointer({timeStamp:100}),false,true);assert.equal(f.input.get().sourceSelection.index,1);
 f.manager.key(key('Escape'),study,true);assert.equal(f.input.get().sourceSelection,null);assert.equal(f.input.get().modelEngaged,false);assert.equal(prevented,2);
});

test('touch cancellation, lost capture, unavailable scene and listener teardown release ownership exactly once',()=>{
 for(const end of ['cancel','lost','unavailable','disconnect']){
  const f=setup(),documentTarget=new EventTarget();
  const disconnect=f.manager.connectPointer(documentTarget,MODEL_STUDIES,true);
  f.manager.begin(f.pointer({pointerType:'touch'}),MODEL_STUDIES[0],f.surface,true);
  f.manager.move(f.pointer({pointerType:'touch',clientY:80}),true);
  assert.equal(f.inspection.target.elevation,30);
  if(end==='cancel')f.manager.end(f.pointer({pointerType:'touch',timeStamp:200}),true,true);
  if(end==='lost')f.manager.lostCapture(f.pointer());
  if(end==='unavailable')f.manager.unavailable();
  if(end==='disconnect')disconnect();
  assert.equal(f.manager.inspect().pointerId,null);assert.equal(f.captures.size,0);
  assert.equal(f.input.get().sourceSelection,null);assert.equal(f.input.get().modelEngaged,false);
  assert.equal(f.input.get().modelHeldSource,null);
  assert.equal(f.inspection.target.azimuth,30);assert.equal(f.inspection.target.elevation,30);
  f.manager.end(f.pointer({timeStamp:250}),false,true);assert.equal(f.input.get().sourceSelection,null);
  disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
 }
});

test('secondary contacts and touch presses outside the real model cannot take ownership',()=>{
 const f=setup();f.setSource(false);
 f.manager.begin(f.pointer({pointerType:'touch'}),MODEL_STUDIES[0],f.surface,true);
 assert.equal(f.captures.size,0);assert.equal(f.manager.inspect().pointerId,null);
 f.setSource(true);f.manager.begin(f.pointer({pointerType:'touch',isPrimary:false}),MODEL_STUDIES[0],f.surface,true);
 assert.equal(f.captures.size,0);assert.equal(f.manager.inspect().pointerId,null);
 f.manager.begin(f.pointer({pointerType:'touch'}),MODEL_STUDIES[0],f.surface,true);
 f.manager.move(f.pointer({pointerType:'touch',pointerId:2,clientX:100}),true);
 assert.equal(f.inspection.target.azimuth,30);
});

test('page lifecycle ends a held gesture and disconnect removes all native callbacks',()=>{
 const f=setup(),windowTarget=new EventTarget(),documentTarget=new EventTarget();documentTarget.hidden=false;
 const disconnect=f.manager.connectLifecycle({window:windowTarget,document:documentTarget});
 f.manager.begin(f.pointer(),MODEL_STUDIES[0],f.surface,true);windowTarget.dispatchEvent(new Event('pagehide'));
 assert.equal(f.captures.size,0);assert.equal(f.manager.inspect().pointerId,null);
 disconnect();disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
 const revision=f.input.get().inspectionRevision;documentTarget.dispatchEvent(new Event('freeze'));
 assert.equal(f.input.get().inspectionRevision,revision);
});

test('pointer ownership captures the painted hit without changing a pending comparison or the shared clock',()=>{
 const f=setup();f.setSourceIndex(2);
 f.input.publishFrame({playback:{activeSeconds:15}});
 f.input.commands.execute('model.select',{chapterId:'form',index:3,selectedAt:15});
 const selection=f.input.get().sourceSelection;
 f.manager.begin(f.pointer(),MODEL_STUDIES[0],f.surface,true);
 assert.deepEqual(f.input.get().modelHeldSource,{chapterId:'form',index:2});
 assert.deepEqual(f.input.get().sourceSelection,selection);assert.equal(f.input.get().playback.activeSeconds,15);
 f.manager.move(f.pointer({clientX:35}),true);f.manager.end(f.pointer({timeStamp:100}),false,true);
 assert.equal(f.input.get().modelHeldSource,null);assert.deepEqual(f.input.get().sourceSelection,selection);
});

test('keyboard holds painted sources and preserves an explicit comparison that is awaiting its first paint',()=>{
 const f=setup(),study=MODEL_STUDIES[0],key=value=>({key:value,repeat:false,currentTarget:f.surface,preventDefault(){}});
 f.surface.dataset.sourceIndex='2';f.input.publishFrame({playback:{activeSeconds:15}});
 f.manager.key(key('ArrowLeft'),study,true);
 assert.deepEqual(f.input.get().modelHeldSource,{chapterId:'form',index:2});
 f.surface.dataset.sourceIndex='3';f.manager.key(key('ArrowRight'),study,true);
 assert.deepEqual(f.input.get().modelHeldSource,{chapterId:'form',index:2});
 f.manager.key(key('Escape'),study,true);assert.equal(f.input.get().modelHeldSource,null);
 f.surface.dataset.sourceIndex='2';f.manager.key(key('Enter'),study,true);
 assert.equal(f.input.get().modelHeldSource,null);assert.equal(f.input.get().sourceSelection.index,3);
 f.manager.key(key('ArrowLeft'),study,true);
 assert.deepEqual(f.input.get().modelHeldSource,{chapterId:'form',index:3});
 f.manager.key(key('Escape'),study,true);assert.equal(f.input.get().modelHeldSource,null);
});

test('chapter ownership changes release capture and cannot turn a later pointerup into a comparison',()=>{
 const f=setup(),disconnect=f.manager.connectPointer(new EventTarget(),MODEL_STUDIES,true);
 f.manager.begin(f.pointer(),MODEL_STUDIES[0],f.surface,true);
 f.input.updateInteraction({modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,modelHeldSource:null});
 assert.equal(f.captures.size,0);assert.equal(f.manager.inspect().pointerId,null);assert.equal(f.input.get().modelHeldSource,null);
 f.manager.end(f.pointer({timeStamp:100}),false,true);assert.equal(f.input.get().sourceSelection,null);
 disconnect();
});

test('comparison expiry closes committed state once at the same eight-active-second boundary as the source sampler',()=>{
 const f=setup(),playback=createChapterPlayback('form'),scope=f.input.events.createScope('comparison-expiry'),facts=[];
 f.input.events.on(scope,'stateChanged',event=>facts.push(['state',event.current.sourceSelection]));
 f.input.events.on(scope,'representationChanged',event=>facts.push(['selection',event.selection]));
 f.input.commands.execute('model.select',{chapterId:'form',index:3,selectedAt:0});facts.length=0;
 const selection=f.input.get().sourceSelection;
 advanceChapterPlayback(playback,7.999,{chapter:'form'});
 assert.equal(resolveSourceSelection(sampleChapterPlayback(playback),selection).pinned,true);
 assert.equal(expireSourceSelection(f.input,playback.activeSeconds),false);assert.deepEqual(facts,[]);
 advanceChapterPlayback(playback,.001,{chapter:'form'});
 assert.equal(resolveSourceSelection(sampleChapterPlayback(playback),selection).pinned,false);
 assert.equal(expireSourceSelection(f.input,playback.activeSeconds),true);
 assert.equal(f.input.get().sourceSelection,null);assert.deepEqual(facts,[['state',null],['selection',null]]);
 const version=f.input.state.version;
 for(let tick=0;tick<5;tick++)assert.equal(expireSourceSelection(f.input,playback.activeSeconds+tick),false);
 assert.equal(f.input.state.version,version);assert.equal(facts.length,2);
 scope.dispose();f.input.dispose();
});

test('expiry preserves the independently held painted source, inspection ownership and camera target',()=>{
 const f=setup();f.setSourceIndex(2);
 f.input.commands.execute('model.select',{chapterId:'form',index:3,selectedAt:0});
 f.manager.begin(f.pointer(),MODEL_STUDIES[0],f.surface,true);
 f.manager.move(f.pointer({clientX:45,clientY:35}),true);
 const held=f.input.get().modelHeldSource,target={...f.inspection.target};
 assert.equal(expireSourceSelection(f.input,8),true);
 assert.equal(f.input.get().modelEngaged,true);assert.deepEqual(f.input.get().modelHeldSource,held);
 assert.deepEqual(f.inspection.target,target);assert.equal(f.captures.has(1),true);
 const selected=resolveSourceSelection(sampleChapterPlayback(createChapterPlayback('form')),null,null,held);
 assert.equal(selected.index,2);assert.equal(selected.held,true);assert.equal(selected.pinned,false);
 f.manager.end(f.pointer({timeStamp:200}),true,true);f.input.dispose();
});

test('hidden, resumed, Reduced and held time do not consume the comparison lifetime; a newer request owns its own deadline',()=>{
 const f=setup(),playback=createChapterPlayback('form');
 f.input.commands.execute('model.select',{chapterId:'form',index:3,selectedAt:0});
 advanceChapterPlayback(playback,4,{chapter:'form'});
 for(const flags of [{hidden:true},{resumed:true},{reducedMotion:true},{engaged:true}]){
  advanceChapterPlayback(playback,100,{chapter:'form',...flags});
  assert.equal(playback.activeSeconds,4);assert.equal(expireSourceSelection(f.input,playback.activeSeconds),false);
 }
 f.input.commands.execute('model.select',{chapterId:'form',index:1,selectedAt:4});
 advanceChapterPlayback(playback,4,{chapter:'form'});assert.equal(playback.activeSeconds,8);
 assert.equal(expireSourceSelection(f.input,playback.activeSeconds),false);assert.equal(f.input.get().sourceSelection.index,1);
 advanceChapterPlayback(playback,4,{chapter:'form'});assert.equal(expireSourceSelection(f.input,playback.activeSeconds),true);
 f.input.dispose();
});


test('touch cancellation and pan leave unrelated keyboard inspection untouched until an actual comparison',()=>{
 for(const ending of ['cancel','pan','lost','tap']){
  const f=setup(),study=MODEL_STUDIES[0];
  f.manager.key({key:'ArrowRight',currentTarget:f.surface,preventDefault(){}},study,true);
  const before={...f.inspection.target},held=f.input.get().modelHeldSource;
  const event=patch=>f.pointer({pointerType:'touch',preventDefault(){throw Error('Touch must stay native');},...patch});
  f.manager.begin(event(),study,f.surface,true);f.manager.blur();
  assert.equal(f.captures.size,0);assert.deepEqual(f.inspection.target,before);assert.equal(f.input.get().modelEngaged,true);
  if(ending==='pan')f.manager.move(event({clientY:100}),true);
  if(ending==='lost')f.manager.lostCapture(event());
  else f.manager.end(event({timeStamp:200}),ending==='cancel',true);
  if(ending==='tap'){assert.equal(f.input.get().sourceSelection.index,1);assert.equal(f.input.get().modelEngaged,false);}
  else{assert.deepEqual(f.inspection.target,before);assert.deepEqual(f.input.get().modelHeldSource,held);assert.equal(f.input.get().modelEngaged,true);assert.equal(f.input.get().sourceSelection,null);}
 }
});

test('touch up travel, negative duration, expired press and no-longer-hit source do not compare',()=>{
 for(const patch of [{clientX:100,timeStamp:100},{timeStamp:-1},{timeStamp:650},{timeStamp:100,outside:true}]){
  const f=setup();f.manager.begin(f.pointer({pointerType:'touch'}),MODEL_STUDIES[0],f.surface,true);
  if(patch.outside)f.setSource(false);
  f.manager.end(f.pointer({pointerType:'touch',...patch}),false,true);
  assert.equal(f.input.get().sourceSelection,null);assert.equal(f.captures.size,0);
 }
});
