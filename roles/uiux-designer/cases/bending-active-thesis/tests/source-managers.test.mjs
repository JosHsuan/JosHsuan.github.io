import test from 'node:test';
import assert from 'node:assert/strict';
import {createStoryInput} from '../components/story-input.js';
import {createDiagramManager} from '../runtime/features/DiagramManager.mjs';
import {createEvidenceManager} from '../runtime/features/EvidenceManager.mjs';

const source={version:1,kind:'workflow',paths:[],groups:[
 {id:'first',label:'First',description:'First source',representation:0},
 {id:'second',label:'Second',description:'Second source',representation:2},
]};
function diagram(){
 const input=createStoryInput(),caption={textContent:''},live={textContent:''},requests=[],accepted=[];
 const nodes=[0,1].map(index=>({tagName:'BUTTON',dataset:{diagramIndex:String(index)},setAttribute(name,value){this[name]=value;}}));
 const root={dataset:{sourcePresented:'false',autonomousIndex:'1'},querySelectorAll:()=>nodes,querySelector:selector=>selector==='[data-diagram-caption]'?caption:live};
 const manager=createDiagramManager({kind:'workflow',input,getRoot:()=>root,onData:value=>accepted.push(value),requestLayout:()=>requests.push('layout'),requestRepresentation:value=>requests.push(value)});
 const load=options=>manager.load({signal:new AbortController().signal,fetcher:async()=>({ok:true,json:async()=>source}),...options});
 return {input,manager,root,nodes,caption,live,requests,accepted,load};
}

test('diagram pinning, source presentation and scene absence have distinct ownership',async()=>{
 const f=diagram();assert(await f.load());const target=new EventTarget();let update,disconnected=false;
 const disconnect=f.manager.connect({target,observerFactory:callback=>{update=callback;return{observe(){},disconnect(){disconnected=true;}};}});
 assert.equal(f.root.dataset.diagramSelection,'second');
 f.manager.activate(0);assert.equal(f.root.dataset.diagramSelection,'first');assert.deepEqual(f.requests.at(-1),{chapterId:'system',index:0});
 update();assert.equal(f.root.dataset.diagramSelection,'first');
 f.manager.follow();assert.equal(f.root.dataset.diagramSelection,'second');
 f.root.dataset.sourcePresented='true';
 target.dispatchEvent(new CustomEvent('thesis:representation-presented',{detail:{chapterId:'system',index:2,pinned:false}}));
 assert.equal(f.manager.inspect().presented,1);assert.equal(f.nodes[1]['aria-pressed'],'true');
 f.root.dataset.sourcePresented='false';f.root.dataset.autonomousIndex='0';update();
 assert.equal(f.root.dataset.diagramSelection,'first');
 disconnect();assert(disconnected);assert.equal(f.input.events.inspect().nativeListeners,0);
 target.dispatchEvent(new CustomEvent('thesis:representation-presented',{detail:{chapterId:'system',index:2}}));
 assert.equal(f.root.dataset.diagramSelection,'first');
});

test('superseded, aborted and invalid diagram responses cannot replace the live source',async()=>{
 const f=diagram();let resolve;
 const stale=f.load({fetcher:()=>new Promise(done=>{resolve=done;})});
 assert(await f.load());resolve({ok:true,json:async()=>({...source,groups:[]})});
 assert.equal(await stale,false);assert.equal(f.accepted.length,1);
 const abort=new AbortController();abort.abort();assert.equal(await f.load({signal:abort.signal}),false);
 assert.equal(await f.load({fetcher:async()=>({ok:true,json:async()=>({...source,version:2})})}),false);
 assert.equal(f.accepted.length,1);
});

test('the event-revealed library loads source data without legacy selection observers or subscriptions',async()=>{
 const input=createStoryInput(),root={},layouts=[];
 const manager=createDiagramManager({kind:'library',input,getRoot:()=>root,onData(){},requestLayout:()=>layouts.push('loaded')});
 assert(await manager.load({signal:new AbortController().signal,fetcher:async()=>({ok:true,json:async()=>({...source,kind:'library'})})}));
 const before=input.events.inspect();
 const disconnect=manager.connect({target:new EventTarget(),observerFactory:()=>{throw Error('Library must not observe autonomous selection');}});
 assert.deepEqual(layouts,['loaded']);assert.deepEqual(input.events.inspect(),before);
 disconnect();assert.deepEqual(input.events.inspect(),before);
});

test('evidence selection keeps modified native links, synchronous disclosure and focus return',()=>{
 const input=createStoryInput(),changes=[],documentTarget=new EventTarget();let currentLink;
 const link=index=>({dataset:{inspectFigure:String(index)},attributes:new Map(),focused:false,
  setAttribute(name,value){this.attributes.set(name,value);},focus(){this.focused=true;}});
 const first=link(0),second=link(1);documentTarget.closest=()=>currentLink;
 const manager=createEvidenceManager({events:input.events,onChange:value=>changes.push(value)});
 const disconnect=manager.connect(documentTarget,[{},{}]);
 const click=(value,modified=false)=>{currentLink=value;const event=new Event('click',{cancelable:true});Object.defineProperties(event,{button:{value:0},ctrlKey:{value:modified}});documentTarget.dispatchEvent(event);return event;};
 assert.equal(click(first,true).defaultPrevented,false);assert.deepEqual(changes,[]);
 assert(click(first).defaultPrevented);assert.equal(first.attributes.get('aria-expanded'),'true');
 click(second);assert.equal(first.attributes.get('aria-expanded'),'false');assert.equal(manager.inspect().selected,1);
 manager.close();assert(second.focused);assert.equal(second.attributes.get('aria-expanded'),'false');assert.equal(manager.inspect().selected,null);
 click(first);click(first);assert.equal(manager.inspect().selected,null);
 disconnect();const count=changes.length;click(second);assert.equal(changes.length,count);assert.equal(input.events.inspect().nativeListeners,0);
});
