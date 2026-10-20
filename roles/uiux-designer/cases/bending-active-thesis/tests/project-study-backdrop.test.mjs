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
function fixture({video=false,reduced=false,saveData=false,rejectPlay=false,pendingImage=null,pendingDecode=null,sharedImage=false,deferPause=false}={}){
 const root=new Target(),doc=new Target(),win=new Target(),timers=new Map(),callbacks=new Map(),controls=[];
 const pendingDecodes=new Map(),nativeEvents=[],pendingPlays=[];
 let sequence=0,schedules=0,now=0,plays=0,pauses=0,loads=0,cancels=0,deferNextPlay=false;
 const policy={hidden:false,reduced,saveData,paused:false,siteReady:true},figures=[];
 const sources=['overview','context','system','making','results'];
 for(const chapter of sources){
  const figure=new Target(),image=new Target();figure.dataset.projectMedia=chapter;image.setAttribute('src',sharedImage&&chapter==='making'?'/context.webp':`/${chapter}.webp`);image.complete=chapter!==pendingImage;image.naturalWidth=image.complete?1600:0;image.decode=()=>chapter===pendingDecode?new Promise(resolve=>pendingDecodes.set(chapter,resolve)):Promise.resolve();figure.image=image;
  figure.querySelector=selector=>selector==='[data-project-media-poster]'||selector==='img'?image:selector==='[data-project-motion-media]'?figure.video??null:null;
  if(video&&chapter==='making'){
   const media=new Target();media.setAttribute('data-project-motion-id','authentic-making');media.setAttribute('data-project-video-src','/authentic-making.mp4');Object.assign(media,{paused:true,seeking:false,ended:false,currentTime:0,videoWidth:640,videoHeight:480,readyState:2,preload:'none'});
   media.play=()=>{plays++;if(rejectPlay)return Promise.reject(Error('blocked'));media.paused=false;if(deferNextPlay){deferNextPlay=false;return new Promise((resolve,reject)=>pendingPlays.push({resolve,reject}));}media.readyState=4;media.fire('playing');return Promise.resolve();};
   media.pause=()=>{pauses++;const changed=!media.paused;media.paused=true;if(changed){if(deferPause)nativeEvents.push(()=>media.fire('pause'));else media.fire('pause');}};media.load=()=>loads++;
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
 return{root,win,doc,policy,figures,presenter,step,settle,select,frame,timers,callbacks,controls,pendingDecodes,pendingPlays,deferPlay:()=>{deferNextPlay=true;},flushNative:()=>{for(const deliver of nativeEvents.splice(0))deliver();},advanceClock:seconds=>{now+=seconds*1000;},video:figures.find(figure=>figure.video)?.video,get schedules(){return schedules;},get plays(){return plays;},get pauses(){return pauses;},get loads(){return loads;},get cancels(){return cancels;}};
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
 f.presenter.setScene({actor,host,model:{sha256:'verified-model-revision',chapters:['context','system']}});f.step();f.select('context');assert.deepEqual(preparations,[]);f.step(1);assert.deepEqual(preparations,['context']);assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(host.getAttribute('data-project-model-active'),null);
 ready=true;f.step();f.settle();assert.equal(host.getAttribute('data-project-model-active'),'');assert.equal(stages.at(-1).kind,'model');assert.equal(stages.at(-1).mode,'hold');assert.equal(f.figures.filter(figure=>figure.getAttribute('data-project-media-active')!==null).length,0);
 const sequence=f.presenter.inspect().stage.sequence;
 for(const chapter of ['system','context','system']){
  f.select(chapter);assert.equal(preparations.at(-1),chapter);const stage=f.presenter.inspect().stage;
  assert.equal(stage.key,'model:verified-model-revision');assert.equal(stage.sequence,sequence);assert.equal(stage.chapter,chapter);
  assert.equal(stage.mode,'hold');assert.equal(stage.transition,null);assert.deepEqual(stage.pose,{x:0,y:0,opacity:1});
 }
 ready=false;f.select('context');assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.deepEqual(f.presenter.inspect().stage.pose,{x:0,y:0,opacity:1});
 ready=true;f.step();f.settle();f.select('making');f.settle();assert.equal(host.getAttribute('data-project-model-active'),null);assert.equal(f.figures[3].getAttribute('data-project-media-active'),'');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('native source waits for real first frame; pause/BFCache retain time and finite end holds until explicit replay',async()=>{
 const f=fixture({video:true});await flush();f.step();assert.equal(f.video.getAttribute('src'),null);f.select('making');assert.equal(f.video.getAttribute('src'),null);f.step(1);assert.equal(f.video.getAttribute('src'),'/authentic-making.mp4');assert.equal(f.presenter.inspect().stage.mode,'waiting');assert.equal(f.callbacks.size,1);assert.equal(f.timers.size,1);
 f.frame();await flush();assert.equal(f.presenter.inspect().media.find(item=>item.id).frame.method,'video-frame');assert.equal(f.timers.size,0);f.step();f.settle();await flush();assert.equal(f.presenter.inspect().stage.mode,'hold');assert.equal(f.figures[3].getAttribute('data-project-media-mode'),'video');assert.equal(f.video.paused,false);
 f.video.currentTime=1.25;f.policy.paused=true;f.step();assert.equal(f.video.paused,true);assert.equal(f.video.currentTime,1.25);f.policy.paused=false;f.step();await flush();assert.equal(f.video.paused,false);
 f.policy.hidden=true;f.presenter.suspend('page');assert.equal(f.callbacks.size,0);assert.equal(f.video.paused,true);assert.equal(f.video.getAttribute('src'),'/authentic-making.mp4');f.policy.hidden=false;f.presenter.resume();f.step(100,true);await flush();assert.equal(f.video.currentTime,1.25);assert.equal(f.presenter.inspect().stage.mode,'hold');
 f.video.currentTime=3;f.video.paused=true;f.video.fire('ended');const plays=f.plays;f.step();assert.equal(f.plays,plays);assert.equal(f.presenter.inspect().media.find(item=>item.id).ended,true);const replay=f.controls.find(control=>control.getAttribute('data-project-motion-replay'));assert.equal(replay.getAttribute('hidden'),null);replay.fire('click');await flush();assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);
 f.presenter.dispose();assert.equal(f.video.getAttribute('src'),null);assert.equal(f.callbacks.size,0);assert.equal(f.timers.size,0);assert([...f.video.listeners.values()].every(rows=>rows.length===0));terminal(f.presenter.inspect().stage.history);
});

test('a queued native pause from departure cannot overwrite resumed playback on the retained source',async()=>{
 const f=fixture({video:true,deferPause:true});await flush();f.step();f.select('making');f.step(1);f.frame();await flush();f.flushNative();f.step();f.settle();await flush();
 assert.equal(f.video.paused,false);assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,true);
 f.video.currentTime=1.25;const loads=f.loads;
 f.select('results');f.settle();assert.equal(f.video.paused,true);
 f.select('making');f.settle();await flush();assert.equal(f.video.paused,false);
 // HTML media events are queued tasks. Deliver the departure's pause after
 // the same native element has genuinely resumed, as observed in WebKit CI.
 f.flushNative();const resumed=f.presenter.inspect().media.find(item=>item.id);
 assert.equal(resumed.playing,true);assert.equal(resumed.phase,'playing');assert.equal(resumed.failed,false);assert.equal(resumed.currentTime,1.25);assert.equal(f.loads,loads);
 assert.equal(f.controls.find(control=>control.getAttribute('data-project-motion-toggle')).textContent,'Pause recording');
 f.policy.paused=true;f.step();f.flushNative();assert.equal(f.video.paused,true);assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false);
 f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

async function pendingRevisit(){
 const f=fixture({video:true});await flush();f.step();f.select('making');f.step(1);f.frame();await flush();f.step();f.settle();await flush();f.video.currentTime=1.000437469;f.select('results');f.settle();f.deferPlay();f.select('making');f.settle();await flush();assert.equal(f.pendingPlays.length,1);assert.equal(f.video.paused,false);return f;
}
async function lateNativeRevisit(){
 const f=await pendingRevisit();f.policy.paused=true;f.step();assert.equal(f.video.paused,true);
 const paused=f.presenter.inspect().media.find(item=>item.id);assert.equal(paused.transport.progressGeneration,0);
 // A browser can finish an older native start after the current policy pause.
 // The real element is already unpaused when the held presenter runs again,
 // so play() correctly does not issue another operation to bind an epoch.
 f.policy.paused=false;f.video.paused=false;f.video.readyState=2;const plays=f.plays;f.step();assert.equal(f.plays,plays);
 f.video.fire('waiting');const waiting=f.presenter.inspect().media.find(item=>item.id);
 assert.equal(waiting.active,true);assert.equal(waiting.firstFrame,true);assert.equal(waiting.playing,false);assert.equal(waiting.phase,'buffering');assert.equal(waiting.transport.progressGeneration,0);assert(waiting.transport.playGeneration>0);assert.equal(waiting.progressReceipt,null);
 return f;
}
test('a pending resumed play is acknowledged only by real native progress, and late fulfillment cannot override newer waiting or pause',async()=>{
 const f=await pendingRevisit();f.video.currentTime=1.202663955;f.video.fire('waiting');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false);
 f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'An unchanged waiting sample is not progress');
 f.video.currentTime=2.881604636;f.video.fire('timeupdate');const progressing=f.presenter.inspect().media.find(item=>item.id);assert.equal(progressing.playing,true);assert.equal(progressing.phase,'playing');assert.equal(progressing.playPending,true);assert.equal(progressing.progressReceipt.type,'timeupdate');assert.equal(progressing.progressReceipt.fromTime,1.202663955);assert.equal(progressing.progressReceipt.currentTime,2.881604636);
 f.video.currentTime=2.9;f.video.fire('waiting');const waiting=f.presenter.inspect().media.find(item=>item.id);assert.equal(waiting.playing,false);assert.equal(waiting.phase,'buffering');f.pendingPlays[0].resolve();await flush();assert.equal(f.presenter.inspect().media.find(item=>item.id).phase,'buffering');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false);
 const toggle=f.controls.find(control=>control.getAttribute('data-project-motion-toggle'));assert.equal(toggle.textContent,'Pause recording');const plays=f.plays;toggle.fire('click');assert.equal(f.video.paused,true);assert.equal(f.plays,plays);assert.equal(f.presenter.inspect().media.find(item=>item.id).userPaused,true);f.video.fire('playing');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'A queued playing event cannot override native paused');f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
});

