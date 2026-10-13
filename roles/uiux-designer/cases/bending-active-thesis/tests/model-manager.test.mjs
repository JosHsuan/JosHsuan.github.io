import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelManager,MODEL_STUDIES} from '../runtime/features/ModelManager.mjs';
import {createStoryInput} from '../components/story-input.js';
import {createInspectionState} from '../components/inspection-state.mjs';

function setup(){
 const input=createStoryInput(),inspection=createInspectionState(),captures=new Set(),label={textContent:'Origami representation'},announcement={textContent:''};
 const surface={dataset:{sourceIndex:'0'},setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id),
  closest:()=>({querySelector:selector=>selector==='[data-source-label]'?label:announcement})};
 let source=true;
 const manager=createModelManager({input,inspection,hitTest:()=>source?{source:true,chapterId:'form'}:null});
 manager.bindSurface('form',surface);
 const pointer=(patch={})=>({button:0,isPrimary:true,pointerId:1,pointerType:'mouse',clientX:10,clientY:20,timeStamp:0,currentTarget:surface,...patch});
 return {input,inspection,surface,captures,label,announcement,manager,pointer,setSource:value=>{source=value;}};
}

test('only a real source press captures; drag updates targets and releases without comparing',()=>{
 const f=setup(),study=MODEL_STUDIES[0];
 f.setSource(false);f.manager.begin(f.pointer(),study,f.surface,true);assert.equal(f.captures.size,0);
 f.setSource(true);f.manager.begin(f.pointer(),study,f.surface,true);assert(f.captures.has(1));
 f.manager.move(f.pointer({clientX:30,clientY:30}),true);
 assert.equal(f.inspection.target.azimuth,34.6);assert.equal(f.input.get().modelEngaged,true);
 f.manager.end(f.pointer({timeStamp:100}),false,true);
 assert.equal(f.captures.size,0);assert.equal(f.input.get().sourceSelection,null);assert.equal(f.input.get().modelEngaged,false);
});

test('a touch tap compares but native touch travel neither captures nor selects',()=>{
 for(const pan of [false,true]){
  const f=setup(),study=MODEL_STUDIES[0];
  f.manager.begin(f.pointer({pointerType:'touch'}),study,f.surface,true);
  assert.equal(f.captures.size,0);assert.notEqual(f.input.get().modelEngaged,true);
  if(pan)f.manager.move(f.pointer({pointerType:'touch',clientY:90}),true);
  f.manager.end(f.pointer({pointerType:'touch',timeStamp:200}),false,true);
  assert.equal(f.input.get().sourceSelection?.index,pan?undefined:1);
  if(!pan){assert.equal(f.label.textContent,'Origami representation');assert.equal(f.surface.dataset.sourceIndex,'0');assert.match(f.announcement.textContent,/Opening representation.*Comparison requested/);}
 }
});

test('keyboard ownership survives a source press blur and Escape clears the comparison',()=>{
 const f=setup(),study=MODEL_STUDIES[0];let prevented=0;
 const key=value=>({key:value,repeat:false,currentTarget:f.surface,preventDefault(){prevented++;}});
 f.manager.key(key('ArrowRight'),study,true);assert.equal(f.inspection.target.azimuth,37);
 f.manager.begin(f.pointer(),study,f.surface,true);f.manager.blur();
 assert(f.captures.has(1));assert.equal(f.manager.inspect().pointerId,1);
 f.manager.end(f.pointer({timeStamp:100}),false,true);assert.equal(f.input.get().sourceSelection.index,1);
 f.manager.key(key('Escape'),study,true);assert.equal(f.input.get().sourceSelection,null);assert.equal(f.input.get().modelEngaged,false);assert.equal(prevented,2);
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
