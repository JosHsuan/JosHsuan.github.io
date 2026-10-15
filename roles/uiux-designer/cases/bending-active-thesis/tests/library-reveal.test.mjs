import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LIBRARY_REVEAL_SECONDS,createLibraryReveal,advanceLibraryReveal,cancelLibraryReveal,sampleLibraryReveal} from '../runtime/motion/library-reveal.mjs';
import {createLibraryDiagramPresenter} from '../runtime/presentation/LibraryDiagramPresenter.mjs';

test('eleven real source traces run from the bottom upward in ascending 60–160 mm order',async()=>{
 const source=JSON.parse(await readFile(new URL('../release/public/assets/diagrams/library.json',import.meta.url),'utf8'));
 const groups=[...source.groups].reverse();
 assert.deepEqual(groups.map(group=>group.label),Array.from({length:11},(_,index)=>`${60+index*10} mm`));
 for(const [index,group] of groups.entries()){
  const path=source.paths.find(item=>item.id===group.paths[0]);
  assert.equal(path.id,`p${937-index}`);
  const numbers=path.attrs.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert(Math.abs(numbers[1]-group.bounds[3])<.001,'first point is the actual bottom endpoint');
  assert(Math.abs(numbers.at(-1)-group.bounds[1])<.001,'last point is the actual upper endpoint');
  assert.equal(path.attrs.fill,'none');
 }
});

test('a visibility request draws each entire trace before starting the next and closes once',()=>{
 const state=createLibraryReveal();
 assert.deepEqual(advanceLibraryReveal(state,10,{visible:false}),[]);
 assert.deepEqual(advanceLibraryReveal(state,10,{visible:true}).map(event=>event.status),['requested']);
 assert.deepEqual(sampleLibraryReveal(state),Array(11).fill(0),'time before the request never consumes the sequence');
 advanceLibraryReveal(state,.14,{visible:true});
 assert(Math.abs(sampleLibraryReveal(state)[0]-.5)<1e-9);
 assert(sampleLibraryReveal(state).slice(1).every(progress=>progress===0));
 advanceLibraryReveal(state,.14,{visible:true});
 assert.equal(sampleLibraryReveal(state)[0],1);
 advanceLibraryReveal(state,.04,{visible:true});
 assert(sampleLibraryReveal(state).slice(1).every(progress=>progress===0));
 advanceLibraryReveal(state,.14,{visible:true});
 assert.equal(sampleLibraryReveal(state)[0],1);assert(Math.abs(sampleLibraryReveal(state)[1]-.5)<1e-9);
 const completion=advanceLibraryReveal(state,LIBRARY_REVEAL_SECONDS,{visible:true});
 assert.deepEqual(completion,[{id:1,kind:'library',status:'completed',reason:'finished'}]);
 assert.deepEqual(sampleLibraryReveal(state),Array(11).fill(1));
 advanceLibraryReveal(state,0,{visible:false});
 assert.deepEqual(advanceLibraryReveal(state,0,{visible:true}),[],'completed drawings never replay on re-entry');
});

test('active foreground time is independent of frame cadence, while hidden/resume consume none',()=>{
 const slow=createLibraryReveal(),fast=createLibraryReveal();
 for(const state of [slow,fast])advanceLibraryReveal(state,0,{visible:true});
 for(let index=0;index<3;index++)advanceLibraryReveal(slow,1/3,{visible:true});
 for(let index=0;index<60;index++)advanceLibraryReveal(fast,1/60,{visible:true});
 for(const [index,value] of sampleLibraryReveal(slow).entries())assert(Math.abs(value-sampleLibraryReveal(fast)[index])<1e-10);
 const elapsed=slow.elapsed;
 advanceLibraryReveal(slow,300,{visible:true,hidden:true});
 advanceLibraryReveal(slow,300,{visible:true,resumed:true});
 assert.equal(slow.elapsed,elapsed);
 assert.equal(advanceLibraryReveal(slow,3,{visible:true})[0].status,'completed','slow foreground frames still finish');
});

