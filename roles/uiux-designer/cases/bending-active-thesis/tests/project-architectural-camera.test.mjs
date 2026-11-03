import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {fitResearchCamera} from '../components/research-scene-geometry.mjs';
const projects=JSON.parse(await readFile(new URL('../release/project-studies.json',import.meta.url),'utf8')).projects;

test('the two architectural openings keep a human-height eye above their actual source base',()=>{
 for(const id of ['entrance-installation-art','project-caschlatsch']){
  const {model}=projects.find(project=>project.id===id),support=[];
  for(const x of [model.bounds.min[0],model.bounds.max[0]])for(const y of [model.bounds.min[1],model.bounds.max[1]])for(const z of [model.bounds.min[2],model.bounds.max[2]])support.push(x,y,z);
  for(const [width,height] of [[1440,900],[390,844]]){
   // Match the production study aperture, not the full browser rectangle.
   const slot=width>=800?{width:.51,height:.78}:{width:.94,height:.45};
   const aspect=width*slot.width/(height*slot.height);
   const start=model.cameraPath[0],end=model.cameraPath.at(-1);
   const fit=key=>fitResearchCamera(support,aspect,{yaw:key.yawRad,pitch:key.pitchRad,fov:key.fovDeg,zoom:key.zoom});
   const firstEye=fit(start).position[1]-model.bounds.min[1],lastEye=fit(end).position[1]-model.bounds.min[1];
   assert.ok(firstEye>=1.5&&firstEye<=1.9,id+' human-height opening');
   assert.ok(lastEye>firstEye&&lastEye<model.bounds.max[1]-model.bounds.min[1],id+' rising exterior sweep');
   assert.ok(start.fovDeg>end.fovDeg,'wider establishing lens to longer closing lens');
  }
 }
});
