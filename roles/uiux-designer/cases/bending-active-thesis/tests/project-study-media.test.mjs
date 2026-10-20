import test from 'node:test';
import assert from 'node:assert/strict';
import {projectStudyEvidence} from '../components/project-study-media.mjs';

const image=src=>({src});
test('a later background image and every fallback poster are excluded from earlier 2D photographs',()=>{
 const project={hero:image('opening'),model:{poster:image('model-poster')},
  motionMedia:[{chapter:'making',poster:image('movie-poster')}],sections:[
   {id:'context',media:[image('context'),image('result'),image('model-poster'),image('movie-poster'),image('detail')]},
   {id:'making',media:[image('process-still'),image('detail'),image('other-detail')]},
   {id:'results',media:[image('result')]}]};
 const selected=projectStudyEvidence(project);
 assert.deepEqual(selected.get('context').map(item=>item.src),['detail']);
 assert.deepEqual(selected.get('making').map(item=>item.src),['process-still','other-detail']);
 assert.deepEqual(selected.get('results'),[]);
});

test('a movie whose poster is the same photograph does not repeat it in the information band',()=>{
 const still=image('source-frame'),project={hero:image('opening'),motionMedia:[{chapter:'making',poster:still}],
  sections:[{id:'making',media:[still,image('different-detail')]}]};
 assert.deepEqual(projectStudyEvidence(project).get('making').map(item=>item.src),['different-detail']);
 assert.deepEqual(project.sections[0].media,[still,image('different-detail')],'Source records are not destructively filtered');
});
