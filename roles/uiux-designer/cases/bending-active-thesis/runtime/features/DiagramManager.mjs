/** Source meaning and comparison state; the presentation director remains the clock. */
export function createDiagramManager({kind,input,getRoot,onData,requestLayout,requestRepresentation=detail=>{
 const request={...detail,selectedAt:input.get().playback?.activeSeconds??0},result=input.commands.execute('model.select',request);
 if(result.status==='accepted')input.publishFrame({inspectionRevision:(input.get().inspectionRevision??0)+1});
 const current=input.get().sourceSelection;
 return result.status==='accepted'&&current?.chapterId===request.chapterId&&current.index===request.index&&current.selectedAt===request.selectedAt?current:null;
}}){
 let data=null,pinned=null,hover=null,presented=0,generation=0,ownedSelection=null;
 function paint(index,announce=false){
  const root=getRoot();if(!root||!data?.groups.length)return;
  const selected=((Number(index)||0)%data.groups.length+data.groups.length)%data.groups.length;
  root.dataset.diagramSelection=data.groups[selected].id;
  root.querySelectorAll('[data-diagram-index]').forEach(element=>{
   const active=Number(element.dataset.diagramIndex)===selected;
   element.dataset.diagramActive=String(active);
   if(element.tagName==='BUTTON')element.setAttribute('aria-pressed',String(active));
  });
  const caption=root.querySelector('[data-diagram-caption]');if(caption)caption.textContent=data.groups[selected].description;
  if(announce){const live=root.querySelector('[data-diagram-announcement]');if(live)live.textContent=`${data.groups[selected].label}. ${data.groups[selected].description}`;}
 }
 function automaticIndex(){const root=getRoot();return kind==='workflow'&&root?.dataset.sourcePresented==='true'?presented:Number(root?.dataset.autonomousIndex??0);}
 const restore=()=>paint(pinned??hover??automaticIndex());
 function activate(index){
  pinned=index;paint(index,true);
  const group=data?.groups[index];
  if(kind==='workflow'&&Number.isInteger(group?.representation)){
   const requested=requestRepresentation({chapterId:'system',index:group.representation});
   ownedSelection=requested?.chapterId==='system'&&requested.index===group.representation?{...requested}:null;
  }
 }
 function follow(){
  pinned=null;hover=null;
  const current=input.get().sourceSelection,owned=ownedSelection;ownedSelection=null;
  // Follow/Escape closes this diagram's accepted comparison only. A newer
  // model/diagram request and independently held source keep their ownership.
  if(kind==='workflow'&&owned&&current?.chapterId===owned.chapterId&&current.index===owned.index&&current.selectedAt===owned.selectedAt)input.updateInteraction({sourceSelection:null});
  restore();
 }
 async function load({signal,fetcher=fetch}){
  const current=++generation;
  try{
   const response=await fetcher(`/assets/diagrams/${kind}.json`,{signal});
   if(!response.ok)throw Error('Diagram unavailable');
   const source=await response.json();
   if(source.version!==1||source.kind!==kind||!Array.isArray(source.groups)||!Array.isArray(source.paths))throw Error('Invalid diagram');
   if(signal.aborted||current!==generation)return false;
   data=source;pinned=null;hover=null;onData(source);return true;
  }catch{return false;}
 }
 function connect({target=window,observerFactory=callback=>new MutationObserver(callback)}={}){
  const root=getRoot();if(!data||!root)return()=>{};
  // The library has no selection lifecycle. Its original paths belong solely
  // to the director's event-triggered reveal presenter.
  if(kind==='library'){requestLayout();return()=>{};}
  const scope=input.events.createScope('diagram-'+kind);
  const update=()=>{if(pinned===null&&hover===null)paint(automaticIndex());};
  update();
  const observer=observerFactory(update);
  observer.observe(root,{attributes:true,attributeFilter:['data-autonomous-index','data-source-presented']});
  scope.add(()=>observer.disconnect());
  const followPresentation=detail=>{
   if(kind!=='workflow'||detail?.chapterId!=='system')return;
   const index=data.groups.findIndex(group=>group.representation===detail.index);if(index<0)return;
   presented=index;if(detail.pinned===false){pinned=null;hover=null;}
   if(root.dataset.sourcePresented==='true')paint(index);else update();
  };
  input.events.on(scope,'representationResolved',followPresentation);
  // Compatibility is limited to an incoming native boundary; normal features use typed facts.
  input.events.listen(scope,target,'thesis:representation-presented',event=>followPresentation(event.detail));
  requestLayout();let active=true;return()=>{if(!active)return;active=false;scope.dispose();follow();};
 }
 return{load,connect,paint,activate,restore,
  hover(index){hover=index;paint(index);},
  leave(){hover=null;restore();},
  follow,
  blur(event){if(!event.currentTarget.contains(event.relatedTarget)){hover=null;restore();}},
  key(event){if(event.key==='Escape'){event.preventDefault?.();follow();}},
  cancelLoad(){generation++;},
  inspect:()=>({pinned,hover,presented,loaded:!!data}),
 };
}
