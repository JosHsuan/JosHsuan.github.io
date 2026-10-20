/** Native document destruction is permanent; BFCache and the existing bare
 * synthetic suspension signals retain the runtime. Registrar owns this scope
 * and releases every feature connection before disposing the kernel. */
export function connectRuntimeDocumentLifetime({input,window:win}){
 const scope=input.events.createScope('document-lifetime');
 input.events.listen(scope,win,'pagehide',event=>{if(event.persisted===false)input.dispose();});
 return()=>scope.dispose();
}
