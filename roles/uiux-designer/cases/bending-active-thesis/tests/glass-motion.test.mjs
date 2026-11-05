import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleGlassFeed,sampleGlassCarousel,sampleGlassPassage,glassPassageTransform,createGlassEdgeMap} from '../runtime/motion/glass-motion.mjs';
import {createGlassFieldOptics} from '../runtime/presentation/GlassFieldOptics.mjs';
const feed=(vertical,state={},options={})=>sampleGlassFeed(state,400,400,24,{vertical,...options});

test('glass feed has a clear central aperture and opposite finite spatial shoulders, independent of speed',()=>{
 for(const y of [-.5,0,.5]){const {pose,edge,warp}=feed(y);assert.equal(edge,0);assert.equal(warp,0);assert(pose.rx===0);assert.equal(pose.sx,1);assert.equal(pose.sy,1);}
 const top=feed(-1.1),bottom=feed(1.1);assert(top.edge>.9);assert.equal(top.pose.rx,-bottom.pose.rx);assert.equal(top.pose.y,-bottom.pose.y);assert(top.pose.sy<1&&top.pose.sx>1);
 for(let y=-1.5;y<=1.5;y+=.05)for(const strength of [-1,0,1]){
  const p=feed(y,{strength,surge:-strength},{horizontal:.8});assert(Object.values(p.pose).every(Number.isFinite));assert(Math.abs(p.pose.rx)<=22.2);assert(p.edgeMaximum<=20);assert(p.pose.sy>=.935&&p.pose.sy<=1.018);
 }
 const focused=feed(1.2,{strength:1,surge:1},{focused:true,stream:true,seconds:6});assert.equal(focused.pose.rx,0);assert.equal(focused.pose.sx,1);assert.equal(focused.warp,0);assert.equal(focused.streamOffset,0);
 const forward=feed(0,{strength:.8,surge:.5}),reverse=feed(0,{strength:-.8,surge:-.5});assert.equal(forward.pose.rx,-reverse.pose.rx);assert.equal(forward.pose.sy,reverse.pose.sy);assert(forward.pose.sy>1);
});

test('stream columns counterflow on the caller clock and close exactly after 24 seconds',()=>{
 assert(feed(.5,{}, {stream:true,lane:0,seconds:6,viewportHeight:800}).edge>0);
 assert.equal(feed(.5,{}, {stream:true,lane:1,seconds:6,viewportHeight:800}).edge,0,'the field follows actual moving card position');
 for(let time=0;time<=24;time+=.25){
  const a=feed(0,{}, {stream:true,lane:0,seconds:time}),b=feed(0,{}, {stream:true,lane:1,seconds:time}),c=feed(0,{}, {stream:true,lane:2,seconds:time});
  assert.equal(a.streamOffset,-b.streamOffset);assert.equal(a.streamOffset,c.streamOffset);assert(Math.abs(a.streamOffset)<=48);
  assert(Math.abs(feed(0,{}, {stream:true,seconds:time+24}).streamOffset-a.streamOffset)<1e-10);
 }
});

test('carousel is compact, symmetric and square at the focal plane with ordered depth and no card roll',()=>{
 const center=sampleGlassCarousel(0);assert.equal(center.scale,1);assert.equal(center.sx,1);assert.equal(center.sy,1);assert(center.yaw===0);assert.equal(center.opacity,1);
 let depth=0;
 for(let d=.1;d<=3;d+=.1){const left=sampleGlassCarousel(-d),right=sampleGlassCarousel(d);assert.equal(left.x,-right.x);assert.equal(left.yaw,-right.yaw);assert.equal(left.z,right.z);assert(right.z<depth);depth=right.z;assert.equal(left.roll,0);assert(right.opacity>=0&&right.opacity<=1);}
 const neighbour=sampleGlassCarousel(1);assert(neighbour.x>400*.25&&neighbour.x<400*.36,'at least 64% overlap at the adjacent centre');
});

