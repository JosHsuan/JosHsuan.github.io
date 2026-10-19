import test from 'node:test';
import assert from 'node:assert/strict';
import {DOMPresenter} from '../runtime/presentation/DOMPresenter.ts';
import {createProjectStudyBackdropPresenter} from '../runtime/site/ProjectStudyBackdropPresenter.mjs';
import {createProjectStudyBackdropMotion,advanceProjectStudyBackdropMotion,cancelProjectStudyBackdropMotion} from '../runtime/site/ProjectStudyBackdropMotion.mjs';

const chapters=['overview','context','system','making','results','credits'];
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const terminal=history=>{
 for(const id of new Set(history.map(item=>item.id))){const rows=history.filter(item=>item.id===id);assert.equal(rows.filter(item=>item.status==='requested').length,1);assert.equal(rows.filter(item=>['completed','cancelled','failed'].includes(item.status)).length,1);}
};
class Target{
 constructor(){this.listeners=new Map();this.attributes=new Map();this.dataset={};this.styles=new Map();this.textContent='';this.style={getPropertyValue:key=>this.styles.get(key)??'',setProperty:(key,value)=>this.styles.set(key,String(value))};}
 addEventListener(type,fn){const rows=this.listeners.get(type)??[];rows.push(fn);this.listeners.set(type,rows);}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(value=>value!==fn));}
 fire(type,event={}){for(const fn of [...this.listeners.get(type)??[]])fn(event);}
 getAttribute(key){return this.attributes.get(key)??null;}setAttribute(key,value){this.attributes.set(key,String(value));}removeAttribute(key){this.attributes.delete(key);}
 querySelector(){return null;}querySelectorAll(){return[];}
}
function fixture({video=false,reduced=false,saveData=false,rejectPlay=false,pendingImage=null,pendingDecode=null,sharedImage=false}={}){
 const root=new Target(),doc=new Target(),win=new Target(),timers=new Map(),callbacks=new Map(),controls=[];
 const pendingDecodes=new Map();
 let sequence=0,schedules=0,now=0,plays=0,pauses=0,loads=0,cancels=0;
 const policy={hidden:false,reduced,saveData,paused:false,siteReady:true},figures=[];
 const sources=['overview','context','system','making','results'];
 for(const chapter of sources){
  const figure=new Target(),image=new Target();figure.dataset.projectMedia=chapter;image.setAttribute('src',sharedImage&&chapter==='making'?'/context.webp':`/${chapter}.webp`);image.complete=chapter!==pendingImage;image.naturalWidth=image.complete?1600:0;image.decode=()=>chapter===pendingDecode?new Promise(resolve=>pendingDecodes.set(chapter,resolve)):Promise.resolve();figure.image=image;
  figure.querySelector=selector=>selector==='[data-project-media-poster]'||selector==='img'?image:selector==='[data-project-motion-media]'?figure.video??null:null;
  if(video&&chapter==='making'){
   const media=new Target();media.setAttribute('data-project-motion-id','authentic-making');media.setAttribute('data-project-video-src','/authentic-making.mp4');Object.assign(media,{paused:true,currentTime:0,videoWidth:640,videoHeight:480,readyState:2,preload:'none'});
   media.play=()=>{plays++;if(rejectPlay)return Promise.reject(Error('blocked'));media.paused=false;media.fire('playing');return Promise.resolve();};
   media.pause=()=>{pauses++;const changed=!media.paused;media.paused=true;if(changed)media.fire('pause');};media.load=()=>loads++;
   media.requestVideoFrameCallback=fn=>{callbacks.set(++sequence,fn);return sequence;};media.cancelVideoFrameCallback=id=>{cancels++;callbacks.delete(id);};figure.video=media;
   for(const attribute of ['data-project-motion-toggle','data-project-motion-replay','data-project-motion-status']){const control=new Target();control.setAttribute(attribute,'authentic-making');controls.push(control);}
  }
  figures.push(figure);
 }
 root.dataset.projectActiveChapter='overview';
 root.querySelectorAll=selector=>selector==='[data-project-chapter]'?chapters.map(chapter=>({dataset:{projectChapter:chapter}})):selector==='[data-project-media]'?figures:controls.filter(control=>control.getAttribute(selector.slice(1,-1))!==null);
 Object.assign(win,{innerWidth:1440,innerHeight:1000,performance:{now:()=>now},setTimeout:(fn,delay)=>{timers.set(++sequence,{fn,delay});return sequence;},clearTimeout:id=>timers.delete(id)});
 const presenter=createProjectStudyBackdropPresenter({root,window:win,document:doc,publisher:new DOMPresenter().forOwner('test-backdrop'),schedule:()=>schedules++,policy:()=>policy});
 const step=(dt=.016,resumed=false)=>{now+=dt*1000;return presenter.publish({dt,resumed});};
 const settle=()=>{let left=300;while(step()&&left-->0);assert(left>0);};
 const select=chapter=>{root.dataset.projectActiveChapter=chapter;return step();};
 const frame=()=>{const pending=[...callbacks.values()];callbacks.clear();for(const fn of pending)fn(now,{mediaTime:.04,presentedFrames:1});};
 return{root,win,doc,policy,figures,presenter,step,settle,select,frame,timers,callbacks,controls,pendingDecodes,advanceClock:seconds=>{now+=seconds*1000;},video:figures.find(figure=>figure.video)?.video,get schedules(){return schedules;},get plays(){return plays;},get pauses(){return pauses;},get loads(){return loads;},get cancels(){return cancels;}};
}