test('real forward native progress rebinds an invalidated play epoch without issuing another play or trusting its old Promise',async()=>{
 const f=await lateNativeRevisit();
 try{
  const initial=f.presenter.inspect().media.find(item=>item.id),plays=f.plays,callbacks=f.callbacks.size;
  f.video.fire('playing');f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'Neither playing nor an unchanged sample repairs an invalidated epoch');
  f.video.currentTime=1.202663955;f.video.fire('timeupdate');const progressing=f.presenter.inspect().media.find(item=>item.id);
  assert.equal(progressing.playing,true);assert.equal(progressing.phase,'playing');assert.equal(progressing.transport.progressGeneration,initial.transport.playGeneration);
  assert.deepEqual(progressing.progressReceipt,{type:'timeupdate',sequence:progressing.transport.lastFact.sequence,at:progressing.transport.lastFact.at,fromTime:initial.transport.baseline,currentTime:1.202663955,playGeneration:initial.transport.playGeneration});
  assert.equal(f.plays,plays);assert.equal(f.callbacks.size,callbacks);assert.equal(f.timers.size,0,'Native transport recovery introduces no polling/deadline work');
  f.video.fire('waiting');const waiting=f.presenter.inspect().media.find(item=>item.id);f.pendingPlays[0].resolve();await flush();
  const settled=f.presenter.inspect().media.find(item=>item.id);assert.equal(settled.phase,'buffering');assert.equal(settled.playing,false);assert.equal(settled.transport.waiting,true);assert.deepEqual(settled.progressReceipt,waiting.progressReceipt,'An old operation cannot mint a newer progress receipt');
  f.video.currentTime=.04;f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'A loop wrap is a baseline change, not forward progress');
  f.video.currentTime=.08;f.video.fire('timeupdate');const looped=f.presenter.inspect().media.find(item=>item.id);assert.equal(looped.playing,true);assert.equal(looped.progressReceipt.fromTime,.04);assert.equal(looped.progressReceipt.currentTime,.08);
 }finally{f.presenter.dispose();terminal(f.presenter.inspect().stage.history);}
});

