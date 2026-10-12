/** Selection and synchronous focus behavior; React renders the selected source. */
export function createEvidenceManager({events,onChange}){
 let selected=null,trigger=null;
 const close=()=>{
  const previous=trigger;selected=null;onChange(null);
  previous?.setAttribute('aria-expanded','false');previous?.focus();
 };
 function connect(documentTarget,items){
  const scope=events.createScope('evidence');
  events.listen(scope,documentTarget,'click',event=>{
   const link=event.target.closest?.('a[data-inspect-figure]');
   if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const index=Number(link.dataset.inspectFigure);if(!Number.isInteger(index)||!items[index])return;
   event.preventDefault();trigger?.setAttribute('aria-expanded','false');trigger=link;
   if(selected===index){selected=null;onChange(null);return;}
   link.setAttribute('aria-expanded','true');selected=index;onChange(index);
  });
  return()=>scope.dispose();
 }
 return{connect,close,inspect:()=>({selected})};
}