test('optical maps keep the middle neutral, reverse correctly and are bounded original RGBA fields',()=>{
 for(const axis of ['vertical','horizontal']){
  const {width,height,data,pixels}=createGlassEdgeMap(axis);assert.equal(pixels,96*96);assert.equal(data.length,pixels*4);
  const at=(x,y)=>Array.from(data.slice((y*width+x)*4,(y*width+x)*4+4));assert.deepEqual(at(48,48),[128,128,128,255]);
  const a=at(0,0),b=at(width-1,height-1);assert.equal(a[0]+b[0],255);assert.equal(a[1]+b[1],255);
  assert.deepEqual(createGlassEdgeMap(axis).data,data);assert.equal(at(48,0)[axis==='vertical'?1:0]<128,false);
 }
 assert.throws(()=>createGlassEdgeMap('unknown'));assert.throws(()=>createGlassEdgeMap('vertical',4096));
});

test('one optical map survives remeasurement and all DOM ownership releases, including encoder failure',()=>{
 const node=()=>({attrs:new Map(),styles:new Map()}),filter={...node(),id:'field'},image=node(),displacement=node(),element={...node(),querySelector:selector=>selector.includes('filter')?filter:selector.includes('displacement')?displacement:image};
 const publisher={attribute:(n,k,v)=>v===null?n.attrs.delete(k):n.attrs.set(k,v),style:(n,k,v)=>v===''?n.styles.delete(k):n.styles.set(k,v)};
 const optics=createGlassFieldOptics({document:{},publisher,encodeMap:()=> 'data:image/png;base64,test'});
 const record=optics.measure(element,400,400);assert.equal(optics.measure(element,800,800),record);assert.equal(optics.inspect().generations,1);assert.equal(optics.inspect().records,1);
 optics.publish(record,{x:-100,y:-30,width:1440,height:900,scale:100});assert.equal(displacement.attrs.get('scale'),'56.00');assert.equal(element.attrs.get('data-glass-optics'),'displacement');
 optics.publish(record,{enabled:false});assert.equal(element.styles.get('--glass-field-filter'),'none');
 optics.dispose();assert.equal(element.styles.size,0);assert.equal(element.attrs.size,0);assert.equal(optics.inspect().records,0);assert.equal(image.attrs.has('href'),false);
 const failed=createGlassFieldOptics({document:{},publisher,encodeMap:()=>{throw Error('unavailable');}});assert.equal(failed.measure(element,400,400),null);assert.equal(failed.inspect().failed,true);failed.dispose();
 const geometric=createGlassFieldOptics({document:{defaultView:{navigator:{userAgent:'AppleWebKit/605 Version/18 Safari/605'}}},publisher});
 const fallback=geometric.measure(element,400,400);geometric.publish(fallback,{scale:40,enabled:true});assert.equal(geometric.inspect().mode,'geometric');assert.equal(geometric.inspect().maps,0);assert.equal(element.attrs.get('data-glass-optics'),'geometric');assert.equal(element.styles.size,0);geometric.dispose();assert.equal(element.attrs.size,0);assert.equal(geometric.inspect().records,0);
});

test('source passages preserve the exact native transform at hold and reverse their optical shoulder',()=>{
 assert.equal(glassPassageTransform(12,-3,1),'translate3d(12px,-3px,0)');
 const a=sampleGlassPassage(.3,1),b=sampleGlassPassage(.3,-1);assert.equal(a.scale,b.scale);assert.equal(a.rotateX,-b.rotateX);assert.equal(a.rotateY,-b.rotateY);
 const angle=x=>Number(glassPassageTransform(x,0,.3).match(/rotateX\(([-\d.]+)deg\)/)[1]);assert(Math.abs(angle(.001)-angle(-.001))<.0001,'crossing the aperture centre cannot flip the rotation');assert.equal(angle(0),0);
 for(let t=0;t<=1;t+=.01){const p=sampleGlassPassage(t);assert(p.scale>=.925&&p.scale<=1);assert(Object.values(p).every(Number.isFinite));}
});
