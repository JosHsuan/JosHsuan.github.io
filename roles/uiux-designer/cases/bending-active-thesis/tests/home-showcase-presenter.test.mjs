import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomeShowcasePresenter} from '../runtime/site/HomeShowcasePresenter.mjs';
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
function setup(acquire){
 const surface={style:{}},host={attrs:{},ownerDocument:{defaultView:{innerWidth:1440}},querySelector:()=>surface};
 const calls=[],models=['unit','machine','structure'].map(id=>({id:id==='structure'?'project-caschlatsch':'mode-s-of-making',model:{id,chapters:['context'],bounds:{min:[-1,0,-1],max:[1,2,1]}}}));
 const publisher={attribute:(n,k,v)=>{n.attrs[k]=v;},style:(n,k,v)=>{n.style[k]=v;}};
 const presenter=createHomeShowcasePresenter({root:{offsetHeight:1000},host,models,publisher,schedule:()=>{},acquire:async options=>{
  calls.push(options);const resource=await acquire(options),inspect=resource.inspect;
  resource.inspect=()=>({successfulPaint:true,...inspect()});return resource;
 }});
 presenter.measure({viewportHeight:1000});
 return{presenter,calls,host,at:(dt,policy={})=>presenter.publish({dt,docY:0,ready:true,suspended:false,...policy})};
}
test('a complete showcase loop uses authored elapsed time, varied lenses and at most one live renderer',async()=>{
 let live=0,maximum=0;const draws=[],disposed=[];
 const f=setup(async({model})=>{live++;maximum=Math.max(maximum,live);return{resize(){},present:shot=>draws.push({id:model.id,...shot}),inspect:()=>({id:model.id}),dispose(){live--;disposed.push(model.id);}};});
 f.at(0);await flush();
 for(let i=0;i<3;i++){assert.equal(f.presenter.inspect().index,i);const duration=f.presenter.inspect().duration;f.at(3);f.at(3);f.at(duration-6);await flush();}
 assert.equal(f.presenter.inspect().index,0);assert.equal(maximum,1);assert.equal(live,1);
 assert.deepEqual(disposed,['unit','machine','structure']);assert(new Set(draws.map(row=>row.showcaseShot.focalLengthMm)).size>1);
 assert(draws.every(row=>Number.isFinite(row.activeSeconds)&&row.showcaseShot.fovDeg>5&&row.showcaseShot.fovDeg<120));
 f.presenter.dispose();assert.equal(live,0);
});
test('draw sampling stays bounded while hidden and offscreen time never advances the shot',async()=>{
 let draws=0;const f=setup(async()=>({resize(){},present(){draws++;},inspect:()=>({}),dispose(){}}));f.at(0);await flush();
 for(let i=0;i<120;i++)f.at(1/120);assert(draws<=26&&draws>=18);
 const before=f.presenter.inspect().time;f.at(3600,{suspended:true});f.at(3600,{docY:1500});assert.equal(f.presenter.inspect().time,before);
 f.at(.1);assert.equal(f.presenter.inspect().time,before+.1);f.presenter.dispose();
});
test('stalled sources expire on the existing active clock, skip once and dispose late arrivals',async()=>{
 const pending=[],disposed=[];const f=setup(({model})=>new Promise(resolve=>pending.push(()=>resolve({resize(){},present(){},inspect:()=>({}),dispose:()=>disposed.push(model.id)}))));
 f.at(0);f.at(16);assert(f.calls[0].signal.aborted);assert.equal(f.presenter.inspect().index,1);
 pending[0]();await flush();assert.deepEqual(disposed,['unit']);assert.equal(f.presenter.inspect().canvasCount,0);
 f.at(16);f.at(16);assert.equal(f.presenter.inspect().phase,'failed');assert.equal(f.calls.length,3);assert.equal(f.at(16),false);
 f.presenter.dispose();for(const resolve of pending.slice(1))resolve();await flush();assert.equal(disposed.length,3);
});
for(const method of ['present','resize'])test(`optional showcase ${method} failure cannot escape into the shared deck/glass scheduler`,async()=>{
 const disposed=[];let armed=false;
 const f=setup(async({model})=>({resize(){if(armed&&method==='resize'&&model.id==='unit')throw Error('native-context-lost');},present(){if(armed&&method==='present'&&model.id==='unit')throw Error('native-context-lost');},inspect:()=>({id:model.id}),dispose:()=>disposed.push(model.id)}));
 f.at(0);await flush();armed=true;
 assert.doesNotThrow(()=>method==='present'?f.at(.1):f.presenter.measure({viewportHeight:800}));
 assert.equal(f.presenter.inspect().phase,'failed');assert.equal(f.presenter.inspect().canvasCount,0);assert.deepEqual(disposed,['unit']);
 f.at(.1);await flush();f.at(.1);assert.equal(f.presenter.inspect().resource.id,'machine');assert.equal(f.presenter.inspect().phase,'ready');
 f.presenter.dispose();assert.deepEqual(disposed,['unit','machine']);
});
