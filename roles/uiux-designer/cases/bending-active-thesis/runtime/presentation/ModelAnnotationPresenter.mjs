import {Vector3} from 'three';

// The one authoritative label may live in the native mobile reading flow.
// Its IDs and chapter identity remain the same across a responsive portal move.
export function modelInformationElement(study){
 const chapter=study?.dataset?.studyChapter;
 return (chapter&&study.ownerDocument?.querySelector(`[data-model-side-label][data-study-chapter="${chapter}"]`))||study?.querySelector('[data-model-side-label]')||null;
}

// The supplied camera is read-only. Points come from verified source support.
export function projectModelAnnotation(points,matrixWorld,camera,width,height){
 const point=new Vector3();let best=null;
 for(let index=0;index<points.length;index++){
  point.fromArray(points[index]).applyMatrix4(matrixWorld).project(camera);
  if(!Number.isFinite(point.x+point.y+point.z)||point.z<-1||point.z>1)continue;
  const x=(point.x+1)*width/2,y=(1-point.y)*height/2;
  if(x<0||x>width||y<0||y>height)continue;
  const score=point.x-Math.abs(point.y)*.18;
  if(!best||score>best.score)best={x,y,index,score};
 }
 return best;
}
export function publishModelAnnotation(study,{points,mesh,camera,width,height,present,canvasRect}){
 if(modelInformationElement(study)?.dataset?.modelLabelPlacement==='native')return placeModelAnnotation(study,{anchor:null});
 const same=mesh&&study.dataset.annotationSource===mesh.userData.representationId;
 const previous=same?Number(study.dataset.annotationSupport):NaN;
 const tracked=Number.isInteger(previous)&&points?.[previous];
 const anchor=present&&mesh&&points?.length?projectModelAnnotation(tracked?[tracked]:points,mesh.matrixWorld,camera,width,height):null;
 if(anchor){
  if(tracked)anchor.index=previous;
  study.dataset.annotationSource=mesh.userData.representationId;study.dataset.annotationSupport=String(anchor.index);
 }
 return placeModelAnnotation(study,{anchor,width,height,canvasRect});
}

// The anchor belongs to a successful scene paint. DOM-only passage/label motion
// remaps that same projection; it must never sample an unpainted camera or mesh.
export function placeModelAnnotation(study,{anchor,width,height,canvasRect}){
 const panel=modelInformationElement(study);
 const svg=study?.querySelector('[data-model-connector]');
 if(!svg)return null;
 if(panel?.dataset?.modelLabelPlacement==='native'){svg.dataset.annotationVisible='false';return null;}
 const label=panel?.querySelector?.('[data-model-annotation-label]')??study?.querySelector('[data-model-annotation-label]');
 const present=panel?.dataset?.modelLabelPlacement!=='native'&&!!anchor&&!!label&&!!canvasRect&&width>0&&height>0;
 svg.dataset.annotationVisible=String(present);
 if(!present)return null;
 const outer=study.getBoundingClientRect(),caption=label.getBoundingClientRect();
 const screen={x:canvasRect.left-outer.left+anchor.x*canvasRect.width/width,y:canvasRect.top-outer.top+anchor.y*canvasRect.height/height};
 if(screen.x<0||screen.x>width||screen.y<0||screen.y>height){svg.dataset.annotationVisible='false';return {...anchor,screen,visible:false};}
 const end={x:caption.left-outer.left-10,y:caption.top-outer.top+caption.height/2};
 const elbow=Math.max(screen.x+6,end.x-16);
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 svg.querySelector('[data-model-leader]').setAttribute('points',`${screen.x},${screen.y} ${elbow},${screen.y} ${end.x},${end.y}`);
 const dot=svg.querySelector('[data-model-anchor]');dot.setAttribute('cx',String(screen.x));dot.setAttribute('cy',String(screen.y));
 return {...anchor,screen,end,visible:true};
}
