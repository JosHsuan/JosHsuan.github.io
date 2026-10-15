import {createReadingState,advanceReading,sampleReadingScore} from '../../components/story-response.mjs';

/** Native navigation/history and reading response; no scene or camera writes. */
export function createReadingManager({window:win,document:doc,root,naturalY,seek,onKeyboard,onFocus,isPointerFocus,now=()=>Date.now()}){
 const reading=createReadingState(win.scrollY),positions=new Map();let plan=null,initialHash=!!win.location.hash;
 let historyNavigation=null,seekOnScroll=false,sequence=0,activeEntry=null,historyPosition=null,previousRestoration,lastHash=win.location.hash,pendingFocus=null,completingFocus=false;
 const remember=()=>positions.set(activeEntry,{x:win.scrollX,y:win.scrollY});
 const restore=()=>{if(historyPosition)win.scrollTo({left:historyPosition.x,top:historyPosition.y,behavior:'instant'});seek();};
 const focusDestination=target=>{
  // An explicit anchor has already placed the document. Its native focusin
  // must not apply the ordinary keyboard-tab safe-inset adjustment again.
  completingFocus=true;try{target.focus({preventScroll:true});}finally{completingFocus=false;}
 };
 function start(){
  previousRestoration=win.history.scrollRestoration;win.history.scrollRestoration='manual';
  activeEntry=win.history.state?.thesisReadingId??`reading-${now()}-0`;
  win.history.replaceState({...win.history.state,thesisReadingId:activeEntry},'',win.location.href);remember();
 }
 function hash(event){
  // The startup fragment is a temporary layout intent, not a permanent scroll
  // lock. A new native navigation supersedes it even when its target is absent.
  if(event)initialHash=false;
  if(event?.newURL&&event.newURL!==win.location.href)return;
  lastHash=win.location.hash;
  if(event?.newURL===historyNavigation){restore();historyNavigation=null;return;}
  if(event)historyNavigation=null;
  let id;try{id=decodeURIComponent(win.location.hash.slice(1));}catch{return;}
  if(pendingFocus?.id!==id)pendingFocus=null;
  const target=doc.getElementById(id);
  if(target&&root.contains(target)){
   win.scrollTo({top:Math.max(0,naturalY(target)-parseFloat(win.getComputedStyle(target).scrollMarginTop||0)),behavior:'instant'});seek();
  }
 }
 function push(id){
  remember();win.history.replaceState({...win.history.state,thesisReadingId:activeEntry,thesisReadingPosition:positions.get(activeEntry)},'',win.location.href);
  activeEntry=`reading-${now()}-${++sequence}`;win.history.pushState({...win.history.state,thesisReadingId:activeEntry,thesisReadingPosition:null},'',id);remember();
 }
 function anchor(event){
  const link=event.target.closest?.('a[href^="#"]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const id=link.getAttribute('href'),target=doc.getElementById(id.slice(1));if(!target)return;
  event.preventDefault();initialHash=false;historyNavigation=null;push(id);hash();
  // A Home link can enter the project before its readiness gate releases
  // inert. Keep that explicit destination until entry publishes usable DOM.
  pendingFocus=target.closest?.('[inert]')?target:null;
  if(!pendingFocus)focusDestination(target);
 }
 function key(event){
  onKeyboard();initialHash=false;
  if(event.defaultPrevented||event.target.closest('input,select,textarea,[contenteditable=true]'))return;
  if(['PageDown','PageUp','Home','End'].includes(event.key)&&!event.altKey&&!event.metaKey){
   event.preventDefault();const max=Math.max(0,doc.documentElement.scrollHeight-win.innerHeight);
   const top={Home:0,End:max,PageDown:Math.min(max,win.scrollY+win.innerHeight*.85),PageUp:Math.max(0,win.scrollY-win.innerHeight*.85)}[event.key];
   win.scrollTo({top,behavior:'instant'});seekOnScroll=true;seek();
  }else if(event.key==='Tab'){seekOnScroll=true;seek();}
 }
 function focus(event){
  onFocus(event);
  if(completingFocus)return;
  if(pendingFocus!==event.target)pendingFocus=null;
  if(root.contains(event.target)&&!isPointerFocus()){
   seekOnScroll=false;
   const top=naturalY(event.target),bottom=top+event.target.offsetHeight,safeBottom=win.innerHeight-(win.innerWidth<=780?90:40);
   let y=win.scrollY;if(top<y+110)y=top-110;else if(bottom>y+safeBottom)y=Math.min(top-110,bottom-safeBottom);
   if(y!==win.scrollY)win.scrollTo({top:Math.max(0,y),behavior:'instant'});seek();
  }
 }
 function pop(event){
  initialHash=false;seekOnScroll=true;pendingFocus=null;
  const id=event.state?.thesisReadingId,position=positions.get(id)??event.state?.thesisReadingPosition,changed=lastHash!==win.location.hash;
  lastHash=win.location.hash;historyNavigation=null;historyPosition=null;
  if(typeof id==='string'&&id&&position&&Number.isFinite(position.x)&&Number.isFinite(position.y)){
   activeEntry=id;historyPosition=position;historyNavigation=changed?win.location.href:null;restore();return;
  }
  // Native fragment navigation also dispatches popstate, with no reading id.
  // It is a new destination, not an unknown history entry to restore at zero.
  activeEntry=`reading-${now()}-${++sequence}`;
  win.history.replaceState({...event.state,thesisReadingId:activeEntry,thesisReadingPosition:null},'',win.location.href);
  hash();remember();seek();
 }
 return{reading,start,hash,anchor,key,focus,pop,
  get initialHash(){return initialHash;},
  completeInitialNavigation(){
   initialHash=false;const target=pendingFocus;pendingFocus=null;
   if(!target||!root.contains(target)||win.location.hash!=='#'+target.id||target.closest?.('[inert]'))return;
   // The native anchor already chose the scroll position. Restoring its focus
   // after readiness must not apply a second safe-inset scroll adjustment.
   focusDestination(target);
  },
  setPlan(value){plan=value;},
  advance(y,dt,options){advanceReading(reading,y,dt,{plan,...options,nativeScroll:true});return sampleReadingScore(reading,plan);},
  scroll(){if(!historyNavigation)remember();const value=seekOnScroll;seekOnScroll=false;return value;},
  directInput(){initialHash=false;historyNavigation=null;seekOnScroll=false;pendingFocus=null;},
  pointerInput(){initialHash=false;pendingFocus=null;},
  dispose(){win.history.scrollRestoration=previousRestoration;positions.clear();pendingFocus=null;},
 };
}
