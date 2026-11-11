/** One discrete stage per document. Observer delivery never owns a clock.
 * Failed registration rolls back delivered setup; stale delivery cannot undo a
 * replacement installed synchronously by a release observer. */
export function createDocumentStageRegistry(label){
 const documents=new WeakMap();
 const registryFor=document=>{
  let registry=documents.get(document);
  if(!registry){registry={current:null,revision:0,listeners:new Set()};documents.set(document,registry);}
  return registry;
 };
 const deliver=(registry,value)=>{
  const revision=registry.revision,errors=[];
  for(const subscription of [...registry.listeners]){
   if(registry.revision!==revision)break;
   if(!registry.listeners.has(subscription))continue;
   try{subscription.listener(value);}catch(error){errors.push(error);}
  }
  return errors;
 };
 const raise=(errors,message)=>{
  if(errors.length===1)throw errors[0];
  if(errors.length)throw new AggregateError(errors,message,{cause:errors[0]});
 };
 return{
  register(document,descriptor){
   const registry=registryFor(document),entry={...descriptor};
   if(registry.current)throw Error(`A document already owns a ${label}`);
   registry.current=entry;registry.revision++;
   const errors=deliver(registry,entry);
   if(errors.length){
    if(registry.current===entry){registry.current=null;registry.revision++;errors.push(...deliver(registry,null));}
    raise(errors,`${label} registration and rollback failed`);
   }
   let released=false;
   return()=>{
    if(released)return;released=true;
    if(registry.current!==entry)return;
    registry.current=null;registry.revision++;
    raise(deliver(registry,null),`${label} release failed`);
   };
  },
  observe(document,listener){
   const registry=registryFor(document),subscription={listener};
   registry.listeners.add(subscription);
   try{listener(registry.current);}catch(error){registry.listeners.delete(subscription);throw error;}
   return()=>registry.listeners.delete(subscription);
  },
 };
}
