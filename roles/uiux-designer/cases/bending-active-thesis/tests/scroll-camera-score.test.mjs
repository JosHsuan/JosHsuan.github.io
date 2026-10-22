import test from 'node:test';
import assert from 'node:assert/strict';
import {createScrollCameraPath, sampleScrollCamera, composeCameraIntent} from '../runtime/motion/scroll-camera-score.mjs';
const key=(at,yawRad=0)=>({at,yawRad,pitchRad:.3,fovDeg:36,zoom:1});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const path=createScrollCameraPath([key(0),key(.4,.5),key(1,1)]);
test('endpoints, intermediate key and clamped native range',()=>{
 for(const [p,y] of [[-1,0],[0,0],[.4,.5],[1,1],[2,1]]) close(sampleScrollCamera(path,p).yawRad,y);
});
test('pure reversible sampling has no prior-input or frame-rate dependency',()=>{
 const forward=Array.from({length:121},(_,i)=>sampleScrollCamera(path,i/120));
 for(let i=120;i>=0;i--) assert.deepEqual(sampleScrollCamera(path,i/120),forward[i]);
 for(const fps of [30,60,120]) close(sampleScrollCamera(path,Math.round(.5*fps)/fps).yawRad,sampleScrollCamera(path,.5).yawRad);
});
test('yaw takes shortest wrapped direction and is continuous at joins',()=>{
 const radians=d=>d*Math.PI/180;
 const wrap=createScrollCameraPath([key(0,radians(170)),key(.5,radians(-170)),key(1,radians(-150))]);
 close(sampleScrollCamera(wrap,.25).yawRad,Math.PI);
 close(sampleScrollCamera(wrap,.5).yawRad,radians(190));
 close(sampleScrollCamera(wrap,1).yawRad,radians(210));
 assert.ok(Math.abs(sampleScrollCamera(wrap,.5-1e-6).yawRad-sampleScrollCamera(wrap,.5+1e-6).yawRad)<1e-8);
});
test('all interpolated fields stay within endpoints; first derivatives stop at keys',()=>{
 const varied=createScrollCameraPath([key(0),{at:1,yawRad:1,pitchRad:.6,fovDeg:50,zoom:1.2}]);
 for(let i=0;i<=100;i++) {const v=sampleScrollCamera(varied,i/100);assert.ok(v.fovDeg>=36&&v.fovDeg<=50);assert.ok(v.zoom>=1&&v.zoom<=1.2);}
 assert.ok(sampleScrollCamera(varied,1e-5).yawRad/1e-5<.0001);
});
test('static policy chooses authored poses only',()=>{
 assert.deepEqual(sampleScrollCamera(path,.1,{static:true}),sampleScrollCamera(path,0));
 assert.deepEqual(sampleScrollCamera(path,.3,{static:true}),sampleScrollCamera(path,.4));
});
test('idle remains independent of scroll and reduced policy removes idle only',()=>{
 const main=sampleScrollCamera(path,.3),idle={yawRad:.01,pitchRad:-.005,fovScale:1.01},inspection={yawRad:.2};
 close(composeCameraIntent(main,{idle}).yawRad,main.yawRad+.01);
 close(composeCameraIntent(main,{idle,inspection,reducedMotion:true}).yawRad,main.yawRad+.2);
 assert.deepEqual(composeCameraIntent(main),main);
});
test('invalid input/lens/duplicate anchors rejected; prepared path immutable',()=>{
 for(const v of [NaN,Infinity,-Infinity,undefined]) assert.throws(()=>sampleScrollCamera(path,v),RangeError);
 for(const keys of [[],[key(0)],[key(0),key(0),key(1)],[key(.1),key(1)],[key(0),{...key(1),zoom:0}],[key(0),{...key(1),fovDeg:180}],[key(0),{...key(1),pitchRad:NaN}]]) assert.throws(()=>createScrollCameraPath(keys),RangeError);
 assert.throws(()=>composeCameraIntent(key(0),{idle:{zoomScale:0}}),RangeError);
 assert.throws(()=>composeCameraIntent(key(0),{idle:{fovScale:10}}),RangeError);
 assert.ok(Object.isFrozen(path)&&path.every(Object.isFrozen));
});
test('arithmetic overflow and malformed prepared paths fail closed',()=>{
 assert.throws(()=>createScrollCameraPath([key(0,1e308),key(1,-1e308)]),RangeError);
 const extreme=createScrollCameraPath([{...key(0),pitchRad:1e308},{...key(1),pitchRad:-1e308}]);
 assert.throws(()=>sampleScrollCamera(extreme,.5),RangeError);
 for(const malformed of [null,undefined,{},[],[key(0)],[key(0),key(1)]]) assert.throws(()=>sampleScrollCamera(malformed,.5),RangeError);
 assert.throws(()=>composeCameraIntent({...key(0),yawRad:1e308},{idle:{yawRad:1e308}}),RangeError);
 assert.throws(()=>composeCameraIntent({...key(0),zoom:1e308},{inspection:{zoomScale:1e308}}),RangeError);
});
