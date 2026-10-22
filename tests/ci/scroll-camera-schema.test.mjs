import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertProjectStudies} from '../../scripts/project-studies.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const record=JSON.parse(await readFile(new URL('project-studies.json',root))),manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
test('build schema accepts authored paths and rejects invalid or cropped camera contracts',()=>{
 assert.doesNotThrow(()=>assertProjectStudies(record,manifest));
 for(const mutate of [
  model=>{delete model.cameraPath;},
  model=>{model.cameraPath[1].yawRad=NaN;},
  model=>{model.cameraPath[1].zoom=.9;},
  model=>{model.cameraPath[1].fovDeg=180;},
  model=>{model.cameraPath[1].pitchRad=2;},
  model=>{model.cameraPath[1].chapter='making';},
  model=>{model.cameraPath[1]={...model.cameraPath[0]};},
  model=>{model.cameraPath.at(-1).progress=.9;},
 ]){const copy=structuredClone(record);mutate(copy.projects[0].model);assert.throws(()=>assertProjectStudies(copy,manifest));}
});