test('invalidated transport cannot rebind from an inactive, forbidden, undecoded or nonprogressing native sample',async()=>{
 const cases=[
  {name:'inactive',change:f=>{f.select('results');f.settle();f.video.paused=false;}},
  {name:'hidden',change:f=>{f.policy.hidden=true;}},
  {name:'global pause',change:f=>{f.policy.paused=true;}},
  {name:'reduced',change:f=>{f.policy.reduced=true;}},
  {name:'Save Data',change:f=>{f.policy.saveData=true;}},
  {name:'entry not ready',change:f=>{f.policy.siteReady=false;}},
  {name:'user pause',change:f=>{f.controls.find(control=>control.getAttribute('data-project-motion-toggle')).fire('click');f.video.paused=false;}},
  {name:'native paused',change:f=>{f.video.pause();}},
  {name:'native ended',change:f=>{f.video.ended=true;}},
  {name:'native error',change:f=>{f.video.error={code:3};}},
  {name:'native seeking',change:f=>{f.video.seeking=true;}},
  {name:'no decoded current data',change:f=>{f.video.readyState=1;}},
  {name:'unchanged time',change:()=>{},time:1.000437469},
  {name:'backwards time',change:()=>{},time:.5},
 ];
 for(const item of cases){
  const f=await lateNativeRevisit();
  try{
   item.change(f);f.video.currentTime=item.time??2;f.video.fire('timeupdate');const sample=f.presenter.inspect().media.find(row=>row.id);
   assert.equal(sample.playing,false,item.name);assert.equal(sample.progressReceipt,null,item.name);assert.equal(sample.transport.progressGeneration,0,item.name);
   if(['inactive','hidden','global pause','reduced','Save Data','entry not ready','user pause'].includes(item.name))assert.equal(f.video.paused,true,`${item.name} stops the actual disallowed native source`);
  }finally{f.presenter.dispose();}
 }
});

