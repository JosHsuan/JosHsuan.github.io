import test from 'node:test';
import assert from 'node:assert/strict';
import {LayoutScheduler} from '../runtime/presentation/LayoutScheduler.ts';
import {DOMPresenter} from '../runtime/presentation/DOMPresenter.ts';
import {publishEditorial} from '../runtime/presentation/EditorialPresenter.mjs';

test('layout invalidations combine reasons and preserve invalidation during measurement',()=>{
 let wakes=0;const layout=new LayoutScheduler(()=>wakes++),resets=[];
 layout.invalidate('font');layout.invalidate('source',true);layout.invalidate('resize');
 assert.equal(layout.inspect().reasons.length,3);
 layout.flush(reset=>{resets.push(reset);layout.invalidate('late-image');});
 assert.deepEqual(resets,[true]);assert.equal(layout.inspect().dirty,true);
 layout.flush(reset=>resets.push(reset));assert.deepEqual(resets,[true,false]);
 assert.equal(layout.flush(()=>assert.fail('idle layout measured')),false);
 layout.dispose();const before=wakes;layout.invalidate('stale-observer');assert.equal(wakes,before);
});

test('editorial presentation consumes the chapter sample and publishes shared section attention',()=>{
 const styles=[new Map(),new Map()];
 const sections=styles.map(values=>({style:{getPropertyValue:key=>values.get(key)??'',setProperty:(key,value)=>values.set(key,value)}}));
 const presenter=new DOMPresenter().forOwner('editorial');
 const moving=publishEditorial({choreography:new Map(),stickyRects:new Map(),reading:{visualDocY:0},
  playbackScore:{activeSeconds:0,energy:.6},state:{reduced:false},didSeek:false,didResume:false,
  sections,chapter:{index:1},planes:[],fine:{matches:true},dt:1/60,publisher:presenter,viewportHeight:1000});
 assert.equal(moving,false);assert.equal(styles[0].get('--attention'),'0.25');assert.equal(styles[1].get('--attention'),'1');
 assert.equal(styles[0].get('--energy'),'0.6');
});

test('DOM publication skips unchanged writes and observes React replacing an attribute',()=>{
 const attributes=new Map(),styles=new Map();let writes=0,text='';
 const node={style:{getPropertyValue:key=>styles.get(key)??'',setProperty(key,value){writes++;styles.set(key,value);}},
  getAttribute:key=>attributes.get(key)??null,setAttribute(key,value){writes++;attributes.set(key,value);},removeAttribute(key){writes++;attributes.delete(key);},
  get textContent(){return text;},set textContent(value){writes++;text=value;}};
 const dom=new DOMPresenter(),director=dom.forOwner('director'),other=dom.forOwner('view');
 for(let i=0;i<120;i++){director.style(node,'--hold','0px');director.attribute(node,'aria-current','location');director.text(node,'FORM');}
 assert.equal(writes,3);assert.equal(director.inspect().unchanged,357);
 other.attribute(node,'aria-current','false');director.attribute(node,'aria-current','location');
 assert.equal(attributes.get('aria-current'),'location');assert.equal(writes,5);
});
