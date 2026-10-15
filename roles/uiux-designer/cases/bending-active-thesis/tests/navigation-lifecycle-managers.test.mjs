import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadingManager} from '../runtime/features/ReadingManager.mjs';
import {createLifecycleManager} from '../runtime/features/LifecycleManager.mjs';
import {createReadingPlan} from '../components/story-response.mjs';
import {createStoryInput} from '../components/story-input.js';
import {SCENE_RECOVERY_KEY} from '../components/scene-recovery.mjs';

function navigation({hash=''}={}){
 let state={next:true},seeks=0,pointer=false,focused=null;
 const nodes=new Map(['overview','form','system'].map((id,index)=>[id,{id,y:index*800,offsetHeight:200,focus(options){this.focused=options;}}]));
 const win={scrollX:0,scrollY:0,innerWidth:1000,innerHeight:600,location:{href:'http://local/'+hash,hash},getComputedStyle:()=>({scrollMarginTop:'20px'}),
  scrollTo({top,left}){if(top!==undefined)this.scrollY=top;if(left!==undefined)this.scrollX=left;}};
 const setURL=url=>{if(url?.startsWith('#')){win.location.hash=url;win.location.href='http://local/'+url;}};
 win.history={scrollRestoration:'auto',get state(){return state;},replaceState(value,_title,url){state=value;setURL(url);},pushState(value,_title,url){state=value;setURL(url);}};
 const doc={documentElement:{scrollHeight:3000},getElementById:id=>nodes.get(id)},root={contains:node=>[...nodes.values()].includes(node)};
 const manager=createReadingManager({window:win,document:doc,root,naturalY:node=>node.y,seek:()=>seeks++,onKeyboard:()=>{pointer=false;},onFocus:event=>{focused=event.target;},isPointerFocus:()=>pointer,now:()=>100});
 manager.start();
 return {manager,win,doc,nodes,getSeeks:()=>seeks,getFocused:()=>focused,setPointer:value=>{pointer=value;}};
}

test('native anchors preserve state metadata, exact history positions and focus',()=>{
 const f=navigation(),original=f.win.history.state;let prevented=false;
 f.manager.anchor({target:{closest:()=>({getAttribute:()=> '#form'})},button:0,preventDefault(){prevented=true;}});
 assert(prevented);assert.equal(f.win.scrollY,780);assert.deepEqual(f.nodes.get('form').focused,{preventScroll:true});assert.equal(f.win.history.state.next,true);
 f.manager.scroll();f.win.location.href='http://local/';f.win.location.hash='';
 f.manager.pop({state:original});assert.equal(f.win.scrollY,0);assert(f.getSeeks()>=2);
 assert.equal(f.manager.scroll(),true);assert.equal(f.manager.scroll(),false);
 f.manager.dispose();assert.equal(f.win.history.scrollRestoration,'auto');
});

test('keyboard seeks, pointer focus and reading response retain separate meanings',()=>{
 const f=navigation();let prevented=0;
 f.manager.key({key:'PageDown',target:{closest:()=>null},preventDefault(){prevented++;}});
 assert.equal(f.win.scrollY,510);assert.equal(prevented,1);
 f.win.scrollY=0;f.setPointer(true);f.manager.focus({target:f.nodes.get('form')});assert.equal(f.win.scrollY,0);
 f.setPointer(false);f.manager.focus({target:f.nodes.get('form')});assert.equal(f.win.scrollY,440);assert.equal(f.getFocused(),f.nodes.get('form'));
 f.manager.setPlan(createReadingPlan({anchors:Array.from({length:8},(_,index)=>index*800),viewportHeight:600,maxScroll:5000,stops:[]}));
 const first=f.manager.advance(500,1/60,{resumed:true});assert.equal(first.nativeDocY,500);assert.equal(first.visualDocY,500);
 const moving=f.manager.advance(900,.05,{});assert.equal(moving.nativeDocY,900);assert.equal(moving.visualDocY,900);assert.equal(moving.readingShiftY,0);
 const resumed=f.manager.advance(1300,2,{resumed:true});assert.equal(resumed.visualDocY,1300);f.manager.dispose();
});

test('an explicit project anchor waits for inert to release and then restores focus without scrolling twice',()=>{
 const f=navigation(),target=f.nodes.get('form');let inert=true,focuses=0;
 target.closest=()=>inert?{}:null;
 target.focus=options=>{focuses++;target.focused=options;f.manager.focus({target});};
 f.manager.anchor({target:{closest:()=>({getAttribute:()=> '#form'})},button:0,preventDefault(){}});
 assert.equal(f.win.scrollY,780);assert.equal(focuses,0);
 inert=false;f.manager.completeInitialNavigation();
 assert.equal(focuses,1);assert.deepEqual(target.focused,{preventScroll:true});assert.equal(f.win.scrollY,780,'entry completion keeps the native anchor destination');
 f.manager.completeInitialNavigation();assert.equal(focuses,1);f.manager.dispose();
});

