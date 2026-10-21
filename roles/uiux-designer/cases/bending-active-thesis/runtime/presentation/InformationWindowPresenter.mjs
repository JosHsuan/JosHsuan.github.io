import {
  getWindowMotionRecipe, createWindowMotion, setWindowScrollTarget,
  advanceWindowMotion, scrollingEffect, sampleScrollingPose, sampleWindowOutline,
} from '../motion/window-motion-api.mjs';

import {createVelocitySkin,advanceVelocitySkin,sampleVelocitySkin} from '../motion/velocity-skin.mjs';

const MARKER='[data-information-window]';
const POINTS=['tl','tr','br','bl','et','er','eb','el'];
const VARIABLES=['background','border-width','border-color','radius','shadow','x','y','rz','rx','ry','skew','perspective','skin-path'];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const number=value=>Number.parseFloat(value)||0;
const targetAt=(top,height,docY,viewport)=>clamp((docY+viewport/2-top-height/2)*2/(viewport+height),-1,1);

function material(style){
  const widths=[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth];
  const outline=widths.every(value=>number(value)===0)&&style.outlineStyle!=='none'&&number(style.outlineWidth)>0;
  return {
    background:style.background,
    borderWidth:outline?style.outlineWidth:widths.join(' '),
    borderColor:outline?style.outlineColor:[style.borderTopColor,style.borderRightColor,style.borderBottomColor,style.borderLeftColor].join(' '),
    shadow:style.boxShadow,
  };
}

function presentationPose(item){
  if(item.velocitySkin)return sampleVelocitySkin(item.velocitySkin,item.width,item.height,item.radius);
  const pose=sampleScrollingPose(item.effect,item.state);
  pose.x=clamp(pose.x,-12,12);pose.y=clamp(pose.y,-12,12);pose.rz=clamp(pose.rz,-1.5,1.5);pose.radius=item.radius;
  // Preserve relative follower positions with one common geometric gain.
  // Paint overscan is fixed; content dimensions never participate in motion.
  const maximum=Math.max(...POINTS.map(key=>Math.hypot(pose[key+'x'],pose[key+'y'])));
  const limit=Math.min(16,Math.min(item.width,item.height)*.08),gain=maximum>0?Math.min(1,limit/maximum):1;
  for(const key of POINTS){pose[key+'x']*=gain;pose[key+'y']*=gain;}
  return {pose,edgeMaximum:maximum*gain};
}

/**
 * Fluid page edge response for explicit, outermost information windows. React owns
 * every skin. The director owns measurement invalidation and active elapsed time;
 * this presenter creates no DOM, observer, native listener, timer or frame loop.
 */
