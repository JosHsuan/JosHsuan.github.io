import {EventManager} from '../core/EventManager.ts';

/** Optional shared lease for previews of the same expensive resource class. */
export function createExclusivePreviewLease(){
 let current=null;
 return{acquire(stop){const previous=current;current=null;previous?.stop('replaced');const owner={stop};current=owner;return()=>{if(current===owner)current=null;};}};
}

/** One asynchronous acquisition, one terminal, no rendering clock. start must
 * release partial resources on signal abort; late fulfilled handles are disposed. */
export function createPreviewLifecycle({start,onState=()=>{},deadline=15000,setTimeout:setTimer=globalThis.setTimeout,clearTimeout:clearTimer=globalThis.clearTimeout,lease,retainWhenInactive=false}={}){
 if(typeof start!=='function')throw TypeError('Preview requires an acquisition factory');
 let active=false,disposed=false,generation=0,operation=null,handle=null,abort=null,timer=null,releaseLease=null,pending=false;
 let phase='poster',reason='initial',size={width:1,height:1},acquisitions=0,disposals=0,renders=0;
 const history=[],resourceFailures=[];
 const inspect=()=>({phase,reason,id:operation?.id??null,active,pending,size:{...size},acquisitions,disposals,renders,resource:handle?.inspect?.()??null,history:[...history],resourceFailures:[...resourceFailures],disposed});
 const notify=()=>onState(inspect());
 const record=(value,eventReason='')=>{
  if(!operation||operation.terminal)return;
  if(value!=='requested')operation.terminal=true;
  history.push(Object.freeze({id:operation.id,phase:value,...(eventReason?{reason:eventReason}:{})}));if(history.length>64)history.shift();
 };
 const clear=()=>{if(timer!==null)clearTimer(timer);timer=null;};
 const drop=()=>{
  clear();abort?.abort();abort=null;
  const previous=handle;handle=null;if(previous){previous.dispose();disposals++;}
  releaseLease?.();releaseLease=null;pending=false;
 };
 const stop=(eventReason='offscreen',keepActive=false)=>{
  if(disposed)return;
  if(!keepActive)active=false;generation++;drop();record('cancelled',eventReason);phase='poster';reason=eventReason;if(!disposed)notify();
 };
 const fail=eventReason=>{
  if(disposed||phase==='failed')return;
  if(operation?.terminal){resourceFailures.push(Object.freeze({id:operation.id,phase:'resource-failed',reason:eventReason}));if(resourceFailures.length>16)resourceFailures.shift();}
  generation++;drop();record('failed',eventReason);phase='failed';reason=eventReason;notify();
 };
 const begin=()=>{
  if(disposed||!active||pending||handle||phase==='failed'||!size.width||!size.height)return;
  const current=++generation;operation={id:current,terminal:false};abort=new AbortController();const signal=abort.signal;
  pending=true;phase='requested';reason='';acquisitions++;record('requested');notify();
  if(disposed||current!==generation)return;
  releaseLease=lease?.acquire(stop)??null;
  timer=setTimer(()=>{if(current===generation&&!disposed)fail('load-timeout');},deadline);
  Promise.resolve().then(()=>{if(signal.aborted)return null;return start({signal,...size});}).then(resource=>{
   if(disposed||current!==generation||signal.aborted||!active){resource?.dispose?.();return;}
   if(typeof resource?.dispose!=='function')throw Error('Invalid preview handle');
   handle=resource;pending=false;clear();
   if(handle.resize){handle.resize(size.width,size.height);renders++;}
   if(disposed||current!==generation||!active)return;
   record('ready');phase='ready';reason='';notify();
  }).catch(error=>{if(!disposed&&current===generation&&!signal.aborted)fail(error?.message||'preview-unavailable');});
 };
 return{
  setActive(value,eventReason='offscreen'){
   if(disposed)return;const next=!!value;if(next===active)return;
   if(!next){
    if(retainWhenInactive&&handle&&phase==='ready'){
     active=false;reason=eventReason;
     try{handle.suspend?.();}catch(error){fail(error?.message||'suspend-unavailable');return;}
     notify();return;
    }
    stop(eventReason);return;
   }
   active=true;
   if(retainWhenInactive&&handle&&phase==='ready'){
    reason='';try{handle.resume?.();if(size.width&&size.height&&handle.resize){handle.resize(size.width,size.height);renders++;}}catch(error){fail(error?.message||'render-unavailable');return;}
    notify();return;
   }
   if(phase==='failed')phase='poster';begin();
  },
  resize(width,height){
   if(disposed)return;if(![width,height].every(value=>Number.isFinite(value)&&value>=0))throw RangeError('Preview size must be finite and nonnegative');
   if(width===size.width&&height===size.height)return;size={width,height};
   if(!width||!height){if(pending||handle&&!retainWhenInactive)stop('zero-size',true);return;}
   if(handle&&phase==='ready'){if(active)try{handle.resize?.(width,height);renders++;}catch(error){fail(error?.message||'render-unavailable');}}
   else begin();
  },
  stop,
  fail,
  inspect,
  dispose(){if(disposed)return;stop('disposed');disposed=true;},
 };
}

/** Shared eligibility for model/GIF enhancement. Native document/policy/size
 * events supply all work; there is no scroll handler, timer or animation loop. */
export function observePreviewEligibility({element,window:win,document:doc,onChange,onSize,mode='visible'}={}){
 if(!['visible','page'].includes(mode))throw TypeError('Unknown preview eligibility mode');
 const events=new EventManager(),scope=events.createScope('preview-eligibility');
 const connection=win.navigator?.connection;
 let visible=false,pageAway=false,disposed=false,last='';
 const inspect=()=>{
  const hidden=!!doc.hidden,reduce=false,saveData=!!connection?.saveData,siteReady=doc.documentElement.getAttribute('data-site-entry-state')==='entered';
  const active=!hidden&&!pageAway&&(mode==='page'||visible&&siteReady);
  const reason=pageAway?'page-exit':hidden?'hidden':mode==='page'?'page-ready':!siteReady?'entry-pending':!visible?'offscreen':'visible';
  return{active,reason,visible,hidden,pageAway,reduced:reduce,saveData,siteReady,mode};
 };
 const publish=()=>{if(disposed)return;const state=inspect(),key=JSON.stringify(state);if(key!==last){last=key;onChange(state);}};
 events.listen(scope,doc,'visibilitychange',publish);
 events.listen(scope,win,'pagehide',()=>{pageAway=true;publish();});
 events.listen(scope,win,'pageshow',()=>{pageAway=false;publish();});
 if(connection?.addEventListener)events.listen(scope,connection,'change',publish);
 if(win.IntersectionObserver){const observer=new win.IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===element)visible=entry.isIntersecting&&entry.intersectionRatio>0;publish();},{threshold:[0,.01]});observer.observe(element);scope.add(()=>observer.disconnect());}
 if(win.MutationObserver){const observer=new win.MutationObserver(publish);observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-site-entry-state']});scope.add(()=>observer.disconnect());}
 if(onSize){
  const measure=()=>{const rect=element.getBoundingClientRect();onSize(Math.max(0,rect.width),Math.max(0,rect.height));};
  if(win.ResizeObserver){const observer=new win.ResizeObserver(entries=>{for(const entry of entries)if(entry.target===element)onSize(Math.max(0,entry.contentRect.width),Math.max(0,entry.contentRect.height));});observer.observe(element);scope.add(()=>observer.disconnect());}
  else events.listen(scope,win,'resize',measure);
  measure();
 }
 publish();
 return{inspect,dispose(){if(disposed)return;disposed=true;scope.dispose();events.dispose();}};
}
