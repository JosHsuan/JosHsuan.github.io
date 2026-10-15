import test from 'node:test';
import assert from 'node:assert/strict';
import {
 LIQUID_MAP_PIXEL_LIMIT,liquidGlassMode,sampleLiquidLens,createLiquidLensMap,
 createLiquidResponse,advanceLiquidResponse,
} from '../runtime/motion/liquid-glass.mjs';
import {createLiquidGlassPresenter} from '../runtime/presentation/LiquidGlassPresenter.mjs';

const chromium='Mozilla/5.0 AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36';
const safari='Mozilla/5.0 AppleWebKit/605.1.15 Version/26.6 Safari/605.1.15';
const rest={x:.5,y:.5,hover:0,press:0};
const near=(a,b,tolerance=1e-10)=>assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);

function fixture(specs=[{}],options={}){
 const operations=[],nodes=[],encoded=[];
 const document={activeElement:null,querySelectorAll:()=>nodes,defaultView:{getComputedStyle(element){operations.push('read:style');return element.computed;}}};
 function node(parent=null){return{parentElement:parent,attrs:new Map(),styles:new Map(),contains(target){for(let current=target;current;current=current.parentElement)if(current===this)return true;return false;},closest(){return nodes.find(element=>element.contains(this))??null;}};}
 for(const [index,spec] of specs.entries()){
  const element=node();element.dataset={liquidGlass:spec.kind??'navigation-'+index};
  element.rect={left:40,top:20,width:280,height:64,...spec.rect};
  element.computed={display:'block',visibility:'visible',borderTopLeftRadius:'18px',...spec.style};
  element.getBoundingClientRect=()=>{operations.push('read:rect');return{...element.rect};};
  const skin=node(element),image=node(skin),displacement=node(skin);
  element.skin=skin;element.image=image;element.displacement=displacement;
  element.querySelector=()=>spec.skin===false?null:skin;
  skin.querySelector=selector=>selector==='[data-liquid-map]'?(spec.image===false?null:image):(spec.displacement===false?null:displacement);
  nodes.push(element);
 }
 const publisher={style(element,key,value){operations.push('write:'+key);if(value==='')element.styles.delete(key);else element.styles.set(key,String(value));},attribute(element,key,value){operations.push('write:'+key);if(value===null)element.attrs.delete(key);else element.attrs.set(key,String(value));}};
 const encodeMap=map=>{encoded.push(map);if(options.failEncoding)throw Error('Contained map encoder failure');return 'data:image/png;base64,fixture-'+encoded.length;};
 const presenter=createLiquidGlassPresenter({root:document,publisher,environment:{userAgent:chromium,supportsBackdrop:true,...options.environment},encodeMap});
 const pointer=(type='pointermove',index=0,extra={})=>presenter.pointer({type,target:nodes[index],pointerType:'mouse',clientX:320,clientY:84,...extra});
 const publish=(args={})=>presenter.publish({dt:1/60,...args});
 const settle=(args={})=>{for(let n=0;n<180;n++)publish(args);};
 return{document,nodes,operations,encoded,presenter,pointer,publish,settle,child:index=>node(nodes[index])};
}

test('engine policy distinguishes tested refraction from syntactic backdrop support',()=>{
 for(const userAgent of [chromium,chromium.replace('Chrome/153.0.0.0','Chromium/153.0.0.0'),chromium+' Edg/153.0.0.0',chromium+' OPR/140.0'])assert.equal(liquidGlassMode({userAgent,supportsBackdrop:true}),'refractive');
 for(const userAgent of [safari,'Mozilla/5.0 Firefox/145.0','',safari+' CriOS/153.0',chromium+' EdgiOS/153.0',chromium+' FxiOS/145.0'])assert.equal(liquidGlassMode({userAgent,supportsBackdrop:true}),'reflective');
 for(const userAgent of [chromium,safari]){
  assert.equal(liquidGlassMode({userAgent,supportsBackdrop:false}),'opaque');
  assert.equal(liquidGlassMode({userAgent,supportsBackdrop:true,opaque:true}),'opaque');
 }
});

