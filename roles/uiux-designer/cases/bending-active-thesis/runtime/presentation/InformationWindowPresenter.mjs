import {
  getWindowMotionRecipe, createWindowMotion, setWindowScrollTarget,
  advanceWindowMotion, scrollingEffect, sampleScrollingPose, sampleWindowOutline,
} from '../motion/window-motion-api.mjs';

import {createVelocitySkin,advanceVelocitySkin} from '../motion/velocity-skin.mjs';
import {sampleGlassFeed} from '../motion/glass-motion.mjs';
import {createGlassFieldOptics} from './GlassFieldOptics.mjs';

const MARKER='[data-information-window]';
const POINTS=['tl','tr','br','bl','et','er','eb','el'];
const VARIABLES=['background','border-width','border-color','radius','shadow','x','y','rz','rx','ry','skew','sx','sy','flow','edge','perspective','skin-path'];
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
  if(item.velocitySkin)return sampleGlassFeed(item.velocitySkin,item.width,item.height,item.radius,{horizontal:item.horizontal,vertical:item.vertical,viewportHeight:item.viewportHeight,stream:item.stream,lane:item.lane,seconds:item.seconds??0,focused:item.focused});
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
export function createInformationWindowPresenter({publisher,root=globalThis.document,profile='velocity-skin'}){
  const document=root.ownerDocument??root;
  const recipe=getWindowMotionRecipe('ink');
  const registry=new Map(),materials=new WeakMap(),nested=new Set();
  const optics=createGlassFieldOptics({document,publisher});
  let viewportHeight=1,viewportWidth=1,activeSeconds=0,disposed=false,ticks=0,moving=false,outlineSamples=0;
  const velocityProfile=profile==='velocity-skin';
  function outline(item,pose){outlineSamples++;return sampleWindowOutline(recipe,pose,item.width,item.height);}

  function release(element){
    publisher.attribute(element,'data-information-ready',null);
    publisher.attribute(element,'data-information-moving',null);
    publisher.attribute(element,'data-information-plane',null);
    publisher.attribute(element,'data-glass-motion',null);
    publisher.attribute(element,'data-glass-optics',null);
    optics.release(registry.get(element)?.optics);
    for(const key of VARIABLES)publisher.style(element,'--information-'+key,'');
  }

  function measure({naturalY,viewportHeight:height,docY=0}){
    if(disposed)return;
    viewportHeight=Math.max(1,Number(height)||1);
    viewportWidth=document.defaultView?.innerWidth||1;
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
      const fixed=kind==='model-label'&&element.getAttribute('data-model-label-placement')!=='native';
      const plane=velocityProfile&&!fixed;
      // Read the native centre, independently of last frame's perspective.
      let left=0;for(let node=element;node;node=node.offsetParent)left+=node.offsetLeft??0;
      const horizontal=clamp((left+width/2-viewportWidth/2)/(viewportWidth/2),-1,1);
      const top=fixed?0:naturalY(element);
      const chapter=fixed?element.closest('[data-model-study]')?.dataset.studyChapter:null;
      const surface=materials.get(element)??material(style);
      materials.set(element,surface);
      const stream=plane&&kind==='home-project-card'&&viewportWidth>900;
      rows.push({element,width,height:windowHeight,left,top,kind,fixed,plane,chapter,surface,horizontal,vertical:0,stream,lane:Math.round(horizontal+1),radius:number(style.borderTopLeftRadius)});
    }
    const retained=new Set(rows.map(row=>row.element));
    for(const [element] of registry)if(!retained.has(element)){release(element);registry.delete(element);}
    for(const element of nested)if(!nextNested.has(element))publisher.attribute(element,'data-information-nested',null);
    nested.clear();
    for(const element of nextNested){nested.add(element);publisher.attribute(element,'data-information-nested','');}
    for(const row of rows){
      let item=registry.get(row.element);
      const effect=scrollingEffect(recipe,viewportHeight);
      // A portal can retain its exact DOM node while moving between native
      // flow and a fixed model annotation. Reclassification starts neutral;
      // no stale perspective variables or old material trajectory survive.
      if(item&&(!!item.velocitySkin!==row.plane||item.fixed!==row.fixed)){
        release(row.element);item=null;
      }
      if(!item){
        const state=createWindowMotion(effect,{region:'inside'});
        setWindowScrollTarget(state,row.fixed?0:targetAt(row.top,row.height,docY,viewportHeight),{reduced:true});
        item={state,active:false,visible:false,pose:{x:0,y:0,rz:0},effect,velocitySkin:row.plane?createVelocitySkin(docY):null};
        registry.set(row.element,item);
      }else{
        item.state.axis=[...effect.axis];item.state.path={key:effect.key,axis:item.state.axis};
      }
      Object.assign(item,row,{effect,viewportHeight});
      item.optics=row.plane?optics.measure(row.element,row.width,row.height):null;
      publisher.style(row.element,'--information-background',row.surface.background);
      publisher.style(row.element,'--information-border-width',row.surface.borderWidth);
      publisher.style(row.element,'--information-border-color',row.surface.borderColor);
      publisher.style(row.element,'--information-shadow',row.surface.shadow);
      publisher.style(row.element,'--information-radius',row.radius+'px');
      // Re-sample the current material state at the new dimensions; a layout
      // invalidation neither replays nor briefly erases an active deformation.
      publisher.style(row.element,'--information-skin-path',outline(item,presentationPose(item).pose));
      publisher.attribute(row.element,'data-information-ready','');
      publisher.attribute(row.element,'data-information-plane',row.plane?'':null);
      publisher.attribute(row.element,'data-glass-motion',row.plane?(row.stream?'stream':'feed'):null);
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
    if(!reduced&&!resumed&&!seek)activeSeconds+=Math.max(0,elapsed);
    for(const item of registry.values()){
      const {element,state}=item;
      // Pointer focus must not move a radio/button between native down and up.
      // Keyboard-visible focus gets the clear reading plane before activation.
      const focused=activeElement&&(element===activeElement||element.contains(activeElement))&&(activeElement.matches?.(':focus-visible')??true);
      const active=item.fixed?!!canvasPlacement?.visible&&canvasPlacement.chapter===item.chapter:true;
      const visible=item.fixed?active:item.top+item.height>docY-64&&item.top<docY+viewportHeight+64;
      const target=item.fixed?clamp((Number(canvasPlacement?.y)||0)/viewportHeight,-.4,.4):targetAt(item.top,item.height,docY,viewportHeight);
      const immediate=reduced||seek||resumed||focused||!visible||(gap&&!item.velocitySkin);
      // A newly active fixed label has no native document displacement. Give it
      // the same finite fluid catch-up on the director clock, then follow placement.
      if(item.fixed&&active&&!item.active&&!immediate)setWindowScrollTarget(state,target-.16,{reduced:true});
      const energy=immediate?0:clamp(Math.abs(target-state.target)*2,0,.3);
      setWindowScrollTarget(state,target,{energy,reduced:!!immediate||!!item.velocitySkin});
      // Visible slow frames still carry real native displacement. The bounded
      // exponential velocity response remains stable with elapsed time above
      // one second; a frame-rate threshold must not erase that input. Actual
      // lifecycle resume/seek and offscreen/focus policies still resynchronize.
      if(item.velocitySkin)advanceVelocitySkin(item.velocitySkin,{docY,dt:Math.max(0,elapsed),viewportHeight,immediate});
      else advanceWindowMotion(state,seconds,{reduced:!!immediate});
      item.active=active;item.visible=visible;item.focused=focused||reduced||!visible;item.seconds=activeSeconds;
      item.vertical=clamp((item.top+item.height/2-docY-viewportHeight/2)/(viewportHeight/2),-1.5,1.5);
      const resting=item.velocitySkin?item.velocitySkin.resting:state.resting;
      const streamMoving=item.stream&&visible&&!item.focused;
      const isMoving=visible&&(!resting||streamMoving);
      // Ambient 3D may keep the Director ticking. A settled unchanged skin must
      // not regenerate Bezier strings on each of those frames. Measurement
      // invalidation marks it dirty; the first neutral frame is still published.
      const streamStep=Math.floor(activeSeconds*24);
      if(resting&&!item.dirty&&item.lastDocY===docY&&item.lastFocus===item.focused&&item.publishedMoving===isMoving&&(!streamMoving||streamStep===item.streamStep)){moving ||= isMoving;continue;}
      const {pose,edgeMaximum,perspective,flow=0,edge=0,streamOffset=0}=presentationPose(item);
      publisher.style(element,'--information-x',pose.x.toFixed(3)+'px');
      publisher.style(element,'--information-y',pose.y.toFixed(3)+'px');
      publisher.style(element,'--information-rz',pose.rz.toFixed(3)+'deg');
      if(item.velocitySkin){
        for(const key of ['rx','ry','skew'])publisher.style(element,'--information-'+key,pose[key].toFixed(3)+'deg');
        publisher.style(element,'--information-perspective',perspective.toFixed(1)+'px');
        publisher.style(element,'--information-sx',pose.sx.toFixed(4));publisher.style(element,'--information-sy',pose.sy.toFixed(4));
        publisher.style(element,'--information-flow',Math.abs(flow).toFixed(4));
        publisher.style(element,'--information-edge',edge.toFixed(4));
        const relativeTop=item.top-docY+streamOffset,relativeBottom=relativeTop+item.height;
        const edgeVisible=relativeTop<viewportHeight*.25||relativeBottom>viewportHeight*.75;
        optics.publish(item.optics,{x:-item.left,y:-relativeTop,width:viewportWidth,height:viewportHeight,scale:Math.min(48,viewportHeight*.052)*(1+Math.abs(flow)*.15),enabled:visible&&!item.focused&&edgeVisible});
      }
      publisher.style(element,'--information-skin-path',outline(item,pose));
      publisher.attribute(element,'data-information-moving',String(isMoving));item.publishedMoving=isMoving;
      item.pose={x:pose.x,y:pose.y,rz:pose.rz,rx:pose.rx,ry:pose.ry,skew:pose.skew,edgeMaximum,edge,streamOffset};item.dirty=false;item.lastDocY=docY;item.lastFocus=item.focused;item.streamStep=streamStep;
      moving ||= isMoving;
    }
    return moving;
  }

  function inspect(){
    return {recipe:recipe.key,profile,design:'glass-feed-stream-v1',optics:optics.inspect(),outlineSamples,count:registry.size,nested:nested.size,ticks,moving,settled:!moving,items:[...registry.values()].map(item=>({
      kind:item.kind,chapter:item.chapter,fixed:item.fixed,plane:!!item.velocitySkin,visible:item.visible,width:item.width,height:item.height,top:item.top,
      motion:item.stream?'stream':'feed',lane:item.lane,progress:item.state.progress,target:item.state.target,velocity:item.state.velocity,resting:item.velocitySkin?item.velocitySkin.resting:item.state.resting,settled:item.velocitySkin?item.velocitySkin.resting:item.state.resting,skinStrength:item.velocitySkin?.strength??0,...item.pose,
    }))};
  }

  function dispose(){
    if(disposed)return;
    disposed=true;moving=false;
    for(const element of registry.keys())release(element);
    for(const element of nested)publisher.attribute(element,'data-information-nested',null);
    registry.clear();nested.clear();optics.dispose();
  }

  return {measure,publish,inspect,dispose};
}
