import {EventManager} from '../core/EventManager.ts';
import {acquireSiteReadiness} from './SiteReadiness.mjs';
import {acquirePagePreviewReadiness} from './PagePreviewReadiness.mjs';
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
 acquireReadiness=acquireSiteReadiness,acquirePreviews=acquirePagePreviewReadiness,subscribeScene=subscribeSceneEntry,
 setTimeout:setTimer=win.setTimeout.bind(win),clearTimeout:clearTimer=win.clearTimeout.bind(win),
 now=()=>Date.now(),deadline=15000,revealDeadline=1600}={}){
 const events=new EventManager(),scope=events.createScope('site-navigation');
 const history=[],guarded=new Map();
 let active=null,serial=0,connected=false,disposed=false,deadlineTimer=null,revealTimer=null,resource=null,releaseScene=null;
 let handedOff=false,sceneId=null,documentResult=null,pendingScene=null,lastScenePhase='preparing',previewResource=null;
 let revealGeneration=0,revealMode=null,revealAnimations=[],revealFrame=null,revealExpiresAt=null,startupExpiresAt=null,completePreparation=null;
 const sceneRoute=path(win.location.pathname)===BENDING_ROUTE;
 const monotonic=()=>win.performance?.now()??now();
 // Opt-in observation only: no new clock, scheduler or readiness prerequisite.
 const diagnosticEvents=win.__SITE_NAVIGATION_DIAGNOSTICS__===true?[]:null;
 let diagnosticEpoch=0,diagnosticSequence=0,diagnosticDropped=0;
 const diagnostic=(checkpoint,facts={},epoch=diagnosticEpoch)=>{
  if(!diagnosticEvents)return;
  try{
   diagnosticEvents.push(Object.freeze({epoch,sequence:++diagnosticSequence,at:monotonic(),checkpoint,
    current:epoch===diagnosticEpoch&&!disposed&&!terminal.has(active?.phase),phase:active?.phase??'idle',hidden:Boolean(doc.hidden),...facts}));
   if(diagnosticEvents.length>48){diagnosticEvents.shift();diagnosticDropped++;}
  }catch{/* Observation cannot interrupt native lifecycle handling. */}
 };
 const readinessFacts=result=>({ready:Boolean(result.ready),pendingCount:result.pending?.length??0,failureCount:result.failures?.length??0});
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
 const snapshot=()=>({id:active?.id??null,phase:active?.phase??'idle',kind:active?.kind??null,url:active?.url??win.location.href,disposed,
  reason:active?.reason??'',presentation:element?.getAttribute('data-site-project-entry')??null,delegated:sceneRoute,handedOff,readiness:documentResult,previews:previewResource?.inspect?.()??null,history:[...history],events:events.inspect(),...(diagnosticEvents?{startupDiagnostics:{enabled:true,clock:win.performance?.now?'performance.now':'now',timeOrigin:Number.isFinite(win.performance?.timeOrigin)?win.performance.timeOrigin:null,epoch:diagnosticEpoch,dropped:diagnosticDropped,events:diagnosticEvents.map(event=>({...event}))}}:{})});
 const notify=()=>onChange(snapshot());
 const presentation=value=>{attr(element,'data-site-project-entry',value);attr(doc.documentElement,'data-site-project-entry',value);};
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
  diagnostic('phase',{phase,reason:reason.slice(0,160)});
  if(terminal.has(phase)){
   // Hide first: cancelling a fill-both effect must not flash its base style.
   clearDeadlines();releaseReveal();restoreContent();presentation(null);
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
 const cancel=reason=>{
  if(active&&!terminal.has(active.phase)){
   // A prevented or interrupted navigation can uncover this same document.
   // Pending enhancement must close before that cancellation exposes its poster.
   previewResource?.fallback?.(reason);record('cancelled',reason);
  }
 };
 const request=(kind,url,{id,previous=[]}={})=>{
  cancel('superseded');clearDeadlines();releaseReveal();restoreContent();presentation(null);handedOff=false;
  if(diagnosticEvents)diagnosticEpoch++;
  active={id:id??`site-${now()}-${++serial}`,phase:'idle',kind,url,reason:''};
  diagnostic('request',{kind});
  if(previous.length){for(const fact of previous.slice(-24))remember(fact);active.phase='requested';paint('requested');notify();}
  else record('requested');
 };
 const enter=reason=>record('entered',reason);
 const fail=reason=>{
  // A failed loader is fail-open for reading, not permission for an unfinished
  // card to pop into 3D after uncovering. Its owner aborts and latches the poster
  // synchronously before the failed terminal hides this loading surface.
  previewResource?.fallback?.(reason);return record('failed',reason);
 };
 const startupExpired=()=>{
  const at=startupExpiresAt===null?null:monotonic();
  diagnostic('startup-deadline-check',{checkedAt:at,expiresAt:startupExpiresAt,expired:startupExpiresAt!==null&&at>=startupExpiresAt});
  if(startupExpiresAt===null||at<startupExpiresAt)return false;
  fail(documentResult?.ready?'presentation-timeout':'readiness-timeout');return true;
 };
 const completeReveal=reason=>{if(revealExpiresAt!==null&&monotonic()>=revealExpiresAt)fail('reveal-timeout');else enter(reason);};
 const reveal=({immediate=false,staticReason=''}={})=>{
  if(!active||active.kind!=='arrival'||active.phase!=='requested'||startupExpired())return;
  const id=active.id;
  const content=element.querySelector?.('[data-site-loader-content]');
  revealMode=typeof element.animate==='function'&&typeof content?.animate==='function'&&typeof win.requestAnimationFrame==='function'&&typeof win.cancelAnimationFrame==='function'?'native':'css';
  const generation=++revealGeneration,epoch=diagnosticEpoch;
  diagnostic('reveal-selected',{mode:revealMode,immediate,reduced:false},epoch);
  const current=()=>!disposed&&generation===revealGeneration&&active?.id===id&&active.kind==='arrival'&&['requested','ready','revealing'].includes(active.phase);
  let finished=false,effectsStarted=false;
  const accept=({staticReveal=false,reason=''}={})=>{
   if(!current()||active.phase!=='requested'||startupExpired())return;
   if(deadlineTimer!==null)clearTimer(deadlineTimer);deadlineTimer=null;startupExpiresAt=null;
   const readyAt=monotonic();revealExpiresAt=readyAt+revealDeadline;
   diagnostic('presentation-accepted',{staticReveal,reason:reason.slice(0,160),revealExpiresAt},epoch);
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
  if(immediate||doc.hidden){accept({staticReveal:true,reason:doc.hidden?'hidden-static':staticReason});return;}
  if(revealMode!=='native'){accept();return;}
  attr(element,'data-site-reveal','native');
  const begin=()=>{
   if(!current()||active.phase!=='requested'||effectsStarted||startupExpired())return;
   if(doc.hidden){completePreparation('hidden-static');return;}
   effectsStarted=true;diagnostic('native-effects-begin',{},epoch);
   const preparations=[],completions=[];
   try{
    for(const [target,keyframes] of [[element,[{opacity:1},{opacity:0}]],[content,[{transform:'translateY(0)'},{transform:'translateY(-12px)'}]]]){
     const animation=target.animate(keyframes,revealTiming);
     if(typeof animation?.cancel!=='function')throw Error('Native reveal cannot be released');
     revealAnimations.push(animation);diagnostic('animation-created',{index:revealAnimations.length},epoch);
     const finished=animation.finished;
     if(typeof finished?.then!=='function')throw Error('Native reveal has no completion signal');
     completions.push(finished);
     const ready=animation.ready;
     if(typeof ready?.then!=='function')throw Error('Native reveal has no play-readiness signal');
     preparations.push(ready);
     if(diagnosticEvents){const index=preparations.length;try{ready.then(()=>diagnostic('animation-ready-observed',{index,status:'resolved'},epoch),()=>diagnostic('animation-ready-observed',{index,status:'rejected'},epoch));}catch{/* Diagnostic subscription cannot change preparation. */}}
    }
   }catch{diagnostic('native-effects-incomplete',{created:revealAnimations.length,preparations:preparations.length,completions:completions.length},epoch);/* The remaining startup budget remains the failure terminal. */}
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
  diagnostic('raf-scheduled',{},epoch);
  revealFrame=win.requestAnimationFrame(()=>{
   diagnostic('raf-delivered',{},epoch);
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
  // A freshly reconstructed history document resumes reading rather than
  // replaying its decorative intro. This is native navigation provenance, not
  // a substitute acknowledgement for pending animation or source readiness.
  let freshHistory=false;
  if(!restored&&!sceneRoute)try{
   const entries=win.performance?.getEntriesByType?.('navigation');
   freshHistory=Array.isArray(entries)&&entries.length===1&&entries[0]?.entryType==='navigation'&&entries[0]?.type==='back_forward';
  }catch{/* Unsupported/malformed timing retains the ordinary native reveal. */}
  resource?.release();resource=null;previewResource=null;documentResult=null;pendingScene=null;sceneId=null;
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
  // A bounded visual hint never transfers readiness or a rendering resource.
  if(adopted&&sceneRoute&&handoff.presentation==='bending-active')presentation('bending-active');
  const current=active.id,epoch=diagnosticEpoch;
  diagnostic('arrival',{restored,freshHistory,startedAt},epoch);
  if(disposed||terminal.has(active.phase))return;
  if(!sceneRoute){
   guardContent();startupExpiresAt=startedAt+deadline;diagnostic('startup-budget',{startedAt,expiresAt:startupExpiresAt},epoch);
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
  const documentResource=acquireReadiness(doc,{setTimeout:setTimer,clearTimeout:clearTimer,deadline:sceneRoute?deadline:Math.ceil(Math.max(0,startupExpiresAt-monotonic()))});
  if(diagnosticEvents)documentResource.promise.then(result=>diagnostic('document-promise-observed',readinessFacts(result),epoch),()=>diagnostic('document-promise-observed',{status:'rejected'},epoch));
  if(sceneRoute)resource=documentResource;
  else{
   // Marked card preparation starts independently of loader entry. Actual first
   // draw or an explicit static fallback must settle before reveal can start.
   const previews=diagnosticEvents?acquirePreviews(doc,{onReport:report=>diagnostic('preview-report',report,epoch)}):acquirePreviews(doc);previewResource=previews;
   resource={promise:Promise.all([documentResource.promise,previews.promise]).then(([document,preview])=>Object.freeze({
    ready:document.ready&&preview.ready,failures:Object.freeze([...document.failures,...preview.failures]),
    pending:Object.freeze([...document.pending,...preview.pending]),previews:preview.previews,
   })),release(){documentResource.release();previews.release();}};
  }
  resource.promise.then(result=>{
   if(diagnosticEvents)diagnostic('combined-result-observed',readinessFacts(result),epoch);
   if(disposed||current!==active?.id||terminal.has(active.phase))return;
   documentResult=result;notify();
   if(sceneRoute){for(const fact of pendingScene??[])applyScene(fact);pendingScene=null;}
   else if(!result.ready)fail(result.failures.join(','));
   else reveal({immediate:restored||freshHistory,staticReason:freshHistory?'history-static':''});
  });
 };
 const navigate=(url,visual=null)=>{
  request('navigation',url);
  if(disposed||active?.kind!=='navigation'||active.phase!=='requested')return;
  // Native navigation still owns activation. While its outgoing cover is up,
  // protect the same content targets as arrival; every terminal restores them.
  guardContent();
  if(visual){presentation(visual);notify();}
  resource?.release();resource=null;
  const tracked=storageWrite(SITE_HANDOFF_KEY,{id:active.id,url,startedAt:now(),...(visual?{presentation:visual}:{}),history:history.filter(fact=>fact.id===active.id)});
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
  const visual=anchor.hasAttribute('data-home-research-link')&&current.pathname==='/'&&destination.pathname===BENDING_ROUTE?'bending-active':null;
  navigate(destination.href,visual);
  const id=active.id;
  // Later bubble listeners may still cancel the native activation.
  Promise.resolve().then(()=>{if(event.defaultPrevented&&active?.id===id){cancel('activation-prevented');}});
 };
 const dispose=()=>{
  if(disposed)return;if(!handedOff)cancel('disconnected');disposed=true;clearDeadlines();resource?.release();resource=null;previewResource=null;releaseScene?.();releaseScene=null;
  restoreContent();presentation(null);attr(element,'hidden','');releaseReveal();attr(element,'data-site-connected',null);attr(doc.documentElement,'data-site-entry-state',null);events.dispose();
 };
 return{
  start(){
   if(connected||disposed)throw Error('Site navigation already connected');connected=true;
   attr(element,'data-site-connected','');
   events.listen(scope,doc,'click',click);
   events.listen(scope,win,'popstate',()=>{if(active?.kind==='navigation')cancel('history-navigation');});
   events.listen(scope,element,'animationend',event=>{if(revealMode==='css'&&event.target===element&&active?.kind==='arrival'&&active.phase==='revealing')completeReveal();});
   events.listen(scope,win,'pagehide',event=>{
    clearDeadlines();resource?.release();resource=null;restoreContent();
    if(active?.kind==='navigation'&&!terminal.has(active.phase)&&active.tracked)handedOff=true;
    else cancel(active?.kind==='navigation'?'untracked-handoff':'page-hidden');
    releaseReveal();
    // Keep the serialized destination-owned ticket; only this document's
    // registries close. A persisted/bare synthetic signal remains resumable.
    if(event.persisted===false)dispose();
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
   arrival();if(sceneRoute)releaseScene=subscribeScene(sceneFact);
   return dispose;
  },
  onReadiness(listener){return events.on(scope,'readiness',listener);},
  inspect:snapshot,
  dispose,
 };
}