test('rounded lens leaves documentary center and exterior neutral, with mirrored rim normals',()=>{
 assert.deepEqual(sampleLiquidLens(150,40,300,80,18),{x:0,y:0});
 assert.deepEqual(sampleLiquidLens(-20,40,300,80,18),{x:0,y:0});
 assert.deepEqual(sampleLiquidLens(0,0,300,80,18),{x:0,y:0});
 const left=sampleLiquidLens(2,40,300,80,18),right=sampleLiquidLens(298,40,300,80,18);
 assert(left.x<0&&right.x>0);near(left.x,-right.x);near(left.y,right.y);
 const top=sampleLiquidLens(150,2,300,80,18),bottom=sampleLiquidLens(150,78,300,80,18);
 assert(top.y<0&&bottom.y>0);near(top.y,-bottom.y);near(top.x,bottom.x);
 for(let y=-5;y<=85;y+=2)for(let x=-5;x<=305;x+=2){
  const normal=sampleLiquidLens(x,y,300,80,18);
  assert(Number.isFinite(normal.x)&&Number.isFinite(normal.y));
  assert(Math.hypot(normal.x,normal.y)<=1+1e-10);
 }
});

test('encoded normal maps preserve neutral center and bounded allocation across aspect ratios',()=>{
 for(const [width,height] of [[300,80],[1000,1000],[1e6,1e6],[1e7,1],[1,1e7],[.2,.3],[800,600]]){
  const map=createLiquidLensMap(width,height,18);
  assert.equal(map.pixels,map.width*map.height);assert(map.pixels<=LIQUID_MAP_PIXEL_LIMIT);
  assert(map.width>=2&&map.height>=2&&map.width<=384&&map.height<=384);
  assert.equal(map.data.length,map.pixels*4);
  for(let n=0;n<map.pixels;n++){assert.equal(map.data[n*4+2],128);assert.equal(map.data[n*4+3],255);}
 }
 const map=createLiquidLensMap(300,80,18),offset=(40*map.width+150)*4;
 assert.deepEqual([...map.data.slice(offset,offset+4)],[128,128,128,255]);
 for(const dimensions of [[0,80],[-1,80],[80,NaN],[Infinity,80],[80,undefined]])assert.throws(()=>createLiquidLensMap(...dimensions),RangeError);
});

test('spring consumes active elapsed time consistently, clamps input and settles without another clock',()=>{
 const slow=createLiquidResponse(),fast=createLiquidResponse(),target={x:1,y:0,hover:1,press:1};
 for(let n=0;n<3;n++)advanceLiquidResponse(slow,1/3,target);
 for(let n=0;n<60;n++)advanceLiquidResponse(fast,1/60,target);
 for(const key of Object.keys(rest)){near(slow.value[key],fast.value[key]);near(slow.velocity[key],fast.velocity[key]);}
 const initial=structuredClone(fast);advanceLiquidResponse(fast,0,target);assert.deepEqual(fast,initial);
 for(let n=0;n<180;n++)advanceLiquidResponse(fast,1/60,{x:5,y:-5,hover:3,press:-2});
 assert.deepEqual(fast.value,{x:1,y:0,hover:1,press:0});assert.equal(fast.settled,true);
 assert.equal(advanceLiquidResponse(fast,1/60,{x:5,y:-5,hover:3,press:-2}),false);
});

test('spring snap and long gaps reach the supplied target without retaining momentum',()=>{
 for(const [dt,settings] of [[0,{snap:true}],[1.01,{}]]){
  const state=createLiquidResponse();advanceLiquidResponse(state,1/3,{x:1,y:0,hover:1,press:1});
  assert.equal(advanceLiquidResponse(state,dt,rest,settings),false);
  assert.deepEqual(state.value,rest);assert.deepEqual(state.velocity,{x:0,y:0,hover:0,press:0});assert.equal(state.settled,true);
 }
 const state=createLiquidResponse();assert.equal(advanceLiquidResponse(state,NaN,{x:NaN,y:Infinity,hover:NaN,press:undefined}),false);assert.deepEqual(state.value,rest);
});

