import {BufferAttribute} from 'three';

/** Derive grain coordinates from the pinned mesh's connected four-corner
 * sweeps. Original position, normal and index buffers are never rewritten.
 * Each connected sweep has its own arc length and stable natural variation.
 * No world-axis projection can accidentally run grain across a curved strip. */
export function deriveXRBambooCoordinates(geometry){
 const position=geometry.getAttribute('position'),index=geometry.index;
 if(!position||!index||position.count%4||index.count%6)return null;
 const count=position.count,parents=Int32Array.from({length:count},(_,i)=>i);
 const find=value=>{let root=value;while(parents[root]!==root)root=parents[root];while(parents[value]!==value){const next=parents[value];parents[value]=root;value=next;}return root;};
 for(let i=0;i<index.count;i+=3){const a=find(index.getX(i));parents[find(index.getX(i+1))]=a;parents[find(index.getX(i+2))]=a;}
 const components=new Map();
 for(let i=0;i<count;i++){const id=find(i);let component=components.get(id);if(!component){component=[];components.set(id,component);}component.push(i);}
 const coordinates=new Float32Array(count*4),radial=[[1,0],[0,1],[-1,0],[0,-1]];
 let componentIndex=0,minLength=Infinity,maxLength=0;
 for(const vertices of components.values()){
  if(vertices.length<8||vertices.length%4||vertices.some((value,i)=>value!==vertices[0]+i))return null;
  let length=0,previous=null;
  const seed=((componentIndex+1)*.6180339887498949)%1;
  for(let i=0;i<vertices.length;i+=4){
   const center=[0,0,0];
   for(let j=0;j<4;j++){const vertex=vertices[i+j];center[0]+=position.getX(vertex)/4;center[1]+=position.getY(vertex)/4;center[2]+=position.getZ(vertex)/4;}
   if(previous)length+=Math.hypot(...center.map((value,axis)=>value-previous[axis]));
   for(let j=0;j<4;j++)coordinates.set([length,...radial[j],seed],vertices[i+j]*4);
   previous=center;
  }
  if(!(length>0))return null;
  minLength=Math.min(minLength,length);maxLength=Math.max(maxLength,length);componentIndex++;
 }
 // Every source quad must connect adjacent four-corner rings, or close one
 // ring. An unrelated mesh must not silently receive a bamboo projection.
 const closedSweeps=new Set();
 for(let i=0;i<index.count;i+=6){
  const q=[index.getX(i),index.getX(i+1),index.getX(i+2),index.getX(i+5)];
  if(index.getX(i+3)!==q[0]||index.getX(i+4)!==q[2]||new Set(q).size!==4)return null;
  const component=components.get(find(q[0])),base=component[0],rings=q.map(value=>Math.floor((value-base)/4)),unique=[...new Set(rings)];
  if(unique.length>2)return null;
  if(unique.length===2&&Math.abs(unique[0]-unique[1])!==1){
   if(Math.min(...unique)!==0||Math.max(...unique)!==component.length/4-1)return null;
   closedSweeps.add(base);
  }
 }
 return{attribute:new BufferAttribute(coordinates,4),sweeps:components.size,closedSweeps:closedSweeps.size,minLength,maxLength,bytes:coordinates.byteLength};
}

const fragmentPrelude=`
varying vec4 vXRBamboo;
float xrBambooVisibility(float phase) {
 // Fade subpixel grain instead of introducing moire on thin distant strips.
 return 1.0 - smoothstep(0.75, 3.141593, fwidth(phase));
}
`;

/** Presentation clone informed by physical-capture.webp / physical-assembly.webp:
 * pale warm bamboo, longitudinal fibres and a soft dry-satin highlight. These
 * are bounded procedural cues, not a measured texture scan or extra geometry.
 * The existing PBR light, tone-mapping and double-sided source path stay intact. */