test('actual Bending passages are finite at 30/60/120 Hz and preserve retargeted poses',()=>{
 for(const hz of [30,60,120]){
  const state=createProjectStudyBackdropMotion(),advance=(dt,key,ready=true)=>advanceProjectStudyBackdropMotion(state,dt,{key,chapter:key,ready});
  advance(0,'first');let elapsed=0;while(state.transition){advance(1/hz,'first');elapsed+=1/hz;}assert(Math.abs(elapsed-1.1)<1/hz+1e-9);assert.equal(state.mode,'hold');
  advance(.2,'second',false);const pose={...state.pose};advance(0,'third',false);assert.deepEqual(state.pose,pose);advance(2,'third',false);assert.equal(state.key,'third');assert.equal(state.mode,'waiting');assert.equal(state.pose.opacity,0);
  advance(0,'third',true);advance(.4,'third',true);const entering={...state.pose};advance(0,'first',true);assert.deepEqual(state.pose,entering);advance(4,'first',true);assert.equal(state.mode,'hold');
  const sequence=state.sequence;advance(2,'first',true);assert.equal(state.sequence,sequence);cancelProjectStudyBackdropMotion(state,'page-exit');terminal(state.history);
 }
});

test('a long retained session evicts complete source transactions without orphaning terminal receipts',()=>{
 const state=createProjectStudyBackdropMotion();
 for(let index=0;index<80;index++)advanceProjectStudyBackdropMotion(state,0,{key:`source-${index}`,chapter:'context',ready:true,snap:true});
 advanceProjectStudyBackdropMotion(state,0,{key:'pending-source',chapter:'making',ready:false,snap:true});
 const pending=state.request.id;
 assert.equal(state.request.terminal,null);
 terminal(state.history.filter(item=>item.id!==pending));
 assert.equal(state.history.filter(item=>item.id===pending&&item.status==='requested').length,1);
 assert(state.history.length<=96);
 cancelProjectStudyBackdropMotion(state,'true-departure');terminal(state.history);
});

test('all documentary chapters exit before decode/entry, while retained Credits keeps the same subject',async()=>{
 const f=fixture({pendingImage:'context'});await flush();f.step();assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.figures[0].getAttribute('data-project-media-active'),'');
 f.select('context');assert.equal(f.presenter.inspect().stage.mode,'exit');assert.equal(f.figures[0].getAttribute('data-project-media-active'),'');assert.equal(f.figures[1].getAttribute('data-project-media-active'),null);
 f.step(1);assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(f.figures[0].getAttribute('data-project-media-active'),null);assert.equal(f.step(),false,'A decode wait does not poll the frame scheduler');
 const image=f.figures[1].image;image.complete=true;image.naturalWidth=1600;image.fire('load');await flush();f.step();assert.equal(f.presenter.inspect().stage.mode,'entry');f.settle();assert.equal(f.figures[1].getAttribute('data-project-media-active'),'');
 f.select('results');f.settle();const sequence=f.presenter.inspect().stage.sequence;f.select('credits');assert.equal(f.presenter.inspect().stage.sequence,sequence);assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.figures[4].getAttribute('data-project-media-active'),'');
 f.presenter.dispose();terminal(f.presenter.inspect().stage.history);assert([...f.figures.flatMap(figure=>[figure,figure.image])].every(node=>[...node.listeners.values()].every(rows=>rows.length===0)));
});

