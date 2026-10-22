import test from 'node:test';
import assert from 'node:assert/strict';
import {Matrix4,PerspectiveCamera} from 'three';
import {publishModelAnnotation,placeModelAnnotation} from '../runtime/presentation/ModelAnnotationPresenter.mjs';

function fixture(){
 const node=()=>({dataset:{},attributes:{},setAttribute(key,value){this.attributes[key]=value;}});
 const svg=node(),dot=node(),leader=node();let reads=0;
 const outer={left:0,top:0},caption={left:1169,top:396.25,height:20};
 const label={getBoundingClientRect(){reads++;return {...caption};}};
 svg.querySelector=selector=>selector==='[data-model-anchor]'?dot:leader;
 const study={dataset:{},getBoundingClientRect(){reads++;return {...outer};},querySelector:selector=>selector==='[data-model-connector]'?svg:label};
 return {study,svg,dot,leader,outer,caption,reads:()=>reads};
}
const size={width:1440,height:1000};
const canvasRect={left:0,top:0,...size};
const readDot=f=>({x:Number(f.dot.attributes.cx),y:Number(f.dot.attributes.cy)});
const end=f=>f.leader.attributes.points.trim().split(' ').at(-1).split(',').map(Number);

test('a painted anchor follows current Canvas and caption rectangles without another projection',()=>{
 const f=fixture(),camera=new PerspectiveCamera(45,size.width/size.height,.1,100);
 camera.position.set(0,0,5);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
 const mesh={matrixWorld:new Matrix4(),userData:{representationId:'source'}};
 const painted=publishModelAnnotation(f.study,{points:[[0,0,0],[1,0,0]],mesh,camera,...size,present:true,canvasRect});
 assert.equal(painted.visible,true);assert.equal(painted.index,1);
 const saved=structuredClone(painted);Object.freeze(painted);
 // A camera or model can already contain the next, unpainted pose. DOM-only
 // updates must still use the projection matching the displayed GPU image.
 camera.position.set(100,100,100);camera.updateMatrixWorld(true);mesh.matrixWorld.makeTranslation(100,0,0);
 f.caption.top-=.503;
 const moved={...canvasRect,left:-194.57193,top:-6.2555275};
 const placed=placeModelAnnotation(f.study,{anchor:painted,...size,canvasRect:moved});
 assert.deepEqual(readDot(f),{x:painted.x+moved.left,y:painted.y+moved.top});
 assert.deepEqual(end(f),[1159,405.747]);
 assert.deepEqual(placed.end,{x:1159,y:405.747});
 assert.equal(placed.x,painted.x);assert.equal(placed.y,painted.y);assert.equal(placed.index,painted.index);
 assert.deepEqual(painted,saved);
});

test('viewport remapping keeps the painted projection size and uses both current DOM origins',()=>{
 const f=fixture(),anchor=Object.freeze({x:800,y:300,index:4,score:0});
 f.outer.left=30;f.outer.top=20;f.caption.left=700;f.caption.top=200;
 const placed=placeModelAnnotation(f.study,{anchor,...size,canvasRect:{left:-40,top:10,width:720,height:500}});
 assert.deepEqual(readDot(f),{x:330,y:140});
 assert.deepEqual(end(f),[660,190]);assert.equal(placed.visible,true);
});

test('offscreen or hidden passages suppress the connector without losing the painted anchor',()=>{
 const f=fixture(),anchor=Object.freeze({x:800,y:300,index:4,score:0});
 const offscreen=placeModelAnnotation(f.study,{anchor,...size,canvasRect:{...canvasRect,left:-1555.2}});
 assert.equal(offscreen.visible,false);assert.equal(f.svg.dataset.annotationVisible,'false');
 const before=f.reads();
 assert.equal(placeModelAnnotation(f.study,{anchor:null}),null);
 assert.equal(f.reads(),before);assert.equal(f.svg.dataset.annotationVisible,'false');
 const returned=placeModelAnnotation(f.study,{anchor,...size,canvasRect});
 assert.equal(returned.visible,true);assert.equal(f.svg.dataset.annotationVisible,'true');assert.deepEqual(readDot(f),{x:800,y:300});
});

test('removed or zero-size presentation surfaces hide safely',()=>{
 const f=fixture(),anchor={x:800,y:300,index:4,score:0};
 assert.equal(placeModelAnnotation(f.study,{anchor,width:0,height:1000,canvasRect}),null);
 assert.equal(f.svg.dataset.annotationVisible,'false');assert.equal(f.reads(),0);
 assert.equal(placeModelAnnotation(null,{anchor:null}),null);
 assert.equal(placeModelAnnotation({querySelector:()=>null},{anchor:null}),null);
});

test('a native-flow portal suppresses only the decorative fixed leader without geometry reads',()=>{
 const f=fixture();f.study.dataset.studyChapter='form';
 const panel={dataset:{modelLabelPlacement:'native'},querySelector:()=>{throw Error('Native card requires no fixed caption rectangle');}};
 f.study.ownerDocument={querySelector:selector=>{assert.equal(selector,'[data-model-side-label][data-study-chapter="form"]');return panel;}};
 assert.equal(publishModelAnnotation(f.study,{present:true}),null);
 assert.equal(f.svg.dataset.annotationVisible,'false');assert.equal(f.reads(),0);
 // An already-painted projection cannot reintroduce a line across native copy.
 assert.equal(placeModelAnnotation(f.study,{anchor:{x:800,y:300},...size,canvasRect}),null);
 assert.equal(f.reads(),0);
});
