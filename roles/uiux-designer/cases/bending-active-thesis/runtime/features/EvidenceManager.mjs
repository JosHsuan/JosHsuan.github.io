/** Selection and synchronous focus behavior; React renders the selected source. */
export function createEvidenceManager({events,onChange}){
 let selected=null,trigger=null;
 const clear=returnFocus=>{
  const previous=trigger,changed=selected!==null;selected=null;trigger=null;
  previous?.setAttribute('aria-expanded','false');
  if(changed&&returnFocus)previous?.focus();
  if(changed)onChange(null);
 };
 const close=()=>clear(true);
 function connect(documentTarget,items){
  const scope=events.createScope('evidence');
  events.listen(scope,documentTarget,'click',event=>{
   const link=event.target.closest?.('a[data-inspect-figure]');
   if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const index=Number(link.dataset.inspectFigure);if(!Number.isInteger(index)||!items[index])return;
   event.preventDefault();
   if(selected===index){clear(false);return;}
   trigger?.setAttribute('aria-expanded','false');trigger=link;
   link.setAttribute('aria-expanded','true');selected=index;onChange(index);
  });
  let active=true;
  return()=>{if(!active)return;active=false;scope.dispose();clear(false);};
 }
 return{connect,close,inspect:()=>({selected})};
}
