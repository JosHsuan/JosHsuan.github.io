import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assertProjectStudies,assertProjectAssetRecord,assertProjectModel,projectStudyModels} from '../../scripts/project-studies.mjs';

const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name+'.json',release),'utf8'));
const fixture=()=>({studies:read('project-studies'),assets:read('project-assets'),manifest:read('manifest')});
const validate=({studies,assets,manifest})=>assertProjectAssetRecord(assets,assertProjectStudies(studies,manifest),manifest,studies);

test('machine and architectural source additions keep exact bytes, original unit and separate chapter ownership',()=>{
  const current=fixture();validate(current);
  const mode=current.studies.projects.find(project=>project.id==='mode-s-of-making');
  const caschlatsch=current.studies.projects.find(project=>project.id==='project-caschlatsch');
  assert.equal(mode.model.sha256,'0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0');
  assert.deepEqual(mode.model.chapters,['context','system']);
  assert.deepEqual(mode.additionalModels[0].chapters,['mechanism']);
  assert.deepEqual(mode.sections.slice(0,4).map(section=>section.id),['context','system','mechanism','making']);
  assert.deepEqual(caschlatsch.model.chapters,['context','system']);
  for(const model of [mode.additionalModels[0],caschlatsch.model]){
    const bytes=readFileSync(new URL('public'+model.src,release));
    assert.equal(bytes.length,model.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),model.sha256);
    assertProjectModel(bytes,model);
  }
  assert.equal(projectStudyModels(mode).length,2);
});

test('additional source cannot overlap a chapter, escape its project, or lose matching provenance',()=>{
  for(const mutate of [
    current=>{const machine=current.studies.projects[0].additionalModels[0];machine.chapters=['system'];machine.views={system:machine.views.mechanism};machine.cameraPath.forEach(key=>key.chapter='system');},
    current=>{current.studies.projects[0].additionalModels[0].src='/assets/projects/project-caschlatsch/model.glb';},
    current=>{current.assets.models=current.assets.models.filter(model=>!model.src.endsWith('/machine-materials.glb'));},
    current=>{current.manifest.assets=current.manifest.assets.filter(asset=>!asset.path.endsWith('/machine-materials.glb'));},
    current=>{delete current.studies.projects[0].model;},
  ]){const current=fixture();mutate(current);assert.throws(()=>validate(current));}
});

test('architectural low-eye paths remain bounded and do not loosen the product model range',()=>{
  const current=fixture();validate(current);
  current.studies.projects.find(project=>project.id==='project-caschlatsch').model.cameraPath[0].pitchRad=-.17;
  assert.throws(()=>validate(current),/complete source framing/);
  const product=fixture();product.studies.projects[0].model.cameraPath[0].pitchRad=-.14;
  assert.throws(()=>validate(product),/complete source framing/);
});
