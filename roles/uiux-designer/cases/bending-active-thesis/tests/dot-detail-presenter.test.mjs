import test from 'node:test';
import assert from 'node:assert/strict';
import {DOMPresenter} from '../runtime/presentation/DOMPresenter.ts';
import {createProjectStudyScenePresenter} from '../runtime/site/ProjectStudyScenePresenter.mjs';
import {DOT_SOURCE_REVISION} from '../components/dot-detail-score.mjs';
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
class Node{
 constructor(){this.listeners=new Map();this.attributes=new Map();this.dataset={};this.values=new Map();this.style={getPropertyValue:k=>this.values.get(k)??'',setProperty:(k,v)=>this.values.set(k,String(v))};}
 addEventListener(k,fn){const set=this.listeners.get(k)??new Set();set.add(fn);this.listeners.set(k,set);}removeEventListener(k,fn){this.listeners.get(k)?.delete(fn);}
 getAttribute(k){return this.attributes.get(k)??null;}setAttribute(k,v){this.attributes.set(k,String(v));}removeAttribute(k){this.attributes.delete(k);}
 querySelector(){return null;}querySelectorAll(){return[];}closest(){return null;}
}
function fixture({reduced=false,dot=true}={}){
 const doc=new Node(),win=new Node(),root=new Node(),host=new Node(),annotation=new Node(),surface=new Node(),target=new Node(),reset=new Node();
 annotation.setAttribute('hidden','');doc.documentElement=new Node();doc.activeElement=null;doc.querySelectorAll=()=>[host];
 const chapters=['overview','context','system','making','results','credits'];root.dataset={projectStudy:dot?'dot-based-3d-printing':'other',projectActiveChapter:'system'};
 target.dataset.projectModelTarget='system';reset.dataset.projectModelReset='system';
 root.querySelectorAll=s=>s==='[data-project-chapter]'?chapters.map(id=>({dataset:{projectChapter:id}})):s==='[data-project-model-target]'?[target]:s==='[data-project-model-reset]'?[reset]:[];
 host.querySelector=s=>s==='[data-project-model-surface]'?surface:s==='[data-dot-detail-annotation]'?annotation:null;
 const timers=new Map();let timerId=0,starts=0,disposals=0;Object.assign(win,{innerWidth:1440,innerHeight:1000,performance:{now:()=>0},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id)});
 const policy={hidden:false,reduced,saveData:false,paused:false,siteReady:false},presentations=[];
 const model={sha256:dot?DOT_SOURCE_REVISION:'other',chapters:['system'],cameraPath:[{chapter:'system',progress:0,yawRad:.5,pitchRad:.16,fovDeg:36,zoom:1.04},{chapter:'system',progress:.5,yawRad:.76,pitchRad:.22,fovDeg:36,zoom:1.04},{chapter:'system',progress:1,yawRad:1.02,pitchRad:.28,fovDeg:36,zoom:1.04}]};
 const handle={present(value){presentations.push(structuredClone(value));},resize(){},inspect:()=>({firstDraw:{completed:true},successfulPaint:true,detail:{weight:presentations.at(-1)?.cameraIntent?.detailWeight??0},view:presentations.at(-1)}),hitTest:()=>true,dispose(){disposals++;}};
 const actor=createProjectStudyScenePresenter({root,host,model,externalStage:true,window:win,document:doc,publisher:new DOMPresenter().forOwner('detail-test'),schedule:()=>{},policy:()=>policy,acquire:async()=>{starts++;return handle;}});
 const stage={kind:'model',chapter:'system',mode:'hold',settled:true,pose:{x:0,y:0,opacity:1},history:[]};
 return{actor,policy,annotation,doc,target,reset,presentations,host,read:(p,extra={})=>actor.setReading({chapter:'system',progress:p,detailProgress:p,detailEnabled:true,detailActive:p>=0&&p<1,...extra},0),step:(dt=.05)=>actor.publish({dt,stage}),get starts(){return starts;},get disposals(){return disposals;}};
}
test('Dot first acquisition is complete; detail hold freezes camera intent and caption follows actual paint',async()=>{
 const f=fixture();f.read(.5);await flush();assert.equal(f.presentations[0].cameraIntent.detailWeight,0);assert.equal(f.presentations[0].cameraIntent.yawRad,.5);
 f.policy.siteReady=true;f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,1);assert.equal(f.annotation.getAttribute('hidden'),null);assert.equal(f.annotation.getAttribute('data-dot-detail-beat'),'detail');
 const pose=f.presentations.at(-1).cameraIntent;f.read(.6);f.step();assert.deepEqual(f.presentations.at(-1).cameraIntent,pose);
 f.policy.paused=true;f.read(.95);f.step();assert.deepEqual(f.presentations.at(-1).cameraIntent,pose);assert.equal(f.annotation.getAttribute('data-dot-detail-beat'),'detail');
 f.policy.paused=false;f.step();for(let i=0;i<10;i++){f.step();const w=f.presentations.at(-1).cameraIntent.detailWeight;assert(w>=0&&w<=1);}
 assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,0);assert.equal(f.annotation.getAttribute('data-dot-detail-beat'),'handoff');f.actor.dispose();assert.equal(f.disposals,1);assert.equal(f.annotation.getAttribute('hidden'),'');
});
test('inspection moves smoothly to complete source and returns to native detail; hidden freezes recovery',async()=>{
 const f=fixture();await flush();f.policy.siteReady=true;f.read(.5);f.step();f.doc.activeElement=f.target;f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,1);for(let i=0;i<8;i++)f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,0);
 f.doc.activeElement=null;f.step();f.step();const w=f.presentations.at(-1).cameraIntent.detailWeight;assert(w>0&&w<1);f.policy.hidden=true;for(let i=0;i<8;i++)f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,w);assert.equal(f.annotation.getAttribute('hidden'),'');
 f.policy.hidden=false;for(let i=0;i<10;i++)f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,1);assert.equal(f.starts,1);f.actor.dispose();
});
test('Reduced stays static without acquisition; other models receive no detail intent',async()=>{
 const f=fixture({reduced:true});await flush();f.policy.siteReady=true;f.read(.5);f.step();assert.equal(f.starts,0);assert.equal(f.annotation.getAttribute('hidden'),'');f.actor.dispose();
 const other=fixture({dot:false});await flush();other.policy.siteReady=true;other.read(.5);other.step();assert(!Object.hasOwn(other.presentations.at(-1).cameraIntent,'detailWeight'));other.actor.dispose();
});


test('disabled or departed detail windows stay full and unannotated, while Pause preserves its intentional painted freeze',async()=>{
 const f=fixture();await flush();f.policy.siteReady=true;f.read(.5);f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,1);
 f.read(.5,{detailEnabled:false,detailActive:false});f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,0);assert.equal(f.annotation.getAttribute('hidden'),'');
 f.read(.5);f.step();f.policy.paused=true;f.read(.95,{detailProgress:1,detailActive:false});f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,1);assert.equal(f.annotation.getAttribute('hidden'),'');
 f.policy.paused=false;for(let i=0;i<10;i++)f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,0);assert.equal(f.annotation.getAttribute('hidden'),'');
 f.read(.5);f.step();f.doc.activeElement=f.target;f.step();f.step();f.read(.5,{detailEnabled:false,detailActive:false});for(let i=0;i<10;i++)f.step();assert.equal(f.presentations.at(-1).cameraIntent.detailWeight,0);assert.equal(f.annotation.getAttribute('hidden'),'');f.actor.dispose();
});