export function installXRBambooAppearance(root){
 const records=[],materials=new Map();let sweeps=0,closedSweeps=0,coordinateBytes=0,disposed=false;
 root.traverse(node=>{
  if(!node.isMesh)return;
  const geometry=node.geometry,derived=deriveXRBambooCoordinates(geometry);
  // Tiny synthetic renderer fixtures and unknown topology keep their source
  // recipe; the pinned production-source test requires all 384 mapped sweeps.
  if(!derived)return;
  const previousAttribute=geometry.getAttribute('xrBambooCoordinate'),original=node.material;
  geometry.setAttribute('xrBambooCoordinate',derived.attribute);sweeps+=derived.sweeps;closedSweeps+=derived.closedSweeps;coordinateBytes+=derived.bytes;
  const clone=source=>{
   if(materials.has(source))return materials.get(source);
   const material=source.clone();material.name='XR bamboo — photograph-informed fibre';material.roughness=.61;material.metalness=0;
   const originalCompile=source.onBeforeCompile;
   material.onBeforeCompile=function(shader,renderer){
    originalCompile.call(this,shader,renderer);
    shader.vertexShader=`attribute vec4 xrBambooCoordinate;\nvarying vec4 vXRBamboo;\n${shader.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nvXRBamboo = xrBambooCoordinate;');
    shader.fragmentShader=fragmentPrelude+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      // Grain follows the same perimeter coordinate along each curved sweep;
      // no length-dependent texture seam appears on the 96 closed strips.
      float xrDrift = sin(vXRBamboo.w * 6.283185) * 0.16;
      float xrPhaseA = dot(vXRBamboo.yz, vec2(38.0, 23.0)) + xrDrift;
      float xrPhaseB = dot(vXRBamboo.yz, vec2(83.0, -47.0)) + xrDrift * 1.7;
      float xrAA = xrBambooVisibility(xrPhaseA), xrAB = xrBambooVisibility(xrPhaseB);
      float xrFibre = 0.64 * sin(xrPhaseA) * xrAA + 0.36 * sin(xrPhaseB) * xrAB;
      float xrNaturalTone = 0.94 + vXRBamboo.w * 0.12;
      diffuseColor.rgb *= xrNaturalTone * (1.0 + xrFibre * 0.055);
    `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor = clamp(roughnessFactor + xrFibre * 0.055 + (vXRBamboo.w - 0.5) * 0.07, 0.48, 0.74);
    `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      // A 25 micrometre fibre relief changes only shading normals. Physical
      // source positions, source normals, silhouettes and hit rays stay exact.
      // Differentiate the analytic phases, never the derivative-based AA mask.
      vec2 xrDh = 0.000025 * (0.64 * cos(xrPhaseA) * xrAA * vec2(dFdx(xrPhaseA), dFdy(xrPhaseA))
                    + 0.36 * cos(xrPhaseB) * xrAB * vec2(dFdx(xrPhaseB), dFdy(xrPhaseB)));
      vec3 xrSigmaX = dFdx(-vViewPosition), xrSigmaY = dFdy(-vViewPosition);
      vec3 xrR1 = cross(xrSigmaY, normal), xrR2 = cross(normal, xrSigmaX);
      float xrDet = dot(xrSigmaX, xrR1) * faceDirection;
      vec3 xrGradient = sign(xrDet) * (xrDh.x * xrR1 + xrDh.y * xrR2);
      if(abs(xrDet) > 0.000000000001) normal = normalize(abs(xrDet) * normal - xrGradient);
    `);
   };
   material.customProgramCacheKey=()=>source.customProgramCacheKey()+'/xr-bamboo-source-sweeps-v1';materials.set(source,material);return material;
  };
  node.material=Array.isArray(original)?original.map(clone):clone(original);records.push({node,geometry,original,previousAttribute});
 });
 return{
  inspect:()=>({recipe:'source-sweep-bamboo-v1',references:['/assets/xr/physical-capture.webp','/assets/xr/physical-assembly.webp','/assets/xr/physical-result.webp'],sweeps,closedSweeps,coordinateBytes,materials:materials.size,roughness:.61,metalness:0,reliefMetres:.000025,sourceGeometryChanged:false,bitmapTextures:0,disposed}),
  dispose(){if(disposed)return;disposed=true;for(const {node,geometry,original,previousAttribute}of records){node.material=original;if(previousAttribute)geometry.setAttribute('xrBambooCoordinate',previousAttribute);else geometry.deleteAttribute('xrBambooCoordinate');}for(const material of materials.values())material.dispose();records.length=0;materials.clear();},
 };
}
