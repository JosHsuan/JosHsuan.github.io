import {INSPECTION_DEFAULTS,setInspectionTarget} from '../../components/inspection-state.mjs';

const SOURCE_LABELS=['Origami representation','Opening representation','Bending-active representation','Authored curvature colors'];
export const MODEL_STUDIES=[
 {id:'form',title:'From folds to form.',labels:SOURCE_LABELS},
 {id:'system',title:'Read the source.',labels:SOURCE_LABELS},
 {id:'pattern',title:'Compare the experiments.',labels:['Experiment A','Experiment B','Experiment C']},
];

/** Feature behavior is independent of React and receives a read-only scene hit port. */
export function createModelManager({input,inspection,hitTest}){
 const surfaces=new Map();let press=null,pinned=false;
 const publish=patch=>input.updateInteraction(patch);
 const bindSurface=(id,element)=>{if(element)surfaces.set(id,element);else surfaces.delete(id);};
 const clearHover=()=>{
  surfaces.forEach(element=>{if(element)delete element.dataset.modelHit;});
  publish({modelHover:{x:0,y:0,strength:0,chapterId:null}});
 };
 const returnView=(clearSelection=false)=>{
  pinned=false;
  setInspectionTarget(inspection,{azimuth:INSPECTION_DEFAULTS.azimuth,elevation:INSPECTION_DEFAULTS.elevation});
  publish({modelEngaged:false,modelRecovering:!inspection.settled,...(clearSelection?{sourceSelection:null}:{})});
 };
 const cancelPress=()=>{
  const current=press;press=null;
  if(current?.surface.hasPointerCapture(current.id))current.surface.releasePointerCapture(current.id);
  surfaces.forEach(element=>{if(element)delete element.dataset.modelDragging;});
  returnView();
 };
 function hit(event,chapterId,ready){
  if(!ready)return false;
  const result=hitTest(event.clientX,event.clientY);
  return !!result&&result.source===true&&(!result.chapterId||result.chapterId===chapterId);
 }
 function choose(study,surface,ready){
  if(!ready)return;
  const state=input.get(),selection=state.sourceSelection,presented=Number(surface.dataset.sourceIndex);
  const previous=Number.isInteger(presented)&&presented>=0&&presented<study.labels.length?presented:selection?.chapterId===study.id?selection.index:-1;
  const index=(previous+1)%study.labels.length;
  pinned=false;setInspectionTarget(inspection,{azimuth:INSPECTION_DEFAULTS.azimuth,elevation:INSPECTION_DEFAULTS.elevation});
  const result=input.commands.execute('model.select',{chapterId:study.id,index,selectedAt:state.playback?.activeSeconds??0,modelRecovering:!inspection.settled});
  if(result.status==='rejected')return;
  input.publishFrame({inspectionRevision:(input.get().inspectionRevision??0)+1});
  // The scene publishes source information after its successful paint. A
  // requested selection must not rename geometry that is still on screen.
  const parent=surface.closest('[data-model-study]');
  const announcement=parent?.querySelector('[data-source-announcement]');
  if(announcement)announcement.textContent=`${study.labels[index]}. Comparison requested. Escape returns to the chapter.`;
 }
 function begin(event,study,surface=event.currentTarget,ready=false){
  if(!ready||event.button!==0||event.isPrimary===false||press||!hit(event,study.id,ready))return;
  press={id:event.pointerId,surface,study,x:event.clientX,y:event.clientY,at:event.timeStamp,moved:false,touch:event.pointerType==='touch',azimuth:inspection.value.azimuth,elevation:inspection.value.elevation};
  if(event.pointerType==='touch')return;
  surface.setPointerCapture(event.pointerId);surface.dataset.modelDragging='true';
  publish({modelEngaged:true,modelRecovering:false,modelInteractionChapter:study.id});
 }
 function move(event,ready){
  const current=press;if(!current||current.id!==event.pointerId)return;
  if(!ready){cancelPress();return;}
  const dx=event.clientX-current.x,dy=event.clientY-current.y;
  current.moved||=Math.hypot(dx,dy)>(current.touch?10:4);
  if(current.touch||!current.moved)return;
  setInspectionTarget(inspection,{azimuth:current.azimuth+dx*.23,elevation:current.elevation-dy*.18});
  publish({modelEngaged:true,modelRecovering:false,modelInteractionChapter:current.study.id});
 }
 function end(event,cancelled=false,ready=false){
  const current=press;if(!current||current.id!==event.pointerId)return;
  press=null;
  if(current.surface.hasPointerCapture(current.id))current.surface.releasePointerCapture(current.id);
  delete current.surface.dataset.modelDragging;returnView();
  if(!cancelled&&!current.moved&&event.timeStamp-current.at<650)choose(current.study,current.surface,ready);
 }
 function key(event,study,ready){
  if(!ready)return;
  const patch={ArrowLeft:{azimuth:inspection.target.azimuth-7},ArrowRight:{azimuth:inspection.target.azimuth+7},ArrowUp:{elevation:inspection.target.elevation+5},ArrowDown:{elevation:inspection.target.elevation-5}}[event.key];
  if(patch){
   event.preventDefault();pinned=true;setInspectionTarget(inspection,patch);
   publish({modelEngaged:true,modelRecovering:false,modelInteractionChapter:study.id});
  }else if(event.key==='Enter'||event.key===' '){
   event.preventDefault();if(!event.repeat)choose(study,event.currentTarget,ready);
  }else if(event.key==='Escape'||event.key==='Home'){
   event.preventDefault();cancelPress();returnView(true);clearHover();
   const announcement=event.currentTarget.closest('[data-model-study]')?.querySelector('[data-source-announcement]');
   if(announcement)announcement.textContent='Returned to the chapter view.';
  }
 }
 function connectLifecycle({window:windowTarget,document:documentTarget}){
  const scope=input.events.createScope('model-lifecycle'),cancel=()=>{cancelPress();clearHover();};
  input.events.listen(scope,windowTarget,'blur',cancel);
  input.events.listen(scope,windowTarget,'pagehide',cancel);
  input.events.listen(scope,documentTarget,'visibilitychange',()=>{if(documentTarget.hidden)cancel();});
  input.events.listen(scope,documentTarget,'freeze',cancel);
  return()=>{scope.dispose();cancel();};
 }
 function connectPointer(documentTarget,hosts,ready){
  const scope=input.events.createScope('model-pointer');
  input.events.listen(scope,documentTarget,'pointerdown',event=>{
   if(event.target.closest?.('button,a,select,input,summary,[data-protect],[data-feedback-plane]'))return;
   const result=hitTest(event.clientX,event.clientY),study=hosts.find(value=>value.id===result?.chapterId),surface=surfaces.get(study?.id);
   if(study&&surface)begin(event,study,surface,ready);
  });
  input.events.listen(scope,documentTarget,'pointermove',event=>move(event,ready));
  input.events.listen(scope,documentTarget,'pointerup',event=>end(event,false,ready));
  input.events.listen(scope,documentTarget,'pointercancel',event=>end(event,true,ready));
  return()=>scope.dispose();
 }
 return{
  bindSurface,clearHover,cancelPress,begin,move,end,key,choose,connectLifecycle,connectPointer,
  unavailable(){cancelPress();clearHover();},
  lostCapture(event){if(press?.id===event.pointerId)cancelPress();},
  leave(){if(!press)clearHover();},
  blur(){if(pinned){pinned=false;if(!press)returnView();}clearHover();},
  inspect(){return{pointerId:press?.id??null,pinned,surfaces:surfaces.size};},
 };
}
