import {createExhibitionStage} from './exhibition-stage.mjs';
import {createChapterPlayback,sampleChapterPlayback,PLAYBACK_CHAPTERS} from './chapter-playback.mjs';
import {sampleChapterScene} from './chapter-scene-score.mjs';
import {SCENE_ANCHORS,sampleSceneDirection} from './scene-direction.mjs';
import {Vector2} from 'three';

const chapters={overview:'overview',context:'form',method:'system',adapt:'pattern',assemble:'pattern',join:'pattern',making:'make',credits:'credits'};
/** The same original editorial cyclorama and light palette, owned by XR only.
 * No source mesh/material, global background lease, HDR or clock is acquired.
 */
export function createXRStageEnvironment({bounds}){
 const stage=createExhibitionStage({bounds});
 const buffer={value:new Vector2(1,1)},feather={value:new Vector2(1,1)},extensions=[];
 let report=null,disposed=false,cssFeather=null;
 // Extend only this XR-owned set's three decorative materials. Source meshes,
 // device casing and recorded screen retain their original shaders and alpha.
 stage.group.traverse(node=>{
  if(!node.isMesh||node.userData.sourceGeometry!==false)return;
  for(const material of Array.isArray(node.material)?node.material:[node.material]){
   const original=material.onBeforeCompile,key=material.customProgramCacheKey;
   material.onBeforeCompile=function(shader,renderer){
    original.call(this,shader,renderer);
    shader.uniforms.xrStageBuffer=buffer;shader.uniforms.xrStageFeather=feather;
    shader.fragmentShader=`uniform vec2 xrStageBuffer;\nuniform vec2 xrStageFeather;\n${shader.fragmentShader}`.replace('#include <alphatest_fragment>',`
      // Physical-buffer coordinates preserve the exact source camera aperture.
      // Feather the editorial backdrop into Layer 1, never the source pixels.
      vec2 xrStageEdge = max(vec2(0.0), min(gl_FragCoord.xy, xrStageBuffer - gl_FragCoord.xy) - vec2(0.5));
      vec2 xrStageCoverage = smoothstep(vec2(0.0), xrStageFeather, xrStageEdge);
      diffuseColor.a *= xrStageCoverage.x * xrStageCoverage.y;
      #include <alphatest_fragment>
    `);
   };
   material.customProgramCacheKey=function(){return key.call(this)+'/xr-aperture-edge-v1';};
   extensions.push({material,original,key});
  }
 });
 return{
  group:stage.group,
  update({camera,chapter,bounds:sourceBounds=bounds,viewportWidth,renderView,drawingBuffer}){
   if(disposed)throw Error('XR stage environment has been disposed');
   if(renderView&&drawingBuffer){
    const width=drawingBuffer.width,height=drawingBuffer.height;
    if(![width,height,renderView.width,renderView.height].every(value=>Number.isFinite(value)&&value>0))throw RangeError('Positive actual stage-buffer and CSS aperture dimensions required');
    cssFeather=viewportWidth<800?32:80;
    buffer.value.set(width,height);feather.value.set(cssFeather*width/renderView.width,cssFeather*height/renderView.height);
   }
   const mapped=chapters[chapter]??'overview',index=PLAYBACK_CHAPTERS.findIndex(item=>item.id===mapped);
   const backdrop=sampleChapterScene(sampleChapterPlayback(createChapterPlayback(mapped)),{aspect:camera.aspect,reducedMotion:true}).backdrop;
   report={...stage.update({camera,bounds:sourceBounds,direction:sampleSceneDirection(SCENE_ANCHORS[index]),backdrop}),
    edgeFeather:{owner:'xr-editorial-materials-only',cssPixels:cssFeather,drawingBuffer:buffer.value.toArray(),physicalPixels:feather.value.toArray()}};
   return report;
  },
  inspect:()=>report,
  dispose(){
   if(disposed)return;disposed=true;
   for(const {material,original,key}of extensions){material.onBeforeCompile=original;material.customProgramCacheKey=key;}
   extensions.length=0;stage.dispose();
  },
 };
}