test('presenter is inert before registration, batches geometry reads and caches maps by geometry',()=>{
 const f=fixture([{}, {kind:'owner',rect:{width:180,height:48}}]);
 assert.equal(f.presenter.inspect().count,0);assert.equal(f.encoded.length,0);assert.equal(f.pointer(),false);
 f.presenter.measure();assert.equal(f.encoded.length,2);assert.equal(f.presenter.inspect().mapGenerations,2);
 const firstWrite=f.operations.findIndex(value=>value.startsWith('write:'));
 assert(firstWrite>0);assert(f.operations.slice(firstWrite).every(value=>!value.startsWith('read:')));
 for(const element of f.nodes){
  assert.equal(element.attrs.get('data-liquid-mode'),'refractive');assert(element.styles.get('--liquid-refraction-filter').includes('#liquid-'+element.dataset.liquidGlass));
  // The owning SVG defs viewport is zero-sized. Percentage feImage dimensions
  // can collapse its map and turn a neutral core into a whole-surface shift.
  assert.equal(Number(element.image.attrs.get('width')),element.rect.width);
  assert.equal(Number(element.image.attrs.get('height')),element.rect.height);
 }
 f.nodes[0].rect.left+=70;f.nodes[0].rect.top+=30;f.presenter.measure();
 assert.equal(f.encoded.length,2,'position changes retain the same original map');
 const reads=f.operations.filter(value=>value.startsWith('read:')).length;
 f.pointer();f.settle();assert.equal(f.encoded.length,2,'per-frame response cannot recreate a map');
 assert.equal(f.operations.filter(value=>value.startsWith('read:')).length,reads,'frame response uses measured geometry without layout reads');
 f.nodes[0].rect.width+=10;f.presenter.measure();assert.equal(f.encoded.length,3);assert.equal(Number(f.nodes[0].image.attrs.get('width')),f.nodes[0].rect.width);
 f.nodes[0].computed.borderTopLeftRadius='24px';f.presenter.measure();assert.equal(f.encoded.length,4);
});

test('hidden, zero-size and incomplete skins avoid maps; registration removal releases ownership',()=>{
 const f=fixture([{}, {style:{display:'none'}}, {style:{visibility:'hidden'}}, {rect:{width:0}}, {skin:false}, {image:false}, {displacement:false}]);
 f.presenter.measure();assert.equal(f.presenter.inspect().count,4);assert.equal(f.encoded.length,1);
 const visible=f.nodes[0];assert(visible.image.attrs.get('href'));
 visible.computed.visibility='hidden';f.presenter.measure();
 assert.equal(f.presenter.inspect().mapPixels,0);assert.equal(visible.image.attrs.get('href'),'');assert.equal(visible.displacement.attrs.get('scale'),'0');
 f.pointer('pointerdown');f.publish();assert.equal(f.presenter.inspect().items[0].press,0);
 visible.computed.visibility='visible';f.presenter.measure();assert.equal(f.encoded.length,2);
 f.nodes.splice(0,1);f.presenter.measure();
 assert.equal(visible.attrs.has('data-liquid-ready'),false);assert.equal(visible.attrs.has('data-liquid-mode'),false);assert.equal(visible.styles.size,0);assert.equal(visible.image.attrs.get('href'),'');
});

test('map encoder failure is contained as reflective material and may recover on later layout',()=>{
 let fail=true;const f=fixture([],{}),element=fixture().nodes[0];f.nodes.push(element);
 const presenter=createLiquidGlassPresenter({root:f.document,publisher:{style:(node,key,value)=>value===''?node.styles.delete(key):node.styles.set(key,value),attribute:(node,key,value)=>value===null?node.attrs.delete(key):node.attrs.set(key,value)},environment:{userAgent:chromium,supportsBackdrop:true},encodeMap:()=>{if(fail)throw Error('encoder unavailable');return 'data:image/png;base64,recovered';}});
 presenter.measure();assert.equal(element.attrs.get('data-liquid-mode'),'reflective');assert.equal(presenter.inspect().mapPixels,0);assert.equal(element.displacement.attrs.get('scale'),'0');
 fail=false;presenter.measure();assert.equal(element.attrs.get('data-liquid-mode'),'refractive');assert(presenter.inspect().mapPixels>0);assert.equal(presenter.inspect().mapGenerations,1);presenter.dispose();
});