test('an interrupted reveal closes, restores the complete drawing and re-entry gets a new request',()=>{
 const state=createLibraryReveal();advanceLibraryReveal(state,0,{visible:true});advanceLibraryReveal(state,.2,{visible:true});
 const cancelled=advanceLibraryReveal(state,0,{visible:false,onScreen:false});
 assert.deepEqual(cancelled,[{id:1,kind:'library',status:'cancelled',reason:'offscreen'}]);
 assert.deepEqual(sampleLibraryReveal(state),Array(11).fill(1));
 assert.deepEqual(advanceLibraryReveal(state,1,{visible:false,onScreen:false}),[]);
 assert.deepEqual(advanceLibraryReveal(state,0,{visible:true}),[{id:2,kind:'library',status:'requested',reason:'visible'}]);
 assert.equal(cancelLibraryReveal(state,'disposed')[0].id,2);
 assert.deepEqual(cancelLibraryReveal(state,'disposed'),[]);
});

test('Reduced immediately provides the original complete drawing and exactly one terminal fact',()=>{
 for(const alreadyPlaying of [false,true]){
  const state=createLibraryReveal();
  if(alreadyPlaying)advanceLibraryReveal(state,0,{visible:true});
  const events=advanceLibraryReveal(state,.1,{visible:true,reduced:true});
  assert.deepEqual(events.map(event=>event.status),alreadyPlaying?['completed']:['requested','completed']);
  assert.equal(events.at(-1).reason,'reduced');
  assert.deepEqual(sampleLibraryReveal(state),Array(11).fill(1));
  assert.deepEqual(advanceLibraryReveal(state,1,{visible:true,reduced:true}),[]);
 }
});

function fixture({onEmit=()=>{}}={}){
 const operations=[],events=[];
 const paths=Array.from({length:11},(_,index)=>({dataset:{libraryTrace:String(10-index)},styles:new Map()}));
 const drawing={top:600,offsetHeight:400};
 const element={attrs:new Map(),querySelector:()=>drawing,querySelectorAll:()=>paths};
 const root={nodes:[element],querySelectorAll(){return this.nodes;}};
 const publisher={style(node,key,value){operations.push('paint:'+key);if(value==='')node.styles.delete(key);else node.styles.set(key,String(value));},attribute(node,key,value){if(value===null)node.attrs.delete(key);else node.attrs.set(key,String(value));}};
 const presenter=createLibraryDiagramPresenter({publisher,root,emit:event=>{operations.push('event:'+event.status);events.push({event,paint:paths.map(path=>Object.fromEntries(path.styles))});onEmit(event);}});
 const measure=()=>presenter.measure({naturalY:node=>node.top,viewportHeight:800});
 const publish=options=>presenter.publish({docY:0,dt:0,...options});
 measure();return{presenter,paths,drawing,root,element,events,operations,measure,publish};
}

test('DOM presentation uses source order, preserves progress on remeasure and emits only after final paint',()=>{
 const f=fixture();assert(f.publish());assert.equal(f.element.attrs.get('data-diagram-reveal'),'playing');
 f.publish({dt:.14});
 assert.equal(f.paths.at(-1).styles.get('stroke-dashoffset'),'0.5');
 assert.equal(f.paths[0].styles.get('visibility'),'hidden');
 f.measure();assert(Math.abs(f.presenter.inspect().items[0].elapsed-.14)<1e-9);
 f.publish({dt:4});
 assert.equal(f.events.at(-1).event.status,'completed');
 assert(f.events.at(-1).paint.every(styles=>Object.keys(styles).length===0),'completion observes restored original path paint');
 assert.equal(f.operations.at(-1),'event:completed');assert.deepEqual(f.presenter.inspect().open,[]);
 assert.equal(f.publish({dt:5}),false);
});

test('viewport exit, source removal and disposal restore source paint before cancelling active requests',()=>{
 for(const reason of ['offscreen','removed','disposed']){
  const f=fixture();f.publish();f.publish({dt:.14});
  if(reason==='offscreen')f.publish({docY:2000});
  else if(reason==='removed'){f.root.nodes=[];f.measure();}
  else f.presenter.dispose();
  const last=f.events.at(-1);assert.equal(last.event.reason,reason);assert.equal(last.event.status,'cancelled');
  assert(last.paint.every(styles=>Object.keys(styles).length===0));
  f.presenter.dispose();assert.equal(f.events.filter(row=>row.event.status==='cancelled').length,1);
 }
});

