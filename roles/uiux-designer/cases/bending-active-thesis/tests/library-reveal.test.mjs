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

function fixture(){
 const operations=[],events=[];
 const paths=Array.from({length:11},(_,index)=>({dataset:{libraryTrace:String(10-index)},styles:new Map()}));
 const drawing={top:600,offsetHeight:400};
 const element={attrs:new Map(),querySelector:()=>drawing,querySelectorAll:()=>paths};
 const root={nodes:[element],querySelectorAll(){return this.nodes;}};
 const publisher={style(node,key,value){operations.push('paint:'+key);if(value==='')node.styles.delete(key);else node.styles.set(key,String(value));},attribute(node,key,value){if(value===null)node.attrs.delete(key);else node.attrs.set(key,String(value));}};
 const presenter=createLibraryDiagramPresenter({publisher,root,emit:event=>{operations.push('event:'+event.status);events.push({event,paint:paths.map(path=>Object.fromEntries(path.styles))});}});
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