test('an already usable anchor focuses its destination without reapplying keyboard-tab safe insets',()=>{
 const f=navigation(),target=f.nodes.get('form');let focuses=0;
 target.closest=()=>null;target.focus=options=>{focuses++;target.focused=options;f.manager.focus({target});};
 f.manager.anchor({target:{closest:()=>({getAttribute:()=> '#form'})},button:0,preventDefault(){}});
 assert.equal(focuses,1);assert.deepEqual(target.focused,{preventScroll:true});assert.equal(f.win.scrollY,780);
 f.manager.dispose();
});

test('Back or subsequent manual reading cancels the pending project focus while readiness finishes',()=>{
 for(const action of ['back','manual','focus']){
  const f=navigation(),original=f.win.history.state,target=f.nodes.get('form');let inert=true,focuses=0;
  target.closest=()=>inert?{}:null;target.focus=()=>focuses++;
  f.manager.anchor({target:{closest:()=>({getAttribute:()=> '#form'})},button:0,preventDefault(){}});
  if(action==='back'){
   f.win.location.hash='';f.win.location.href='http://local/';f.manager.pop({state:original});assert.equal(f.win.scrollY,0);
  }else if(action==='manual')f.manager.directInput();
  else f.manager.focus({target:f.nodes.get('overview')});
  inert=false;f.manager.completeInitialNavigation();assert.equal(focuses,0,action+' retains the visitor\'s newer intent');f.manager.dispose();
 }
});

test('entry completes the initial fragment intent without replaying it on later layout invalidation',()=>{
 const f=navigation({hash:'#form'}),measure=()=>{if(f.manager.initialHash)f.manager.hash();};
 measure();assert.equal(f.win.scrollY,780);assert.equal(f.manager.initialHash,true);
 f.nodes.get('form').y=1000;measure();assert.equal(f.win.scrollY,980,'startup font/layout changes still align the requested chapter');
 f.manager.completeInitialNavigation();f.manager.completeInitialNavigation();
 f.win.scrollTo({top:1250});measure();
 assert.equal(f.manager.initialHash,false);assert.equal(f.win.scrollY,1250,'reading after entry is not locked to the original fragment');
 f.manager.dispose();
});

test('native hash changes supersede startup intent and stale hash delivery cannot restore an older history entry',()=>{
 const f=navigation({hash:'#form'});
 f.win.location.hash='#system';f.win.location.href='http://local/#system';
 f.manager.hash({newURL:f.win.location.href});
 assert.equal(f.manager.initialHash,false);assert.equal(f.win.scrollY,1580);
 f.manager.pop({state:{thesisReadingId:'older',thesisReadingPosition:{x:0,y:100}}});
 f.win.location.hash='#form';f.win.location.href='http://local/#form';
 f.win.scrollTo({top:780});
 f.manager.hash({newURL:'http://local/#system'});
 assert.equal(f.win.scrollY,780,'queued old hash cannot overwrite newer native navigation');
 f.manager.hash({newURL:f.win.location.href});assert.equal(f.win.scrollY,780);
 f.manager.dispose();
});

test('the native null-state popstate then hashchange sequence navigates to its fragment rather than restoring zero',()=>{
 const f=navigation({hash:'#form'});f.manager.hash();f.manager.scroll();f.manager.completeInitialNavigation();
 f.win.location.hash='#system';f.win.location.href='http://local/#system';
 f.manager.pop({state:null});f.manager.hash({newURL:f.win.location.href});
 assert.equal(f.win.scrollY,1580);assert.equal(f.manager.initialHash,false);
 assert.match(f.win.history.state.thesisReadingId,/^reading-/);
 const system=f.win.history.state;f.win.scrollY=1740;f.manager.scroll();
 f.win.location.hash='#form';f.win.location.href='http://local/#form';
 f.manager.pop({state:{thesisReadingId:'saved-form',thesisReadingPosition:{x:0,y:925}}});
 f.manager.hash({newURL:f.win.location.href});assert.equal(f.win.scrollY,925,'known history restores its exact position instead of the fragment anchor');
 f.win.location.hash='#system';f.win.location.href='http://local/#system';
 f.manager.pop({state:system});f.manager.hash({newURL:f.win.location.href});
 assert.equal(f.win.scrollY,1740,'the native fragment entry becomes a normal restorable reading entry');
 f.manager.dispose();
});