test('one shared transaction hands model paint/camera intent to the actor only after the prior source exits',async()=>{
 const f=fixture();await flush();const preparations=[],stages=[],host=new Target(),surface=new Target();let ready=false;
 host.querySelector=()=>surface;const actor={prepare(chapter){preparations.push(chapter);return ready;},publish({stage}){stages.push(stage);return false;},inspect:()=>({arrivalStatic:false}),suspend(){},resume(){}};
 f.presenter.setScene({actor,host,model:{chapters:['context','system']}});f.step();f.select('context');assert.deepEqual(preparations,[]);f.step(1);assert.deepEqual(preparations,['context']);assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(host.getAttribute('data-project-model-active'),null);
 ready=true;f.step();f.settle();assert.equal(host.getAttribute('data-project-model-active'),'');assert.equal(stages.at(-1).kind,'model');assert.equal(stages.at(-1).mode,'hold');assert.equal(f.figures.filter(figure=>figure.getAttribute('data-project-media-active')!==null).length,0);
 const before=preparations.length;f.select('system');assert.equal(preparations.length,before);f.step(1);assert.equal(preparations.at(-1),'system');f.settle();f.select('making');f.settle();assert.equal(host.getAttribute('data-project-model-active'),null);assert.equal(f.figures[3].getAttribute('data-project-media-active'),'');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('native source waits for real first frame; pause/BFCache retain time and finite end holds until explicit replay',async()=>{
 const f=fixture({video:true});await flush();f.step();assert.equal(f.video.getAttribute('src'),null);f.select('making');assert.equal(f.video.getAttribute('src'),null);f.step(1);assert.equal(f.video.getAttribute('src'),'/authentic-making.mp4');assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(f.callbacks.size,1);assert.equal(f.timers.size,1);
 f.frame();await flush();assert.equal(f.presenter.inspect().media.find(item=>item.id).frame.method,'video-frame');assert.equal(f.timers.size,0);f.step();f.settle();await flush();assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.figures[3].getAttribute('data-project-media-mode'),'video');assert.equal(f.video.paused,false);
 f.video.currentTime=1.25;f.policy.paused=true;f.step();assert.equal(f.video.paused,true);assert.equal(f.video.currentTime,1.25);f.policy.paused=false;f.step();await flush();assert.equal(f.video.paused,false);
 f.policy.hidden=true;f.presenter.suspend('page');assert.equal(f.callbacks.size,0);assert.equal(f.video.paused,true);assert.equal(f.video.getAttribute('src'),'/authentic-making.mp4');f.policy.hidden=false;f.presenter.resume();f.step(100,true);await flush();assert.equal(f.video.currentTime,1.25);assert.equal(f.presenter.inspect().stage.mode,'hold');
 f.video.currentTime=3;f.video.paused=true;f.video.fire('ended');const plays=f.plays;f.step();assert.equal(f.plays,plays);assert.equal(f.presenter.inspect().media.find(item=>item.id).ended,true);const replay=f.controls.find(control=>control.getAttribute('data-project-motion-replay'));assert.equal(replay.getAttribute('hidden'),null);replay.fire('click');await flush();assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);
 f.presenter.dispose();assert.equal(f.video.getAttribute('src'),null);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);assert([...f.video.listeners.values()].every(rows=>rows.length===0));terminal(f.presenter.inspect().stage.history);
});