test('seeking latches and native pause survive an old play settlement before a later valid epoch recovery',async()=>{
 const f=await lateNativeRevisit();
 try{
  f.video.seeking=true;f.video.fire('seeking');f.video.currentTime=3;f.video.seeking=false;f.video.fire('timeupdate');
  assert.equal(f.presenter.inspect().media.find(item=>item.id).progressReceipt,null,'Seek completion timeupdate cannot pass the event latch');
  f.video.fire('seeked');f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).progressReceipt,null,'The seeked position is a baseline, not playback');
  f.video.pause();f.pendingPlays[0].resolve();await flush();const paused=f.presenter.inspect().media.find(item=>item.id);
  assert.equal(paused.phase,'paused');assert.equal(paused.playing,false);assert.equal(paused.progressReceipt,null);assert.equal(paused.transport.progressGeneration,0);
  f.video.paused=false;f.video.currentTime=3.1;f.video.fire('timeupdate');const progressing=f.presenter.inspect().media.find(item=>item.id);
  assert.equal(progressing.playing,true);assert.equal(progressing.transport.progressGeneration,progressing.transport.playGeneration);assert.equal(progressing.progressReceipt.fromTime,3);assert.equal(progressing.progressReceipt.currentTime,3.1);
 }finally{f.presenter.dispose();terminal(f.presenter.inspect().stage.history);}
});
test('native timeupdate from seeking, inactive or disallowed transport cannot acknowledge playback, while a real pending rejection still fails',async()=>{
 const f=await pendingRevisit();f.video.currentTime=1.2;f.video.fire('waiting');f.video.seeking=true;f.video.fire('seeking');f.video.currentTime=3;f.video.seeking=false;f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'Seek completion timeupdate occurs after native seeking becomes false');f.video.fire('seeked');f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,false,'The seeked position rebases without acknowledging normal progress');
 f.video.currentTime=3.1;f.video.fire('timeupdate');assert.equal(f.presenter.inspect().media.find(item=>item.id).playing,true);f.pendingPlays[0].reject(Error('Genuine native rejection'));await flush();assert.equal(f.presenter.inspect().media.find(item=>item.id).failed,true);assert.equal(f.presenter.inspect().media.find(item=>item.id).reason,'play-rejected');assert.equal(f.video.getAttribute('src'),null);f.step();f.settle();f.presenter.dispose();terminal(f.presenter.inspect().stage.history);
 const inactive=await pendingRevisit();inactive.select('results');inactive.settle();inactive.video.paused=false;inactive.video.currentTime=2;inactive.video.fire('timeupdate');assert.equal(inactive.presenter.inspect().media.find(item=>item.id).playing,false);assert.equal(inactive.video.paused,true,'Inactive native transport is actually stopped');inactive.presenter.dispose();
 const hidden=await pendingRevisit();hidden.policy.hidden=true;hidden.video.currentTime=2;hidden.video.fire('timeupdate');assert.equal(hidden.presenter.inspect().media.find(item=>item.id).playing,false);assert.equal(hidden.video.paused,true,'Hidden native transport is actually stopped');hidden.pendingPlays[0].resolve();await flush();assert.equal(hidden.video.paused,true);hidden.presenter.dispose();
 const paused=await pendingRevisit();paused.video.pause();assert.equal(paused.presenter.inspect().media.find(item=>item.id).phase,'paused');paused.pendingPlays[0].resolve();await flush();assert.equal(paused.presenter.inspect().media.find(item=>item.id).playing,false);assert.equal(paused.presenter.inspect().media.find(item=>item.id).phase,'paused');paused.video.fire('playing');assert.equal(paused.presenter.inspect().media.find(item=>item.id).playing,false);paused.presenter.dispose();
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
