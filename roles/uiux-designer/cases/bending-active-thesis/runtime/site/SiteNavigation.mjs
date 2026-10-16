import {EventManager} from '../core/EventManager.ts';
import {acquireSiteReadiness} from './SiteReadiness.mjs';
import {subscribeSceneEntry} from './site-entry-bridge.mjs';

export const BENDING_ROUTE='/projects/bending-active/';
export const SITE_HANDOFF_KEY='portfolio-navigation-handoff-v1';
export const SITE_TERMINAL_KEY='portfolio-navigation-terminal-v1';
export const SITE_HANDOFF_MAX_AGE_MS=60000;
const terminal=new Set(['entered','cancelled','failed']);
const revealTiming={duration:720,easing:'cubic-bezier(.45,0,.15,1)',fill:'both'};
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
 let revealGeneration=0,revealMode=null,revealAnimations=[],revealFrame=null,revealExpiresAt=null,startupExpiresAt=null,completePreparation=null;
 const sceneRoute=path(win.location.pathname)===BENDING_ROUTE;
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const monotonic=()=>win.performance?.now()??now();
 const storageRead=key=>{try{return JSON.parse(win.sessionStorage.getItem(key)||'null');}catch{return null;}};
 const storageWrite=(key,value)=>{try{win.sessionStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 const storageRemove=key=>{try{win.sessionStorage.removeItem(key);}catch{/* Native navigation still works without storage. */}};
 const remember=fact=>{history.push(Object.freeze({...fact}));if(history.length>48)history.splice(0,history.length-48);};
 const clearDeadlines=()=>{if(deadlineTimer!==null)clearTimer(deadlineTimer);if(revealTimer!==null)clearTimer(revealTimer);deadlineTimer=revealTimer=null;};
 const releaseReveal=()=>{
  revealGeneration++;revealMode=null;
  if(revealFrame!==null)win.cancelAnimationFrame(revealFrame);revealFrame=null;revealExpiresAt=startupExpiresAt=null;completePreparation=null;
  const owned=revealAnimations;revealAnimations=[];
  for(const animation of owned)try{animation.cancel();}catch{/* Continue releasing the other owned animation. */}
  attr(element,'data-site-reveal',null);
 };
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
   // Hide first: cancelling a fill-both effect must not flash its base style.
   clearDeadlines();releaseReveal();restoreContent();
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
  cancel('superseded');clearDeadlines();releaseReveal();restoreContent();handedOff=false;
  active={id:id??`site-${now()}-${++serial}`,phase:'idle',kind,url,reason:''};
  if(previous.length){for(const fact of previous.slice(-24))remember(fact);active.phase='requested';paint('requested');notify();}
  else record('requested');
 };
 const enter=reason=>record('entered',reason);
 const fail=reason=>record('failed',reason);
 const startupExpired=()=>{
  if(startupExpiresAt===null||monotonic()<startupExpiresAt)return false;
  fail(documentResult?.ready?'presentation-timeout':'readiness-timeout');return true;
 };
 const completeReveal=reason=>{if(revealExpiresAt!==null&&monotonic()>=revealExpiresAt)fail('reveal-timeout');else enter(reason);};
 const reveal=({immediate=false}={})=>{
  if(!active||active.kind!=='arrival'||active.phase!=='requested'||startupExpired())return;
  const id=active.id;
  const content=element.querySelector?.('[data-site-loader-content]');
  revealMode=typeof element.animate==='function'&&typeof content?.animate==='function'&&typeof win.requestAnimationFrame==='function'&&typeof win.cancelAnimationFrame==='function'?'native':'css';
  const generation=++revealGeneration;
  const current=()=>!disposed&&generation===revealGeneration&&active?.id===id&&active.kind==='arrival'&&['requested','ready','revealing'].includes(active.phase);
  let finished=false,effectsStarted=false;
  const accept=({staticReveal=false,reason=''}={})=>{
   if(!current()||active.phase!=='requested'||startupExpired())return;
   if(deadlineTimer!==null)clearTimer(deadlineTimer);deadlineTimer=null;startupExpiresAt=null;
   const readyAt=monotonic();revealExpiresAt=readyAt+revealDeadline;
   if(!record('ready')||!current()||active.phase!=='ready')return;
   if(monotonic()>=revealExpiresAt){fail('reveal-timeout');return;}
   if(!record('revealing')||!current()||active.phase!=='revealing')return;
   if(staticReveal){completeReveal(reason);return;}
   // Presentation and native pending play used the original arrival budget.
   // This separate completion deadline begins only at the accepted ready fact.
   revealTimer=setTimer(()=>{if(current())fail('reveal-timeout');},Math.max(0,revealExpiresAt-monotonic()));
   if(finished)completeReveal();
  };
  completePreparation=reason=>accept({staticReveal:true,reason});
  if(immediate||reduced?.matches||doc.hidden){accept({staticReveal:true,reason:doc.hidden?'hidden-static':''});return;}
  if(revealMode!=='native'){accept();return;}
  attr(element,'data-site-reveal','native');
  const begin=()=>{
   if(!current()||active.phase!=='requested'||effectsStarted||startupExpired())return;
   if(reduced?.matches||doc.hidden){completePreparation(doc.hidden?'hidden-static':'reduced-motion');return;}
   effectsStarted=true;
   const preparations=[],completions=[];
   try{
    for(const [target,keyframes] of [[element,[{opacity:1},{opacity:0}]],[content,[{transform:'translateY(0)'},{transform:'translateY(-12px)'}]]]){
     const animation=target.animate(keyframes,revealTiming);
     if(typeof animation?.cancel!=='function')throw Error('Native reveal cannot be released');
     revealAnimations.push(animation);
     const finished=animation.finished;
     if(typeof finished?.then!=='function')throw Error('Native reveal has no completion signal');
     completions.push(finished);
     const ready=animation.ready;
     if(typeof ready?.then!=='function')throw Error('Native reveal has no play-readiness signal');
     preparations.push(ready);
    }
   }catch{/* The remaining startup budget remains the failure terminal. */}
   // Attach both handlers immediately, including while native play is pending.
   // No completion can enter before both actual play-readiness signals arrive.
   Promise.all(completions).then(()=>{
    if(completions.length!==2||!current())return;finished=true;
    if(active.phase==='revealing')completeReveal();
   },()=>{/* Cancellation is not completion. */});
   Promise.all(preparations).then(()=>{if(preparations.length===2&&current())accept();},()=>{/* Rejected play-readiness cannot become ready. */});
  };
  // A finite presentation opportunity is not a paint acknowledgement. Native
  // ready promises, within the same startup budget, acknowledge pending play.
  revealFrame=win.requestAnimationFrame(()=>{
   if(!current()||active.phase!=='requested')return;revealFrame=null;if(startupExpired())return;
   begin();
  });
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
  const startedAt=monotonic();
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
  const current=active.id;
  if(disposed||terminal.has(active.phase))return;
  if(!sceneRoute){
   guardContent();startupExpiresAt=startedAt+deadline;
   if(startupExpired())return;
   const armStartup=()=>{deadlineTimer=setTimer(()=>{
    if(disposed||current!==active?.id||active.phase!=='requested')return;
    // A fractional delay must not release a live prerequisite or lose the
    // bound if a host delivers its timer before the monotonic endpoint.
    if(monotonic()<startupExpiresAt){armStartup();return;}
    const pending=resource;resource=null;pending?.release();startupExpired();
   },Math.max(0,Math.ceil(startupExpiresAt-monotonic())));};
   armStartup();
  }
  resource=acquireReadiness(doc,{setTimeout:setTimer,clearTimeout:clearTimer,deadline:sceneRoute?deadline:Math.ceil(Math.max(0,startupExpiresAt-monotonic()))});
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
   events.listen(scope,element,'animationend',event=>{if(revealMode==='css'&&event.target===element&&active?.kind==='arrival'&&active.phase==='revealing')completeReveal();});
   events.listen(scope,win,'pagehide',()=>{
    clearDeadlines();resource?.release();resource=null;restoreContent();
    if(active?.kind==='navigation'&&!terminal.has(active.phase)&&active.tracked)handedOff=true;
    else cancel(active?.kind==='navigation'?'untracked-handoff':'page-hidden');
    releaseReveal();
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
    if(!doc.hidden||active?.kind!=='arrival'||sceneRoute||!documentResult?.ready)return;
    if(active.phase==='requested')completePreparation?.('hidden-static');else if(['ready','revealing'].includes(active.phase))completeReveal('hidden-static');
   });
   if(reduced)events.listen(scope,reduced,'change',()=>{
    if(!reduced.matches||active?.kind!=='arrival'||sceneRoute||!documentResult?.ready)return;
    if(active.phase==='requested')completePreparation?.('reduced-motion');else if(['ready','revealing'].includes(active.phase))completeReveal('reduced-motion');
   });
   arrival();if(sceneRoute)releaseScene=subscribeScene(sceneFact);
   return()=>this.dispose();
  },
  onReadiness(listener){return events.on(scope,'readiness',listener);},
  inspect:snapshot,
  dispose(){
   if(disposed)return;if(!handedOff)cancel('disconnected');disposed=true;clearDeadlines();resource?.release();resource=null;releaseScene?.();releaseScene=null;
   restoreContent();attr(element,'hidden','');releaseReveal();attr(element,'data-site-connected',null);attr(doc.documentElement,'data-site-entry-state',null);events.dispose();
  },
 };
}