test('pointer descendants target local optics, press stays bounded and mouse release preserves hover',()=>{
 const f=fixture();f.presenter.measure();const child=f.child(0);
 assert(f.pointer('pointermove',0,{target:child,clientX:10000,clientY:-10000}));f.settle();
 let item=f.presenter.inspect().items[0];assert.equal(item.x,1);assert.equal(item.y,0);assert.equal(item.hover,1);assert.equal(item.press,0);
 f.pointer('pointerdown',0,{clientX:110,clientY:52});f.settle();item=f.presenter.inspect().items[0];assert.equal(item.press,1);assert.equal(f.nodes[0].displacement.attrs.get('scale'),'15.000');
 f.pointer('pointerup');f.settle();item=f.presenter.inspect().items[0];assert.equal(item.press,0);assert.equal(item.hover,1);assert.equal(f.nodes[0].displacement.attrs.get('scale'),'12.000');
 f.pointer('pointermove',0,{target:null});f.settle();assert.deepEqual(Object.fromEntries(Object.keys(rest).map(key=>[key,f.presenter.inspect().items[0][key]])),rest);assert.equal(f.presenter.inspect().settled,true);
});

test('touch cancel closes press and hover; reset discards active response without recreating maps',()=>{
 const f=fixture();f.presenter.measure();f.pointer('pointerdown',0,{pointerType:'touch'});f.settle();assert.equal(f.presenter.inspect().items[0].press,1);
 f.pointer('pointercancel',0,{pointerType:'touch'});f.settle();let item=f.presenter.inspect().items[0];assert.equal(item.press,0);assert.equal(item.hover,0);
 f.pointer('pointerdown');f.publish();f.presenter.reset();item=f.presenter.inspect().items[0];for(const key of Object.keys(rest))assert.equal(item[key],rest[key]);assert.equal(f.presenter.inspect().settled,true);assert.equal(f.encoded.length,1);
});

test('mouse and pen cancellation immediately discard every material response and gesture owner',()=>{
 for(const pointerType of ['mouse','pen']){
  const f=fixture([{},{}]);f.presenter.measure();f.pointer('pointermove',0,{pointerType});f.publish();f.pointer('pointerdown',1,{pointerType});f.publish();
  assert(f.presenter.inspect().items.some(item=>item.hover>0));
  f.pointer('pointercancel',1,{pointerType});
  for(const item of f.presenter.inspect().items)for(const key of Object.keys(rest))assert.equal(item[key],rest[key]);
  assert.equal(f.presenter.inspect().settled,true);f.settle();
  for(const item of f.presenter.inspect().items){assert.equal(item.press,0);assert.equal(item.hover,0);}
 }
});

test('native pointer focus permits direct press while keyboard focus suppresses decorative movement',()=>{
 const f=fixture();f.presenter.measure();f.document.activeElement=f.child(0);f.pointer('pointerdown');f.settle({keyboardFocus:false});
 let item=f.presenter.inspect().items[0];assert.equal(item.press,1);assert.equal(item.hover,1);
 assert.equal(f.publish({keyboardFocus:true}),false);item=f.presenter.inspect().items[0];for(const key of Object.keys(rest))assert.equal(item[key],rest[key]);assert.equal(item.settled,true);
});

test('one long foreground frame preserves the latest stationary pointer intent until an explicit lifecycle reset',()=>{
 for(const userAgent of [chromium,safari])for(const interruption of ['reset','hidden','resumed']){
  const f=fixture([{}],{environment:{userAgent}});f.presenter.measure();const maps=f.presenter.inspect().mapGenerations;
  // A software-rendered foreground frame can exceed a second without a new
  // pointer event. Snap the existing target; do not invent a pointer departure.
  assert.equal(f.pointer('pointermove',0,{clientX:96,clientY:36}),true);
  assert.equal(f.publish({dt:1.2}),false);
  let item=f.presenter.inspect().items[0];near(item.x,.2);near(item.y,.25);assert.equal(item.hover,1);assert.equal(item.press,0);assert.equal(item.settled,true);
  f.pointer('pointerdown',0,{clientX:264,clientY:68});assert.equal(f.publish({dt:1.2}),false);
  item=f.presenter.inspect().items[0];near(item.x,.8);near(item.y,.75);assert.equal(item.hover,1);assert.equal(item.press,1);assert.equal(item.settled,true);
  f.publish();item=f.presenter.inspect().items[0];assert.equal(item.hover,1);assert.equal(item.press,1);assert.equal(item.settled,true);
  assert.equal(f.presenter.inspect().mapGenerations,maps,'long frames never regenerate an optical map');
  if(interruption==='reset')f.presenter.reset();else f.publish({[interruption]:true});
  item=f.presenter.inspect().items[0];for(const key of Object.keys(rest))assert.equal(item[key],rest[key]);assert.equal(item.settled,true);
  f.publish();item=f.presenter.inspect().items[0];assert.equal(item.hover,0);assert.equal(item.press,0);assert.equal(f.presenter.inspect().mapGenerations,maps);
 }
});