test('unknown external or empty-fragment state clears old restoration intent and preserves native position',()=>{
 const f=navigation({hash:'#form'});
 f.win.location.hash='#system';f.win.location.href='http://local/#system';
 f.manager.pop({state:{thesisReadingId:'older',thesisReadingPosition:{x:0,y:100}}});
 for(const hash of ['', '#missing', '#%malformed']){
  f.win.location.hash=hash;f.win.location.href='http://local/'+hash;f.win.scrollY=942;
  f.manager.pop({state:{external:'preserved'}});f.manager.hash({newURL:f.win.location.href});
  assert.equal(f.win.scrollY,942);assert.equal(f.win.history.state.external,'preserved');
 }
 f.win.location.hash='#form';f.win.location.href='http://local/#form';
 f.manager.pop({state:null});f.manager.hash({newURL:f.win.location.href});assert.equal(f.win.scrollY,780);
 f.manager.dispose();
});

test('same-fragment history traversal has no pending hash lock and keeps recording subsequent native reading positions',()=>{
 const f=navigation({hash:'#form'});f.manager.hash();f.manager.scroll();const original=f.win.history.state;
 f.manager.anchor({target:{closest:()=>({getAttribute:()=> '#form'})},button:0,preventDefault(){}});
 const second=f.win.history.state;f.win.scrollY=950;f.manager.scroll();
 f.manager.pop({state:original});assert.equal(f.win.scrollY,780);
 f.win.scrollY=825;f.manager.scroll();
 f.manager.pop({state:second});assert.equal(f.win.scrollY,950);
 f.manager.pop({state:original});assert.equal(f.win.scrollY,825);
 f.manager.dispose();
});

function lifecycle({reduced=false,saveData=false,storageAvailable=true,previous=null}={}){
 const input=createStoryInput(),media=new EventTarget();media.matches=reduced;
 const records=new Map(previous?[[SCENE_RECOVERY_KEY,JSON.stringify(previous)]]:[]),storage={getItem:key=>records.get(key),setItem:(key,value)=>records.set(key,value)};
 const win=new EventTarget();win.matchMedia=()=>media;
 const flags=new Map(),doc={documentElement:{toggleAttribute:(key,value)=>flags.set(key,value)}},updates=[];
 const manager=createLifecycleManager({events:input.events,onSystemReduced:value=>updates.push(['reduced',value]),onHydrated:value=>updates.push(['hydrated',value]),onAutomaticEnable:()=>updates.push(['enable'])});
 const disconnect=manager.initialize({window:win,document:doc,navigator:{connection:{saveData}},readStorage:()=>{if(!storageAvailable)throw Error('storage blocked');return storage;}});
 return {input,manager,media,win,records,updates,disconnect,flags};
}

test('activation respects Reduced, Save Data and known failure while storage remains optional',()=>{
 for(const options of [{},{storageAvailable:false},{reduced:true},{saveData:true},{previous:{status:'failed',at:Date.now()}}]){
  const f=lifecycle(options),automatic=!options.reduced&&!options.saveData&&!options.previous;
  assert.equal(f.updates.some(value=>value[0]==='enable'),automatic);
  f.media.matches=true;f.media.dispatchEvent(new Event('change'));assert.deepEqual(f.updates.at(-1),['reduced',true]);
  f.disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
 }
});

test('confirmed scene failure cannot be erased by page lifecycle lease callbacks',()=>{
 const f=lifecycle(),disconnect=f.manager.connectLease(f.win,{enabled:true,failed:false});
 assert.equal(JSON.parse(f.records.get(SCENE_RECOVERY_KEY)).status,'active');
 f.manager.fail();f.win.dispatchEvent(new Event('pagehide'));f.win.dispatchEvent(new Event('pageshow'));f.manager.heartbeat();
 assert.equal(JSON.parse(f.records.get(SCENE_RECOVERY_KEY)).status,'failed');
 disconnect();f.disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
});

test('normal page-cache restoration renews the existing active lease',()=>{
 const f=lifecycle(),disconnect=f.manager.connectLease(f.win,{enabled:true,failed:false});
 f.win.dispatchEvent(new Event('pagehide'));assert.equal(JSON.parse(f.records.get(SCENE_RECOVERY_KEY)).status,'ended');
 f.win.dispatchEvent(new Event('pageshow'));assert.equal(JSON.parse(f.records.get(SCENE_RECOVERY_KEY)).status,'active');
 disconnect();f.disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
});