export function createInformationWindowPresenter({publisher,root=globalThis.document,profile='ink'}){
  const document=root.ownerDocument??root;
  const recipe=getWindowMotionRecipe('ink');
  const registry=new Map(),materials=new WeakMap(),nested=new Set();
  let viewportHeight=1,disposed=false,ticks=0,moving=false,outlineSamples=0;
  const velocityProfile=profile==='velocity-skin';
  function outline(item,pose){outlineSamples++;return sampleWindowOutline(recipe,pose,item.width,item.height);}

  function release(element){
    publisher.attribute(element,'data-information-ready',null);
    publisher.attribute(element,'data-information-moving',null);
    for(const key of VARIABLES)publisher.style(element,'--information-'+key,'');
  }

  function measure({naturalY,viewportHeight:height,docY=0}){
    if(disposed)return;
    viewportHeight=Math.max(1,Number(height)||1);
    // Collect every layout/style read before publishing any mutation. Existing
    // material is cached because the activated parent intentionally paints clear.
    const rows=[],nextNested=new Set();
    for(const element of root.querySelectorAll(MARKER)){
      if(element.parentElement?.closest(MARKER)){nextNested.add(element);continue;}
      if(!element.querySelector(':scope > [data-information-skin]'))continue;
      if(element.tagName==='DETAILS'&&!element.open)continue;
      const width=element.clientWidth,windowHeight=element.clientHeight;
      if(!(width>0&&windowHeight>0))continue;
      const style=document.defaultView.getComputedStyle(element);
      const kind=element.getAttribute('data-information-window');
      const fixed=kind==='model-label';
      const top=fixed?0:naturalY(element);
      const chapter=fixed?element.closest('[data-model-study]')?.dataset.studyChapter:null;
      const surface=materials.get(element)??material(style);
      materials.set(element,surface);
      rows.push({element,width,height:windowHeight,top,kind,fixed,chapter,surface,radius:number(style.borderTopLeftRadius)});
    }
    const retained=new Set(rows.map(row=>row.element));
    for(const [element] of registry)if(!retained.has(element)){release(element);registry.delete(element);}
    for(const element of nested)if(!nextNested.has(element))publisher.attribute(element,'data-information-nested',null);
    nested.clear();
    for(const element of nextNested){nested.add(element);publisher.attribute(element,'data-information-nested','');}
    for(const row of rows){
      let item=registry.get(row.element);
      const effect=scrollingEffect(recipe,viewportHeight);
      if(!item){
        const state=createWindowMotion(effect,{region:'inside'});
        setWindowScrollTarget(state,row.fixed?0:targetAt(row.top,row.height,docY,viewportHeight),{reduced:true});
        item={state,active:false,visible:false,pose:{x:0,y:0,rz:0},effect,velocitySkin:velocityProfile?createVelocitySkin(docY):null};
        registry.set(row.element,item);
      }else{
        item.state.axis=[...effect.axis];item.state.path={key:effect.key,axis:item.state.axis};
      }
      Object.assign(item,row,{effect});
      publisher.style(row.element,'--information-background',row.surface.background);
      publisher.style(row.element,'--information-border-width',row.surface.borderWidth);
      publisher.style(row.element,'--information-border-color',row.surface.borderColor);
      publisher.style(row.element,'--information-shadow',row.surface.shadow);
      publisher.style(row.element,'--information-radius',row.radius+'px');
      // Re-sample the current material state at the new dimensions; a layout
      // invalidation neither replays nor briefly erases an active deformation.
      publisher.style(row.element,'--information-skin-path',outline(item,presentationPose(item).pose));
      publisher.attribute(row.element,'data-information-ready','');
      item.dirty=true;
    }
  }

  function publish({docY,dt,reduced=false,seek=false,resumed=false,canvasPlacement=null}){
    if(disposed)return false;
    ticks++;moving=false;
    const activeElement=document.activeElement;
    const elapsed=Number(dt)||0;
    const gap=elapsed>1;
    const seconds=gap?0:Math.max(0,elapsed);
    for(const item of registry.values()){
      const {element,state}=item;
      const focused=activeElement&&(element===activeElement||element.contains(activeElement));
      const active=item.fixed?!!canvasPlacement?.visible&&canvasPlacement.chapter===item.chapter:true;
      const visible=item.fixed?active:item.top+item.height>docY-64&&item.top<docY+viewportHeight+64;
      const target=item.fixed?clamp((Number(canvasPlacement?.y)||0)/viewportHeight,-.4,.4):targetAt(item.top,item.height,docY,viewportHeight);
      const immediate=reduced||seek||resumed||gap||focused||!visible;
      // A newly active fixed label has no native document displacement. Give it
      // the same finite fluid catch-up on the director clock, then follow placement.
      if(item.fixed&&active&&!item.active&&!immediate)setWindowScrollTarget(state,target-.16,{reduced:true});
      const energy=immediate?0:clamp(Math.abs(target-state.target)*2,0,.3);
      setWindowScrollTarget(state,target,{energy,reduced:!!immediate||velocityProfile});
      if(item.velocitySkin)advanceVelocitySkin(item.velocitySkin,{docY,dt:seconds,viewportHeight,immediate});
      else advanceWindowMotion(state,seconds,{reduced:!!immediate});
      item.active=active;item.visible=visible;
      const resting=item.velocitySkin?item.velocitySkin.resting:state.resting;
      const isMoving=visible&&!resting;
      // Ambient 3D may keep the Director ticking. A settled unchanged skin must
      // not regenerate Bezier strings on each of those frames. Measurement
      // invalidation marks it dirty; the first neutral frame is still published.
      const neutral=item.pose.x===0&&item.pose.y===0&&item.pose.rz===0&&item.pose.edgeMaximum===0;
      if(resting&&neutral&&!item.dirty&&item.publishedMoving===isMoving){moving ||= isMoving;continue;}
      const {pose,edgeMaximum,perspective}=presentationPose(item);
      publisher.style(element,'--information-x',pose.x.toFixed(3)+'px');
      publisher.style(element,'--information-y',pose.y.toFixed(3)+'px');
      publisher.style(element,'--information-rz',pose.rz.toFixed(3)+'deg');
      if(item.velocitySkin){
        for(const key of ['rx','ry','skew'])publisher.style(element,'--information-'+key,pose[key].toFixed(3)+'deg');
        publisher.style(element,'--information-perspective',perspective.toFixed(1)+'px');
      }
      publisher.style(element,'--information-skin-path',outline(item,pose));
      publisher.attribute(element,'data-information-moving',String(isMoving));item.publishedMoving=isMoving;
      item.pose={x:pose.x,y:pose.y,rz:pose.rz,rx:pose.rx,ry:pose.ry,skew:pose.skew,edgeMaximum};item.dirty=false;
      moving ||= isMoving;
    }
    return moving;
  }

  function inspect(){
    return {recipe:recipe.key,profile,outlineSamples,count:registry.size,nested:nested.size,ticks,moving,settled:!moving,items:[...registry.values()].map(item=>({
      kind:item.kind,chapter:item.chapter,fixed:item.fixed,visible:item.visible,width:item.width,height:item.height,top:item.top,
      progress:item.state.progress,target:item.state.target,velocity:item.state.velocity,resting:item.velocitySkin?item.velocitySkin.resting:item.state.resting,settled:item.velocitySkin?item.velocitySkin.resting:item.state.resting,skinStrength:item.velocitySkin?.strength??0,...item.pose,
    }))};
  }

  function dispose(){
    if(disposed)return;
    disposed=true;moving=false;
    for(const element of registry.keys())release(element);
    for(const element of nested)publisher.attribute(element,'data-information-nested',null);
    registry.clear();nested.clear();
  }

  return {measure,publish,inspect,dispose};
}
