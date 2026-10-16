/** Page-required preview preparation has no clock. SSR markers declare the
 * participants before React effects run; their actual renderer or an explicit
 * static policy reports the terminal. SiteNavigation owns the startup bound. */
const documents=new WeakMap();
const registryFor=document=>{
 let registry=documents.get(document);
 if(!registry){registry={entries:new Map(),listeners:new Set()};documents.set(document,registry);}
 return registry;
};
const entryFor=(registry,element)=>{
 let entry=registry.entries.get(element);
 if(!entry){entry={owner:null,result:null,onFallback:null,fallbackReason:null};registry.entries.set(element,entry);}
 return entry;
};

export function registerPagePreviewReadiness(document,element,{onFallback}={}){
 if(!document||!element)throw TypeError('A page preview requires its document and element');
 if(onFallback!==undefined&&typeof onFallback!=='function')throw TypeError('A preview fallback handler must be a function');
 const registry=registryFor(document),entry=entryFor(registry,element),owner={};let released=false;
 entry.owner=owner;entry.onFallback=onFallback??null;
 // A component that mounts after the global preparation bound cannot silently
 // enhance an already uncovered static page. Its owner receives that latch.
 if(entry.fallbackReason!==null)entry.onFallback?.(entry.fallbackReason);
 return{
  report({mode,reason=''}={}){
   if(released||entry.owner!==owner||entry.result)return false;
   if(!['model','static'].includes(mode)||typeof reason!=='string')throw TypeError('Preview readiness requires a model or explicit static terminal');
   if(entry.fallbackReason!==null&&mode==='model')return false;
   entry.result=Object.freeze({mode,reason});
   for(const listener of [...registry.listeners])if(registry.listeners.has(listener))listener();
   return true;
  },
  release(){if(released)return;released=true;if(entry.owner===owner){entry.owner=null;entry.onFallback=null;}},
 };
}

export function acquirePagePreviewReadiness(document){
 const registry=registryFor(document);
 // Discovery happens synchronously, before any awaited font/image readiness.
 // Missing component effects remain pending rather than becoming fake success.
 const participants=[...new Set(document.querySelectorAll('[data-site-preview-required]'))].map(element=>entryFor(registry,element));
 let resolve,settled=false;
 const promise=new Promise(done=>{resolve=done;});
 const inspect=()=>Object.freeze({ready:participants.every(entry=>entry.result),failures:Object.freeze([]),
  pending:Object.freeze(participants.flatMap((entry,index)=>entry.result?[]:[`preview-${index+1}`])),
  previews:Object.freeze(participants.map(entry=>entry.result??Object.freeze({mode:'pending',reason:entry.fallbackReason??''})))});
 const finish=result=>{if(settled)return;settled=true;registry.listeners.delete(check);resolve(result);};
 const check=()=>{const result=inspect();if(result.ready)finish(result);};
 registry.listeners.add(check);check();
 return{promise,inspect,fallback(reason){
  if(typeof reason!=='string'||!reason)throw TypeError('A fallback needs its terminal reason');
  for(const entry of participants){
   if(entry.result||entry.fallbackReason!==null)continue;
   entry.fallbackReason=reason;
   try{entry.onFallback?.(reason);}catch{/* Failed cleanup cannot fabricate preparation success. */}
  }
 },release(){if(settled)return;const result=inspect();finish(Object.freeze({...result,ready:false,failures:Object.freeze(['preview-readiness-cancelled'])}));}};
}