test('reduced/Save Data never acquire animation, supersession cancels native firstframe work, and rejected play latches a poster',async()=>{
 for(const preference of ['reduced','saveData']){
  const f=fixture({video:true,[preference]:true});await flush();f.step();f.select('making');f.settle();assert.equal(f.video.getAttribute('src'),null);assert.equal(f.plays,0);assert.equal(f.presenter.inspect().stage.key,'poster:authentic-making');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
 }
 const superseded=fixture({video:true});await flush();superseded.step();superseded.select('making');superseded.step(1);assert.equal(superseded.callbacks.size,1);superseded.select('results');assert.equal(superseded.callbacks.size,0);assert.equal(superseded.timers.size,0);assert.equal(superseded.video.paused,true);superseded.settle();superseded.presenter.dispose();terminal(superseded.presenter.inspect().stage.history);
 const failed=fixture({video:true,rejectPlay:true});await flush();failed.step();failed.select('making');failed.step(1);await flush();failed.step();failed.settle();assert.equal(failed.figures[3].getAttribute('data-project-media-mode'),'poster');assert.equal(failed.presenter.inspect().media.find(item=>item.id).reason,'play-rejected');assert.equal(failed.presenter.inspect().stage.history.filter(item=>item.key==='video:authentic-making'&&item.status==='failed').length,1);const plays=failed.plays;failed.policy.hidden=true;failed.presenter.suspend('hidden');failed.policy.hidden=false;failed.presenter.resume();failed.step(10,true);assert.equal(failed.plays,plays);failed.presenter.dispose();terminal(failed.presenter.inspect().stage.history);
});

test('media arrival deadline and late decode/callback cannot resurrect a disposed or failed subject',async()=>{
 const f=fixture({video:true,pendingImage:'context'});await flush();f.step();f.select('making');f.step(1);const stale=[...f.callbacks.values()][0];for(const [id,timer]of [...f.timers]){f.timers.delete(id);timer.fn();}f.step();f.settle();assert.equal(f.presenter.inspect().media.find(item=>item.id).reason,'media-timeout');assert.equal(f.video.getAttribute('src'),null);stale(100,{mediaTime:.04,presentedFrames:1});assert.equal(f.presenter.inspect().media.find(item=>item.id).firstFrame,false);f.presenter.dispose();const writes=[...f.figures[1].attributes];f.figures[1].image.naturalWidth=1600;f.figures[1].image.fire('load');await flush();assert.deepEqual([...f.figures[1].attributes],writes);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);terminal(f.presenter.inspect().stage.history);
});

