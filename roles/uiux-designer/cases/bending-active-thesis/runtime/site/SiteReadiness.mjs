/** One bounded DOM/font/marked-image check per document. This service has no
 * rendering loop, scene import, image allocation or below-fold preload. */
const documents=new WeakMap();
export const SITE_READINESS_DEADLINE_MS=15000;

export function acquireSiteReadiness(document,{setTimeout:setTimer=globalThis.setTimeout,clearTimeout:clearTimer=globalThis.clearTimeout,deadline=SITE_READINESS_DEADLINE_MS}={}){
 let task=documents.get(document);
 if(!task){
  let resolve,settled=false,timer=null,references=0;
  const promise=new Promise(done=>{resolve=done;}),cleanups=new Set(),failures=[];
  const pending=new Set(['document','fonts','images']);
  const cleanup=()=>{for(const release of cleanups)release();cleanups.clear();if(timer!==null)clearTimer(timer);timer=null;};
  const finish=reason=>{
   if(settled)return;settled=true;if(reason)failures.push(reason);cleanup();
   resolve(Object.freeze({ready:failures.length===0,failures:Object.freeze([...new Set(failures)]),pending:Object.freeze([...pending])}));
  };
  const complete=(key,failure)=>{if(settled)return;if(failure)failures.push(failure);pending.delete(key);if(!pending.size)finish();};
  const listen=(target,type,callback)=>{target.addEventListener(type,callback);const release=()=>target.removeEventListener(type,callback);cleanups.add(release);return release;};
  const images=()=>{
   if(settled)return;
   const marked=[...document.querySelectorAll('img[data-site-critical], [data-site-critical] img')];
   Promise.all([...new Set(marked)].map(image=>new Promise(done=>{
    let doneOnce=false,releaseLoad=()=>{},releaseError=()=>{};
    const finishImage=failed=>{
     if(doneOnce||settled)return;doneOnce=true;releaseLoad();releaseError();
     if(failed){failures.push('critical-image-unavailable');done();return;}
     // decode() checks the selected srcset resource; it does not create a copy.
     if(typeof image.decode==='function')Promise.resolve().then(()=>image.decode()).then(done,()=>{if(!settled)failures.push('critical-image-decode');done();});
     else done();
    };
    releaseLoad=listen(image,'load',()=>finishImage(!image.naturalWidth));releaseError=listen(image,'error',()=>finishImage(true));
    if(image.complete)finishImage(!image.naturalWidth);
   }))).then(()=>complete('images'));
  };
  const domReady=()=>{complete('document');images();};
  if(document.readyState==='loading'){
   const release=listen(document,'DOMContentLoaded',()=>{release();domReady();});
  }else domReady();
  Promise.resolve(document.fonts?.ready).then(()=>{
   if(settled)return;
   // Native FontFaceSet.ready fulfills even after a requested font fails.
   // Inspect settled faces; unused `unloaded` faces do not start new requests.
   const faces=typeof document.fonts?.[Symbol.iterator]==='function'?document.fonts:[];
   complete('fonts',[...faces].some(face=>face.status==='error')?'fonts-unavailable':undefined);
  },()=>complete('fonts','fonts-unavailable'));
  timer=setTimer(()=>finish('readiness-timeout'),deadline);
  task={promise,retain(){references++;},release(){if(--references<=0&&!settled){finish('readiness-cancelled');documents.delete(document);}}};
  documents.set(document,task);
 }
 task.retain();let released=false;
 return{promise:task.promise,release(){if(released)return;released=true;task.release();}};
}
