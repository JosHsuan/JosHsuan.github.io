import {createEntryMotion,advanceEntryMotion,ENTRY_DEADLINE_SECONDS} from '../motion/entry-motion.mjs';

/** One entry gate per runtime. Readiness is event-driven; only the director
 * advances its visual time. No autonomous timer, RAF, asset or camera writer. */
export function createEntryManager({input}){
 const publisher=input.dom.forOwner('entry');
 let connection=null,policy=null,failure=null,generation=0,motion=createEntryMotion();
 let prerequisites={document:false,typography:false,scene:false},reason='',notified='',timedOut=false;
 const history=[];
 const emit=phase=>{const fact={phase,...(reason?{reason}:{})};history.push(fact);if(history.length>24)history.shift();input.events.emit('entryReadiness',fact);};
 const notify=()=>{
  if(!connection)return;
  const count=Object.values(prerequisites).filter(Boolean).length;
  const snapshot={phase:motion.phase,progress:Math.round(count/3*100),reason};
  const key=JSON.stringify(snapshot);if(key!==notified){notified=key;connection.onChange(snapshot);}
 };
 const wake=()=>input.invalidateLayout('entry-readiness',false);
 const resolveScene=()=>{
  if(!connection||prerequisites.scene)return;
  const state=input.get();
  if(state.sceneReady||state.sceneFailed||policy==='deferred'){
   prerequisites.scene=true;
   if(state.sceneFailed)reason='scene-unavailable';else if(policy==='deferred'&&!state.sceneReady)reason='static-ready';
   notify();wake();
  }
 };
 const paint=()=>{
  if(!connection)return;
  const {element,content,document:doc}=connection;
  const t=motion.reveal,p=t*t*t*(10+t*(-15+6*t));
  publisher.style(element,'--entry-reveal',p);
  publisher.style(element,'--entry-drift',Math.sin(motion.time*1.8)*8+'px');
  publisher.style(element,'--entry-trace',String((Math.sin(motion.time*2.2)+1)*.5));
  publisher.attribute(element,'data-phase',motion.phase);
  publisher.attribute(doc.documentElement,'data-entry-state',motion.phase);
  if(motion.phase==='entered'){
   publisher.attribute(content,'inert',connection.previousInert);
   publisher.attribute(content,'aria-busy',null);
   publisher.attribute(element,'hidden','');
  }
 };
 return {
  scenePolicy(value){policy=value;resolveScene();},
  bindFailure(callback){failure=callback;return()=>{if(failure===callback)failure=null;};},
  connect({element,content,document:doc,onChange}){
   if(connection)throw Error('Entry already connected');
   if(!element||!content)throw Error('Entry requires its loader and project content');
   const current=++generation,scope=input.events.createScope('entry-readiness');
   motion=createEntryMotion();prerequisites={document:true,typography:false,scene:false};notified='';timedOut=false;reason='';
   connection={element,content,document:doc,onChange,previousInert:content.getAttribute('inert')};
   publisher.attribute(element,'hidden',null);publisher.attribute(content,'inert','');publisher.attribute(content,'aria-busy','true');
   publisher.attribute(doc.documentElement,'data-entry-state','preparing');
   input.events.on(scope,'stateChanged',resolveScene);
   emit('preparing');resolveScene();notify();wake();
   Promise.resolve(doc.fonts?.ready).then(()=>{
    if(current!==generation)return;prerequisites.typography=true;notify();wake();
   },()=>{
    if(current!==generation)return;prerequisites.typography=true;reason='fallback-typography';notify();wake();
   });
   return()=>{
    if(current!==generation)return;generation++;scope.dispose();
    const cancelled=motion.phase!=='entered'&&motion.phase!=='cancelled';
    if(cancelled)motion.phase='cancelled';
    publisher.attribute(content,'inert',connection.previousInert);publisher.attribute(content,'aria-busy',null);
    publisher.attribute(doc.documentElement,'data-entry-state',null);publisher.attribute(element,'hidden','');connection=null;
    if(cancelled)emit('cancelled');
   };
  },
  advance(dt,{resumed=false,hidden=false,systemReduced=false}={}){
   if(!connection)return false;
   const needsFrame=advanceEntryMotion(motion,dt,{ready:Object.values(prerequisites).every(Boolean),reduced:systemReduced,resumed,hidden});
   if(!motion.ready&&!timedOut&&motion.time>=ENTRY_DEADLINE_SECONDS){
    timedOut=true;prerequisites.typography=true;
    if(!prerequisites.scene){reason='scene-timeout';failure?.();}
    notify();wake();
   }
   paint();for(const phase of motion.events)emit(phase);notify();return needsFrame;
  },
  inspect:()=>({phase:motion.phase,progress:Math.round(Object.values(prerequisites).filter(Boolean).length/3*100),prerequisites:{...prerequisites},reason,time:motion.time,reveal:motion.reveal,history:[...history]}),
 };
}