test('returning to Home closes an open library after document suspension and restores its original paint before the terminal',()=>{
 const f=fixture();
 // Home precedes the seven project chapters. Use the measured document
 // positions, independently of a semantic Home/Project presentation label.
 f.drawing.top=2000;f.measure();
 f.publish({docY:1800});f.publish({docY:1800,dt:.14});
 assert.deepEqual(f.presenter.inspect().open,[1]);
 const elapsed=f.presenter.inspect().items[0].elapsed;
 // A hidden document does no work, even if its native position has changed.
 assert.equal(f.publish({docY:0,dt:300,hidden:true}),false);
 assert.equal(f.presenter.inspect().items[0].elapsed,elapsed);assert.equal(f.events.length,1);
 assert(f.paths.some(path=>path.styles.size>0));
 // Home is visible after resume, so viewport exit must still cancel before
 // any elapsed time is consumed. It is not another hidden-document reason.
 assert.equal(f.publish({docY:0,dt:300,resumed:true}),false);
 assert.deepEqual(f.events.at(-1).event,{id:1,kind:'library',status:'cancelled',reason:'offscreen'});
 assert(f.events.at(-1).paint.every(styles=>Object.keys(styles).length===0));
 assert.equal(f.operations.at(-1),'event:cancelled');assert.deepEqual(f.presenter.inspect().open,[]);
 f.publish({docY:0,dt:1});assert.equal(f.events.length,2,'remaining on Home emits no duplicate terminal');
 f.publish({docY:1800});assert.deepEqual(f.presenter.inspect().open,[2]);
 f.publish({docY:1800,dt:4});f.publish({docY:0,dt:1});
 assert.deepEqual(f.events.map(row=>[row.event.id,row.event.status]),[[1,'requested'],[1,'cancelled'],[2,'requested'],[2,'completed']]);
 assert.deepEqual(f.presenter.inspect().open,[]);f.presenter.dispose();
});

test('removed and replaced source drawings receive monotonically distinct presenter request identities',()=>{
 const f=fixture();f.publish();f.publish({dt:.14});const oldPaths=[...f.paths];
 f.paths.splice(0,f.paths.length,...Array.from({length:11},(_,index)=>({dataset:{libraryTrace:String(index)},styles:new Map()})));
 f.measure();f.publish();
 assert(oldPaths.every(path=>path.styles.size===0),'the replaced source is restored before its cancellation');
 f.root.nodes=[];f.measure();f.root.nodes=[f.element];f.measure();f.publish({reduced:true});
 assert.deepEqual(f.events.map(row=>[row.event.id,row.event.status]),[[1,'requested'],[1,'cancelled'],[2,'requested'],[2,'cancelled'],[3,'requested'],[3,'completed']]);
 assert.deepEqual(f.presenter.inspect().open,[]);f.presenter.dispose();assert.equal(f.events.length,6);
});

test('synchronous request observers can dispose or replace a drawing without double terminal facts or stale DOM ownership',()=>{
 for(const action of ['dispose','replace']){
  let f,replaced=false;
  f=fixture({onEmit:event=>{
   if(event.status!=='requested'||replaced)return;replaced=true;
   if(action==='dispose')f.presenter.dispose();
   else{
    f.paths.splice(0,f.paths.length,...Array.from({length:11},(_,index)=>({dataset:{libraryTrace:String(index)},styles:new Map()})));
    f.measure();
   }
  }});
  f.publish();
  assert.deepEqual(f.events.slice(0,2).map(row=>[row.event.id,row.event.status]),[[1,'requested'],[1,'cancelled']]);
  if(action==='replace'){
   assert.equal(f.events.at(-1).event.id,2);assert.equal(f.events.at(-1).event.status,'requested');
   f.publish({dt:4});assert.equal(f.events.at(-1).event.status,'completed');assert.equal(f.events.at(-1).event.id,2);
  }
  f.presenter.dispose();
  for(const id of new Set(f.events.map(row=>row.event.id)))assert.equal(f.events.filter(row=>row.event.id===id&&row.event.status!=='requested').length,1);
 }
});

test('a Reduced drawing painted complete can retain its single completion when a request observer disposes it',()=>{
 let f;
 f=fixture({onEmit:event=>{if(event.status==='requested')f.presenter.dispose();}});
 f.publish({reduced:true});
 assert.deepEqual(f.events.map(row=>[row.event.id,row.event.status]),[[1,'requested'],[1,'completed']]);
 assert(f.events.every(row=>row.paint.every(styles=>Object.keys(styles).length===0)));
 f.presenter.dispose();assert.equal(f.events.length,2);
});
