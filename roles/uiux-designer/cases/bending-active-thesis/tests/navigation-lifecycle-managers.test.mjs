import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadingManager} from '../runtime/features/ReadingManager.mjs';
import {createLifecycleManager} from '../runtime/features/LifecycleManager.mjs';
import {createReadingPlan} from '../components/story-response.mjs';
import {createStoryInput} from '../components/story-input.js';
import {SCENE_RECOVERY_KEY} from '../components/scene-recovery.mjs';

function navigation(){
 let state={next:true},seeks=0,pointer=false,focused=null;
 const nodes=new Map(['overview','form','system'].map((id,index)=>[id,{id,y:index*800,offsetHeight:200,focus(options){this.focused=options;}}]));
 const win={scrollX:0,scrollY:0,innerWidth:1000,innerHeight:600,location:{href:'http://local/',hash:''},getComputedStyle:()=>({scrollMarginTop:'20px'}),
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
 const moving=f.manager.advance(900,.05,{});assert.equal(moving.nativeDocY,900);assert(moving.visualDocY>500&&moving.visualDocY<900);
 const resumed=f.manager.advance(1300,2,{resumed:true});assert.equal(resumed.visualDocY,1300);f.manager.dispose();
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
 f.manager.fail();f.win.dispatchEvent(new Event('pagehide'));
 assert.equal(JSON.parse(f.records.get(SCENE_RECOVERY_KEY)).status,'failed');
 disconnect();f.disconnect();assert.equal(f.input.events.inspect().nativeListeners,0);
});
