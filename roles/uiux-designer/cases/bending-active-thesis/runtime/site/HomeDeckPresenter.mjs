import {createVelocitySkin,advanceVelocitySkin,sampleVelocitySkin} from '../motion/velocity-skin.mjs';
import {getWindowMotionRecipe,sampleWindowOutline} from '../motion/window-motion-api.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/** Native scroll events choose the active card. Each instance receives its own
 * enter/leave event; the existing site clock only interpolates the shared pose.
 * No wheel interception, observer, timer or independent frame loop is needed. */
export function createHomeDeckPresenter({root,window:win,publisher,listen}){
 const deck=root.querySelector('[data-home-deck]');
 if(!deck)return null;
 const cards=[...deck.querySelectorAll('[data-deck-card]')],counter=deck.querySelector('[data-deck-count]');
 const contact=root.querySelector('[data-portfolio-contact]');
 let top=0,height=1,viewport=1,previousY=win.scrollY,position=0,target=0,index=-1,snap=null,disposed=false,transitions=0;
 const field=createVelocitySkin(win.scrollY),recipe=getWindowMotionRecipe('ink'),sizes=[];
 let paintDirty=true,lastPosition=NaN,lastStrength=NaN,lastSurge=NaN;
 const subscriptions=[];
 const emit=(card,type,detail)=>card.dispatchEvent(new win.CustomEvent(type,{bubbles:true,detail}));
 for(const card of cards){
  publisher.attribute(card,'inert','');publisher.attribute(card,'aria-hidden','true');
  for(const [type,active] of [['portfolio:card-enter',true],['portfolio:card-leave',false]]){
   subscriptions.push(listen(card,type,event=>{
    if(disposed||event.target!==card)return;
    publisher.attribute(card,'data-deck-active',active?'':null);
    publisher.attribute(card,'inert',active?null:'');
    publisher.attribute(card,'aria-hidden',active?null:'true');
   }));
  }
 }
 function input({docY,ready=true,suspended=false,resumed=false}){
  if(disposed||!ready||suspended||!cards.length)return;
  const end=top+height-viewport,from=previousY,direction=Math.sign(docY-from);previousY=docY;
  if(snap!==null&&(Math.abs(docY-snap)<2||direction&&direction*Math.sign(snap-docY)<0))snap=null;
  // Only the two section joins snap, using the same threshold in both directions.
  // Keyboard focus and history restoration preserve the browser's native position.
  if(snap===null&&direction&&!resumed&&!(root.contains(root.ownerDocument.activeElement)&&root.ownerDocument.activeElement?.matches?.(':focus-visible'))){
   let destination=null;
   if(direction>0&&from<=top-viewport*.5&&docY>top-viewport*.5&&docY<top-2)destination=top;
   if(direction<0&&from>=top-viewport*.5&&docY<top-viewport*.5&&docY>2)destination=0;
   if(direction>0&&from<=end+viewport*.5&&docY>end+viewport*.5&&docY<end+viewport-2)destination=end+viewport;
   if(direction<0&&from>=end+viewport*.5&&docY>end+2&&docY<end+viewport*.5)destination=end;
   if(destination!==null){snap=destination;win.scrollTo({top:destination,behavior:'smooth'});}
  }
  target=clamp((docY-top)/Math.max(1,height-viewport),0,1)*(cards.length-1);
  if(resumed)position=target;
  const nearest=Math.round(target);
  if(nearest!==index){
   const previous=index,transferFocus=cards[previous]?.contains(root.ownerDocument.activeElement);
   index=nearest;transitions++;
   const detail={index,previous,direction,cause:resumed?'restore':'scroll',project:cards[index].getAttribute('data-deck-card')};
   if(previous>=0)emit(cards[previous],'portfolio:card-leave',detail);
   emit(cards[index],'portfolio:card-enter',detail);
   if(transferFocus)cards[index].querySelector('a[href]')?.focus({preventScroll:true});
   publisher.text(counter,String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0'));
  }
  publisher.attribute(contact,'data-home-contact-visible',docY>=end+viewport*.5?'':null);
 }
 publisher.attribute(deck,'data-deck-ready','');
 return{
  measure({naturalY,viewportHeight}){
   const nextViewport=Math.max(1,viewportHeight),nextTop=naturalY(deck),nextHeight=deck.offsetHeight;
   const changed=viewport!==nextViewport||top!==nextTop||height!==nextHeight;
   viewport=nextViewport;top=nextTop;height=nextHeight;
   for(let i=0;i<cards.length;i++){
    const size={width:cards[i].offsetWidth||1,height:cards[i].offsetHeight||1,radius:Number.parseFloat(win.getComputedStyle?.(cards[i]).borderTopLeftRadius)||24};
    if(!sizes[i]||Object.keys(size).some(key=>sizes[i][key]!==size[key]))paintDirty=true;
    sizes[i]=size;
   }
   // Counter text and canvas replacement also invalidate shared layout. They
   // must not turn an in-flight reveal into a seek when geometry is unchanged.
   if(changed||index<0)input({docY:win.scrollY,resumed:true});
  },
  input,
  publish({docY,dt,ready,suspended,resumed}){
   if(disposed||!ready||suspended)return false;
   if(resumed)input({docY,resumed:true});
   const focused=cards[index]?.contains(root.ownerDocument.activeElement);
   advanceVelocitySkin(field,{docY,dt,viewportHeight:viewport,immediate:resumed||focused||docY<top-viewport||docY>top+height});
   position+=(target-position)*(-Math.expm1(-Math.max(0,dt)/.09));
   if(Math.abs(target-position)<.0001)position=target;
   if(!paintDirty&&position===lastPosition&&field.strength===lastStrength&&field.surge===lastSurge)return false;
   paintDirty=false;lastPosition=position;lastStrength=field.strength;lastSurge=field.surge;
   for(let i=0;i<cards.length;i++){
    const card=cards[i],d=i-position,spread=clamp(d,-3,3),distance=Math.abs(d);
    const size=sizes[i]??{width:1,height:1,radius:24},fluid=sampleVelocitySkin(field,size.width,size.height,size.radius,{horizontal:clamp(d*.4,-1,1)});
    // A compact overlapping hand. Percentages follow each square's own size,
    // keeping the same density across phone, desktop and zoomed layouts.
    publisher.style(card,'--deck-x',spread*26+'%');
    publisher.style(card,'--deck-y',distance*2.4+'%');
    publisher.style(card,'--deck-z',-distance*64+'px');
    publisher.style(card,'--deck-yaw',-spread*9+fluid.pose.ry+'deg');
    publisher.style(card,'--deck-pitch',fluid.pose.rx+'deg');
    publisher.style(card,'--deck-shear',fluid.pose.skew+'deg');
    publisher.style(card,'--deck-sx',String(fluid.pose.sx));publisher.style(card,'--deck-sy',String(fluid.pose.sy));
    publisher.style(card,'--deck-flow',String(Math.abs(fluid.flow)));
    publisher.style(card,'--deck-rim',sampleWindowOutline(recipe,fluid.pose,size.width,size.height));
    publisher.style(card,'--deck-roll',spread*4.5+'deg');
    publisher.style(card,'--deck-scale',String(Math.max(.78,1-distance*.045)));
    publisher.style(card,'opacity',String(clamp(1-(distance-1.4)/1.2,0,1)));
    publisher.style(card,'z-index',String(20-Math.round(distance*3)));
   }
   return Math.abs(target-position)>.0001||!field.resting;
  },
  inspect:()=>({top,height,viewport,position,target,index,count:cards.length,snap,transitions,field:{strength:field.strength,acceleration:field.acceleration,surge:field.surge,resting:field.resting},disposed}),
  dispose(){disposed=true;for(const subscription of subscriptions)subscription.dispose();publisher.attribute(deck,'data-deck-ready',null);for(const card of cards){publisher.attribute(card,'inert',null);publisher.attribute(card,'aria-hidden',null);publisher.attribute(card,'data-deck-active',null);}},
 };
}
