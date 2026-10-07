import * as T from 'three';
import {createInspectionMaterial} from './inspection-material.js';

// Original material specimens; not an owner's project geometry.
function ribbonGeometry(index){
 const positions=[],uvs=[],indices=[],segments=96;
 for(let i=0;i<=segments;i++){
  const u=i/segments,x=(u-.5)*4.3,y=Math.sin(u*Math.PI)*(.6+index*.10)-.85+index*.22,z=(index-2)*.42;
  for(const [side,depth]of[[-1,-1],[1,-1],[1,1],[-1,1]]){positions.push(x,y+depth*.025,z+side*.135);uvs.push(u,(side+1)/2);}
 }
 for(let i=0;i<segments;i++)for(let face=0;face<4;face++){const a=i*4+face,b=i*4+(face+1)%4,c=b+4,d=a+4;indices.push(a,b,d,b,c,d);}
 indices.push(0,2,1,0,3,2,segments*4,segments*4+1,segments*4+2,segments*4,segments*4+2,segments*4+3);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createMaterialFixture(){
 const group=new T.Group(),strips=new T.Group(),swatch=new T.Group();group.add(strips,swatch);group.visible=false;
 const bounds={min:[-2.15,-.92,-1],max:[2.15,1.35,1]},adapters=[];
 for(let i=0;i<5;i++){const adapter=createInspectionMaterial({bounds,grainAmount:.27});adapters.push(adapter);strips.add(new T.Mesh(ribbonGeometry(i),adapter.material));}
 const base=new T.MeshStandardMaterial({color:'#ffffff',metalness:0,roughness:.65,side:T.DoubleSide}),pbr=base.clone();
 const tile=new T.Mesh(new T.PlaneGeometry(3.5,3.5,1,1),base);swatch.add(tile);swatch.position.y=.2;
 const backplate=new T.Mesh(new T.BoxGeometry(3.62,3.62,.08),new T.MeshStandardMaterial({color:'#444a48',roughness:.7}));backplate.position.set(0,.2,-.06);swatch.add(backplate);
 let maps=[],ready,disposed=false;
 return{group,adapters,
  load(){return ready??=Promise.all(['diff','nor_gl','rough'].map(channel=>new T.TextureLoader().loadAsync(`/assets/textures/bamboo_wall_${channel}_1k.jpg`).then(t=>{if(disposed)t.dispose();else maps.push(t);return t;}))).then(textures=>{if(disposed)return;const[color,normal,roughness]=textures;color.colorSpace=T.SRGBColorSpace;normal.colorSpace=roughness.colorSpace=T.NoColorSpace;for(const t of textures){t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;}base.map=color;base.needsUpdate=true;pbr.map=color;pbr.normalMap=normal;pbr.normalScale.setScalar(.45);pbr.roughnessMap=roughness;pbr.roughness=.85;pbr.needsUpdate=true;});},
  apply(p,id,variant){const enabled=['bamboo-grain','bamboo-pbr','surface-contours','surface-focus'].includes(id);group.visible=enabled;if(!enabled)return;
   swatch.visible=id==='bamboo-pbr';strips.visible=!swatch.visible;
   const mode=variant==='a'?'material':id==='bamboo-grain'?'grain':id==='surface-contours'?'contours':id==='surface-focus'?'focus':'material';
   adapters.forEach(a=>a.update({mode,progress:p.materialProgress}));
   tile.material=variant==='b'?pbr:base;
  },
  inspect(){return adapters[0].inspect();},
  dispose(){disposed=true;for(const t of maps)t.dispose();base.dispose();pbr.dispose();},
 };
}
