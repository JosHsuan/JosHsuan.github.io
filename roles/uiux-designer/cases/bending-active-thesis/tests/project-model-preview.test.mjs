import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import * as lifecycle from '../runtime/site/PreviewLifecycle.mjs';
import * as readiness from '../runtime/site/PagePreviewReadiness.mjs';

const flush=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
const source=readFileSync(new URL('../components/ProjectModelPreview.jsx',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;

// Execute the actual component effect with the real eligibility, readiness and
// async lifecycle owners. Only React mounting and the GPU acquisition are ports.
function mount({hidden=false}={}){
 const doc=new EventTarget(),win=new EventTarget(),node={getBoundingClientRect:()=>({width:320,height:320})},requests=[],states=[],disposed=[],draws=[];
 doc.hidden=hidden;doc.documentElement={getAttribute:()=> 'requested'};doc.querySelectorAll=()=>[node];
 let effect,cleanup;const exports={};
 const require=name=>{
  if(name==='react')return{useEffect:fn=>{effect=fn;},useRef:()=>({current:node}),useState:()=>[{phase:'poster',reason:'initial'},state=>states.push(state)]};
  if(name==='react/jsx-runtime')return{jsx:()=>null,jsxs:()=>null};
  if(name.endsWith('/PreviewLifecycle.mjs'))return lifecycle;
  if(name.endsWith('/PagePreviewReadiness.mjs'))return readiness;
  if(name==='./project-model-scene.mjs')return{acquireProjectModelScene:options=>{
   let resolve,painted=false;const id=requests.length+1,promise=new Promise(done=>{resolve=done;});
   const handle={resize(){draws.push(id);painted=true;},inspect:()=>({firstDraw:{completed:painted},sourceRevision:'source-'+id}),dispose(){disposed.push(id);}};
   requests.push({id,...options,resolve:()=>resolve(handle)});return promise;
  }};
  throw Error('Unexpected component dependency '+name);
 };
 new Function('require','exports','window','document',compiled)(require,exports,win,doc);
 exports.default({poster:{src:'/source.webp',width:320,height:320}});cleanup=effect();
 return{doc,win,node,requests,states,disposed,draws,cleanup,visibility(value){doc.hidden=value;doc.dispatchEvent(new Event('visibilitychange'));}};
}

test('a model card opened hidden prepares on return and a cancelled pending generation cannot replace or fail its painted successor',async t=>{
 const f=mount({hidden:true});t.after(f.cleanup);const entry=readiness.acquirePagePreviewReadiness(f.doc);await flush();
 assert.equal(f.requests.length,0);assert.equal(entry.inspect().previews[0].mode,'pending');
 f.visibility(false);await flush();assert.equal(f.requests.length,1);assert.equal(f.node.__projectModelPreview.inspect().phase,'requested');
 f.visibility(true);assert.equal(f.requests[0].signal.aborted,true);assert.equal(entry.inspect().previews[0].mode,'pending');
 f.visibility(false);await flush();assert.equal(f.requests.length,2);
 const before=f.states.length;f.requests[0].onFailure('late-hidden-generation');f.requests[0].resolve();await flush();
 assert.equal(f.states.length,before);assert.deepEqual(f.disposed,[1]);assert.deepEqual(f.draws,[]);assert.equal(f.node.__projectModelPreview.inspect().phase,'requested');
 f.requests[1].resolve();await flush();const view=f.node.__projectModelPreview.inspect();
 assert.equal(view.phase,'ready');assert.equal(view.resource.sourceRevision,'source-2');assert.equal(view.resource.firstDraw.completed,true);assert.deepEqual(f.draws,[2]);assert.equal((await entry.promise).previews[0].mode,'model');
 f.visibility(true);f.visibility(false);await flush();assert.equal(f.requests.length,2);assert.deepEqual(f.disposed,[1]);assert.deepEqual(f.draws,[2,2]);
});

test('a genuine card acquisition failure remains terminal after visibility changes',async t=>{
 const f=mount();t.after(f.cleanup);const entry=readiness.acquirePagePreviewReadiness(f.doc);await flush();
 f.requests[0].onFailure('source-unavailable');assert.equal(f.requests[0].signal.aborted,true);assert.equal((await entry.promise).previews[0].mode,'static');
 f.visibility(true);f.visibility(false);await flush();assert.equal(f.requests.length,1);assert.equal(f.node.__projectModelPreview.inspect().phase,'failed');
 f.requests[0].resolve();await flush();assert.deepEqual(f.disposed,[1]);assert.deepEqual(f.draws,[]);
});