test('focus and lifecycle preference paths immediately restore a stable material on the same clock',()=>{
 for(const option of [{reduced:true},{resumed:true},{hidden:true},{opaque:true},{focus:true}]){
  const f=fixture();f.presenter.measure();f.pointer('pointerdown');f.publish();assert(f.presenter.inspect().items[0].press>0);
  if(option.focus)f.document.activeElement=f.child(0);
  assert.equal(f.publish(option),false);const item=f.presenter.inspect().items[0];for(const key of Object.keys(rest))assert.equal(item[key],rest[key]);assert.equal(item.settled,true);
  if(option.opaque){assert.equal(f.nodes[0].attrs.get('data-liquid-mode'),'opaque');assert.equal(f.presenter.inspect().mapPixels,0);assert.equal(f.nodes[0].image.attrs.get('href'),'');}
 }
});

test('reflective and opaque engines allocate no normal map; opacity changes rebuild only on layout',()=>{
 for(const environment of [{userAgent:safari,supportsBackdrop:true},{userAgent:chromium,supportsBackdrop:false}]){
  const f=fixture([{}],{environment});f.presenter.measure();f.pointer('pointermove');f.settle();assert.equal(f.encoded.length,0);assert.equal(f.presenter.inspect().mapPixels,0);assert.equal(f.nodes[0].displacement.attrs.get('scale'),'0');
 }
 const f=fixture();f.presenter.measure();f.presenter.measure({opaque:true});assert.equal(f.presenter.inspect().mode,'opaque');assert.equal(f.presenter.inspect().mapPixels,0);
 f.publish({opaque:true});assert.equal(f.encoded.length,1);
 f.presenter.measure({opaque:false});assert.equal(f.encoded.length,2);assert.equal(f.nodes[0].attrs.get('data-liquid-mode'),'refractive');assert(f.presenter.inspect().mapPixels>0);
});

test('restoring transparency cannot claim rendered refraction until layout regenerates the actual map',()=>{
 const f=fixture();f.presenter.measure();assert.equal(f.presenter.inspect().items[0].mode,'refractive');
 f.publish({opaque:true});assert.equal(f.presenter.inspect().items[0].mode,'opaque');assert.equal(f.presenter.inspect().mapPixels,0);
 f.publish({opaque:false});assert.equal(f.encoded.length,1);assert.equal(f.presenter.inspect().items[0].mode,'reflective');assert.equal(f.nodes[0].attrs.get('data-liquid-mode'),'reflective');assert.equal(f.nodes[0].styles.has('--liquid-refraction-filter'),false);
 f.presenter.measure();assert.equal(f.encoded.length,2);assert.equal(f.presenter.inspect().items[0].mode,'refractive');assert.equal(f.nodes[0].attrs.get('data-liquid-mode'),'refractive');assert(f.presenter.inspect().mapPixels>0);
});

test('dispose clears maps, styles and material attributes once and rejects all late publication',()=>{
 const f=fixture([{},{}]);f.presenter.measure();f.pointer('pointerdown');f.publish();const before=f.presenter.inspect();assert(before.mapPixels>0);
 f.presenter.dispose();assert.equal(f.presenter.inspect().count,0);assert.equal(f.presenter.inspect().mapPixels,0);assert.equal(f.presenter.inspect().settled,true);
 for(const element of f.nodes){assert.equal(element.styles.size,0);assert.equal(element.attrs.size,0);assert.equal(element.image.attrs.get('href'),'');assert.equal(element.displacement.attrs.get('scale'),'0');}
 const writes=f.operations.length;f.presenter.dispose();f.presenter.measure();assert.equal(f.pointer(),false);assert.equal(f.publish(),false);f.presenter.reset();assert.equal(f.operations.length,writes);assert.equal(f.presenter.inspect().ticks,before.ticks);
});
