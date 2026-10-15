import {EventManager} from '../core/EventManager.ts';
import {acquireSiteReadiness} from './SiteReadiness.mjs';
import {subscribeSceneEntry} from './site-entry-bridge.mjs';

export const BENDING_ROUTE='/projects/bending-active/';
export const SITE_HANDOFF_KEY='portfolio-navigation-handoff-v1';
export const SITE_TERMINAL_KEY='portfolio-navigation-terminal-v1';
export const SITE_HANDOFF_MAX_AGE_MS=60000;
const terminal=new Set(['entered','cancelled','failed']);
const path=value=>value.endsWith('/')?value:`${value}/`;
const attr=(node,key,value)=>{if(value===null)node?.removeAttribute(key);else node?.setAttribute(key,String(value));};

/** Native documents own navigation. This controller owns only site loader DOM
 * and discrete request facts; the Bending Director owns its scene reveal. */
export function createSiteNavigation({window:win,document:doc,element,onChange=()=>{},
 acquireReadiness=acquireSiteReadiness,subscribeScene=subscribeSceneEntry,
 setTimeout:setTimer=win.setTimeout.bind(win),clearTimeout:clearTimer=win.clearTimeout.bind(win),
 now=()=>Date.now(),deadline=15000,revealDeadline=1600}={}){
 const events=new EventManager(),scope=events.createScope('site-navigation');
 const history=[],guarded=new Map();
 let active=null,serial=0,connected=false,disposed=false,deadlineTimer=null,revealTimer=null,resource=null,releaseScene=null;
 let handedOff=false,sceneId=null,documentResult=null,pendingScene=null,lastScenePhase='preparing';
 const sceneRoute=path(win.location.pathname)===BENDING_ROUTE;
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const storageRead=key=>{try{return JSON.parse(win.sessionStorage.getItem(key)||'null');}catch{return null;}};
 const storageWrite=(key,value)=>{try{win.sessionStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 const storageRemove=key=>{try{win.sessionStorage.removeItem(key);}catch{/* Native navigation still works without storage. */}};
 const remember=fact=>{history.push(Object.freeze({...fact}));if(history.length>48)history.splice(0,history.length-48);};
 const clearDeadlines=()=>{if(deadlineTimer!==null)clearTimer(deadlineTimer);if(revealTimer!==null)clearTimer(revealTimer);deadlineTimer=revealTimer=null;};
 const snapshot=()=>({id:active?.id??null,phase:active?.phase??'idle',kind:active?.kind??null,url:active?.url??win.location.href,
  reason:active?.reason??'',delegated:sceneRoute,handedOff,readiness:documentResult,history:[...history],events:events.inspect()});
 const notify=()=>onChange(snapshot());
 const paint=phase=>{
  attr(doc.documentElement,'data-site-entry-state',phase);
  attr(element,'data-site-phase',phase);
  const caseOwnsGate=sceneRoute&&(active?.kind==='arrival'||!terminal.has(lastScenePhase));
  attr(element,'hidden',terminal.has(phase)||caseOwnsGate?'':null);
 };
 const record=(phase,reason='')=>{
  if(!active||terminal.has(active.phase))return false;
  active.phase=phase;active.reason=reason;
  const fact=Object.freeze({id:active.id,phase,kind:active.kind,url:active.url,...(reason?{reason}:{})});
  remember(fact);paint(phase);
  if(terminal.has(phase)){
   clearDeadlines();restoreContent();
   storageWrite(SITE_TERMINAL_KEY,fact);
   const handoff=storageRead(SITE_HANDOFF_KEY);if(handoff?.id===active.id)storageRemove(SITE_HANDOFF_KEY);
  }
  events.emit('readiness',fact);notify();return true;
 };
 const restoreContent=()=>{for(const [node,previous] of guarded){attr(node,'inert',previous.inert);attr(node,'aria-busy',previous.busy);}guarded.clear();};
 const guardContent=()=>{
  for(const node of doc.querySelectorAll('[data-portfolio-root], [data-portfolio-masthead], [data-portfolio-navigation], [data-site-content], a[href="#portfolio-main"]')){
   if(guarded.has(node))continue;
   guarded.set(node,{inert:node.getAttribute('inert'),busy:node.getAttribute('aria-busy')});attr(node,'inert','');attr(node,'aria-busy','true');
  }
 };
 const cancel=reason=>{if(active&&!terminal.has(active.phase))record('cancelled',reason);};
 const request=(kind,url,{id,previous=[]}={})=>{
  cancel('superseded');clearDeadlines();restoreContent();handedOff=false;
  active={id:id??`site-${now()}-${++serial}`,phase:'idle',kind,url,reason:''};
  if(previous.length){for(const fact of previous.slice(-24))remember(fact);active.phase='requested';paint('requested');notify();}
  else record('requested');
 };
 const enter=reason=>record('entered',reason);
 const fail=reason=>record('failed',reason);
 const reveal=({immediate=false}={})=>{
  if(!active||terminal.has(active.phase))return;
  const id=active.id;
  if(!record('ready')||disposed||active?.id!==id||active.phase!=='ready')return;
  if(!record('revealing')||disposed||active?.id!==id||active.phase!=='revealing')return;
  if(immediate||reduced?.matches||doc.hidden){enter(doc.hidden?'hidden-static':'');return;}
  // animationend is the normal completion. The deadline is a failure terminal,
  // never a fabricated successful animation when CSS/painting is unavailable.
  revealTimer=setTimer(()=>fail('reveal-timeout'),revealDeadline);
 };
 const applyScene=fact=>{
  if(!active||active.kind!=='arrival')return;
  if(sceneId!==null&&sceneId!==fact.id){cancel('scene-replaced');request('arrival',win.location.href);}
  if(terminal.has(active.phase))return;
  sceneId=fact.id;
  const id=active.id,stillArrival=()=>!disposed&&active?.id===id&&active.kind==='arrival'&&!terminal.has(active.phase);
  if(fact.phase==='ready'&&active.phase==='requested')record('ready');
  else if(fact.phase==='revealing'){
   if(active.phase==='requested')record('ready');if(stillArrival()&&active.phase==='ready')record('revealing');
  }else if(fact.phase==='entered'){
   const failure=documentResult&&!documentResult.ready?documentResult.failures.join(','):['scene-unavailable','scene-timeout','fallback-typography','page-resource-unavailable','document-timeout'].includes(fact.reason)?fact.reason:'';
   if(failure){fail(failure);return;}
   if(active.phase==='requested')record('ready');if(!stillArrival())return;
   if(active.phase==='ready')record('revealing');if(stillArrival())enter(fact.reason||'');
  }else if(fact.phase==='cancelled')cancel(fact.reason||'scene-disconnected');
 };
 const sceneFact=fact=>{
  lastScenePhase=fact.phase;
  if(!documentResult){pendingScene??=[];pendingScene.push(fact);return;}
  applyScene(fact);
 };
 const arrival=({restored=false}={})=>{
  resource?.release();resource=null;documentResult=null;pendingScene=null;sceneId=null;
  const handoff=storageRead(SITE_HANDOFF_KEY),url=new URL(win.location.href);
  const receipt=storageRead(SITE_TERMINAL_KEY);
  // Consume even empty/malformed storage; it cannot remain an open handoff.
  storageRemove(SITE_HANDOFF_KEY);
  const previous=Array.isArray(handoff?.history)?handoff.history.filter(fact=>fact&&fact.id===handoff.id&&typeof fact.url==='string'&&['requested','ready','revealing',...terminal].includes(fact.phase)):[];
  const original=previous.findLast(fact=>fact.phase==='requested');
  const recoverable=typeof handoff?.id==='string'&&handoff.id.length>0&&original;
  const closed=receipt?.id===handoff?.id&&terminal.has(receipt?.phase)||previous.some(fact=>terminal.has(fact.phase));
  let adopted=false;
  if(recoverable&&!closed){
   const age=now()-handoff.startedAt;
   let validURL=false;try{validURL=new URL(handoff.url).origin===url.origin&&handoff.url===original.url;}catch{/* Recover the known request, then close the malformed destination. */}
   const reason=!Number.isFinite(handoff.startedAt)||handoff.startedAt<0||age<0?'handoff-invalid-time':!validURL?'handoff-invalid':age>=SITE_HANDOFF_MAX_AGE_MS?'handoff-expired':handoff.url!==url.href?'handoff-destination-mismatch':'';
   request(reason?'navigation':'arrival',reason?original.url:url.href,{id:handoff.id,previous});
   if(reason)cancel(reason);else adopted=true;
  }
  // A valid terminal receipt prevents a duplicate cancellation. Unknown corrupt
  // data has no provable request to close and cannot fabricate lifecycle facts.
  if(!adopted)request('arrival',url.href);
  if(!sceneRoute)guardContent();
  resource=acquireReadiness(doc,{setTimeout:setTimer,clearTimeout:clearTimer,deadline});
  const current=active.id;
  resource.promise.then(result=>{
   if(disposed||current!==active?.id||terminal.has(active.phase))return;
   documentResult=result;notify();
   if(sceneRoute){for(const fact of pendingScene??[])applyScene(fact);pendingScene=null;}
   else if(!result.ready)fail(result.failures.join(','));
   else reveal({immediate:restored});
  });
 };
 const navigate=url=>{
  request('navigation',url);
  resource?.release();resource=null;
  const tracked=storageWrite(SITE_HANDOFF_KEY,{id:active.id,url,startedAt:now(),history:history.filter(fact=>fact.id===active.id)});
  active.tracked=tracked;
  // This deadline only releases the outgoing document if navigation never
  // commits. It neither drives frames nor overrides the scene entry clock.
  deadlineTimer=setTimer(()=>fail('navigation-timeout'),deadline);
 };
 const click=event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target?.closest?.('a[href]');
  if(!anchor||anchor.hasAttribute('download')||anchor.target&&anchor.target.toLowerCase()!=='_self'||anchor.rel?.toLowerCase().split(/\s+/).includes('external'))return;
  let destination;try{destination=new URL(anchor.href,win.location.href);}catch{return;}
  const current=new URL(win.location.href);
  const fragmentOnly=destination.pathname===current.pathname&&destination.search===current.search&&destination.href.includes('#');
  if(destination.origin!==current.origin||!/^https?:$/.test(destination.protocol)||fragmentOnly)return;
  navigate(destination.href);
  const id=active.id;
  // Later bubble listeners may still cancel the native activation.
  Promise.resolve().then(()=>{if(event.defaultPrevented&&active?.id===id){cancel('activation-prevented');}});
 };
 return{
  start(){
   if(connected||disposed)throw Error('Site navigation already connected');connected=true;
   attr(element,'data-site-connected','');
   events.listen(scope,doc,'click',click);
   events.listen(scope,win,'popstate',()=>{if(active?.kind==='navigation')cancel('history-navigation');});
   events.listen(scope,element,'animationend',event=>{if(event.target===element&&active?.kind==='arrival'&&active.phase==='revealing')enter();});
   events.listen(scope,win,'pagehide',()=>{
    clearDeadlines();resource?.release();resource=null;restoreContent();
    if(active?.kind==='navigation'&&!terminal.has(active.phase)&&active.tracked)handedOff=true;
    else cancel(active?.kind==='navigation'?'untracked-handoff':'page-hidden');
   });
   events.listen(scope,win,'pageshow',event=>{
    if(!event.persisted)return;
    if(handedOff&&active){
     const receipt=storageRead(SITE_TERMINAL_KEY);
     if(receipt?.id===active.id){active.phase=receipt.phase;remember(receipt);}
     // Ownership was transferred to another document. A missing/overwritten
     // receipt cannot justify emitting a second terminal for that request.
     else active=null;
    }
    arrival({restored:true});
    if(sceneRoute){releaseScene?.();releaseScene=subscribeScene(sceneFact);}
   });
   events.listen(scope,doc,'visibilitychange',()=>{
    if(doc.hidden&&active?.kind==='arrival'&&!sceneRoute&&active.phase==='revealing')enter('hidden-static');
   });
   if(reduced)events.listen(scope,reduced,'change',()=>{if(reduced.matches&&active?.kind==='arrival'&&!sceneRoute&&active.phase==='revealing')enter('reduced-motion');});
   arrival();if(sceneRoute)releaseScene=subscribeScene(sceneFact);
   return()=>this.dispose();
  },
  onReadiness(listener){return events.on(scope,'readiness',listener);},
  inspect:snapshot,
  dispose(){
   if(disposed)return;if(!handedOff)cancel('disconnected');disposed=true;clearDeadlines();resource?.release();resource=null;releaseScene?.();releaseScene=null;
   restoreContent();attr(element,'hidden','');attr(element,'data-site-connected',null);attr(doc.documentElement,'data-site-entry-state',null);events.dispose();
  },
 };
}
