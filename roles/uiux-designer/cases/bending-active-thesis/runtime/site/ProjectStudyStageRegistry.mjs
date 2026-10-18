const documents=new WeakMap();
const registryFor=document=>{
 let registry=documents.get(document);
 if(!registry){registry={current:null,listeners:new Set()};documents.set(document,registry);}
 return registry;
};
/** A discrete document registration, never a render clock. Either React effect
 * may connect first; releasing an old owner cannot remove its replacement. */
export function registerProjectStudyStage(document,descriptor){
 const registry=registryFor(document),entry={...descriptor};
 if(registry.current)throw Error('A document already owns a project study stage');
 registry.current=entry;
 for(const listener of [...registry.listeners])if(registry.listeners.has(listener))listener(entry);
 let released=false;
 return()=>{
  if(released)return;released=true;
  if(registry.current!==entry)return;registry.current=null;
  for(const listener of [...registry.listeners])if(registry.listeners.has(listener))listener(null);
 };
}
export function observeProjectStudyStage(document,listener){
 const registry=registryFor(document);registry.listeners.add(listener);listener(registry.current);
 return()=>registry.listeners.delete(listener);
}