test('a real decoded frame received while suspended remains prepared without hidden-time replay or another acquisition',async()=>{
 const f=fixture({video:true});await flush();f.step();f.select('making');f.step(1);assert.equal(f.callbacks.size,1);const loads=f.loads;
 f.policy.hidden=true;f.presenter.suspend('visibility');f.video.fire('loadeddata');assert.equal(f.presenter.inspect().media.find(item=>item.id).firstFrame,false);assert.equal(f.callbacks.size,0);
 f.policy.hidden=false;f.presenter.resume();f.step(100,true);await flush();assert.equal(f.presenter.inspect().media.find(item=>item.id).frame.method,'loadeddata');assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.loads,loads);assert.equal(f.callbacks.size,1);f.frame();assert.equal(f.presenter.inspect().media.find(item=>item.id).compositorFrame.method,'video-frame');assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('only requested image readiness gets a deadline; a missing load closes as failed and cannot upgrade after a late load',async()=>{
 const f=fixture({pendingImage:'context'});await flush();assert.equal(f.timers.size,0,'Off-chapter lazy images have no arrival timer');f.step();f.select('context');assert.equal(f.timers.size,0,'The old source exits before target readiness begins');f.step(1);assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].delay,15000);assert.equal(f.step(),false,'Image readiness does not poll the frame scheduler');
 for(const [id,timer]of [...f.timers]){f.timers.delete(id);timer.fn();}f.step();f.settle();const failed=f.presenter.inspect();assert.equal(failed.stage.request.terminal,'failed');assert.equal(failed.stage.request.failure,'image-timeout');assert.equal(failed.stage.mode,'hold');assert.equal(f.figures[1].getAttribute('data-project-image-state'),'failed');assert.equal(failed.media[1].posterReady,false);
 f.figures[1].image.complete=true;f.figures[1].image.naturalWidth=1600;f.figures[1].image.fire('load');await flush();f.step();assert.equal(f.presenter.inspect().media[1].posterReady,false);assert.equal(f.presenter.inspect().stage.history.filter(row=>row.status==='failed'&&row.key==='image:/context.webp').length,1);assert.equal(f.timers.size,0);f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('a decode promise that never resolves has the same bounded failure and its late resolution is ignored',async()=>{
 const f=fixture({pendingDecode:'context'});await flush();assert(f.pendingDecodes.has('context'));assert.equal(f.timers.size,0);f.step();f.select('context');f.step(1);assert.equal(f.presenter.inspect().stage.mode,'waiting');
 for(const [id,timer]of [...f.timers]){f.timers.delete(id);timer.fn();}f.step();f.settle();f.pendingDecodes.get('context')();await flush();f.step();assert.equal(f.presenter.inspect().stage.request.terminal,'failed');assert.equal(f.presenter.inspect().media[1].posterReady,false);assert.equal(f.figures[1].getAttribute('data-project-image-state'),'failed');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('image readiness retains remaining active budget across BFCache and supersession, and true exit cancels it',async()=>{
 const f=fixture({pendingImage:'context'});await flush();f.step();f.select('context');f.step(1);f.step(4);f.policy.hidden=true;f.presenter.suspend('page');assert.equal(f.timers.size,0);f.advanceClock(100);f.policy.hidden=false;f.presenter.resume();f.step(0,true);assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].delay,11000,'Hidden time does not consume the remaining arrival budget');
 f.step(2);f.select('results');assert.equal(f.timers.size,0,'Superseding the requested image closes its timer');f.settle();f.select('context');f.step(1);assert.equal([...f.timers.values()][0].delay,8984,'Returning uses the remaining source budget, including its last active frame');f.presenter.dispose();assert.equal(f.timers.size,0);terminal(f.presenter.inspect().stage.history);
});

test('repeated source chapters use the same record for decode and rendering, without duplicate source transitions',async()=>{
 const f=fixture({pendingImage:'context',sharedImage:true});await flush();f.step();f.select('context');f.step(1);const sequence=f.presenter.inspect().stage.sequence;f.select('making');assert.equal(f.root.dataset.projectActiveChapter,'making','Native reading advances immediately');assert.equal(f.presenter.inspect().stage.sequence,sequence);assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(f.figures[1].getAttribute('data-project-media-active'),null);assert.equal(f.presenter.inspect().media[3].posterReady,true,'The other DOM image has decoded, but cannot acknowledge the canonical image');
 f.figures[1].image.complete=true;f.figures[1].image.naturalWidth=1600;f.figures[1].image.fire('load');await flush();f.step();f.settle();assert.equal(f.figures[1].getAttribute('data-project-media-active'),'');assert.equal(f.figures[3].getAttribute('data-project-media-active'),null);f.select('context');assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.presenter.inspect().stage.sequence,sequence);f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('policy-selected posters have bounded readiness without video acquisition; a failed recording and failed poster close independently',async()=>{
 for(const preference of ['reduced','saveData']){
  const f=fixture({video:true,pendingImage:'making',[preference]:true});await flush();f.step();f.select('making');assert.equal(f.video.getAttribute('src'),null);assert.equal(f.plays,0);assert.equal(f.timers.size,1);for(const [id,timer]of [...f.timers]){f.timers.delete(id);timer.fn();}f.step();assert.equal(f.presenter.inspect().stage.request.terminal,'failed');assert.equal(f.presenter.inspect().stage.request.failure,'image-timeout');assert.equal(f.presenter.inspect().media.find(row=>row.id).posterReason,'image-timeout');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
 }
 const f=fixture({video:true,rejectPlay:true,pendingImage:'making'});await flush();f.step();f.select('making');f.step(1);await flush();f.step();assert.equal(f.video.getAttribute('src'),null);assert.equal(f.presenter.inspect().stage.key,'poster:authentic-making');assert.equal(f.timers.size,1);f.figures[3].image.fire('error');f.step();f.settle();const state=f.presenter.inspect();assert.equal(state.stage.request.terminal,'failed');assert.equal(state.stage.request.failure,'image-unavailable');assert.equal(state.stage.history.filter(row=>row.status==='failed'&&row.key==='video:authentic-making').length,1);assert.equal(state.stage.history.filter(row=>row.status==='failed'&&row.key==='poster:authentic-making').length,1);f.figures[3].image.complete=true;f.figures[3].image.naturalWidth=1600;f.figures[3].image.fire('load');await flush();assert.equal(f.presenter.inspect().media.find(row=>row.id).posterReady,false);assert.equal(f.timers.size,0);f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});
