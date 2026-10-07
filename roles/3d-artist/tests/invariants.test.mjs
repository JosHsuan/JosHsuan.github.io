import test from 'node:test';
import assert from 'node:assert/strict';
import {seedParticles,writeParticles} from '../src/particles.js';
import {initPhysics,createDropWorld} from '../src/physics.js';
import {parseReview,parseUIUX,emptyReview} from '../src/review.js';
test('particles: deterministic seed/time, changed seed, finite bounded positions',()=>{
 const seed=seedParticles(3000,17),a=writeParticles(new Float32Array(9000),seed,4,1),b=writeParticles(new Float32Array(9000),seedParticles(3000,17),4,1);
 assert.deepEqual(a,b);assert.notDeepEqual(seed,seedParticles(3000,18));assert(a.every(Number.isFinite));assert(a.every(v=>Math.abs(v)<2));
});
test('physics: same steps at 30/60/120 Hz; ground collision prevents penetration',async()=>{
 await initPhysics();const simulations=[30,60,120].map(()=>createDropWorld(.15,9.81));
 try{[30,60,120].forEach((hz,i)=>{for(let j=0;j<hz*4;j++)simulations[i].advance(1/hz);});const positions=simulations.map(s=>s.bodies.map(b=>b.translation()));assert.deepEqual(positions[0],positions[1]);assert.deepEqual(positions[1],positions[2]);for(const s of simulations){assert.equal(s.steps,240);for(const p of s.bodies.map(b=>b.translation())){assert(p.y>-1.16&&p.y<3);assert(Math.abs(p.x)<2.5);}}}finally{simulations.forEach(s=>s.dispose());}
});
test('physics: restitution changes contact trajectory; catch-up is bounded',async()=>{
 await initPhysics();const a=createDropWorld(0,9.81),b=createDropWorld(.9,9.81);try{for(let i=0;i<90;i++){a.advance(1/60);b.advance(1/60);}assert.notDeepEqual(a.bodies.map(x=>x.translation()),b.bodies.map(x=>x.translation()));assert(a.advance(30)<=5);}finally{a.dispose();b.dispose();}
});
test('review rejects malformed or non-finite parameters; UIUX unknown IDs preserved',()=>{
 assert.deepEqual(parseReview(emptyReview()),emptyReview());assert.throws(()=>parseReview({...emptyReview(),saved:[{id:'camera',params:{lens:Infinity}}]}));assert.throws(()=>parseReview({...emptyReview(),role:'uiux-designer'}));
 const basis=parseUIUX({schemaVersion:1,role:'uiux-designer',exportedAt:'2026-10-07T10:00:00Z',saved:[{id:'unknown-historical-id',name:'Historical',note:'Keep this',sources:[]}]});assert.equal(basis.saved[0].id,'unknown-historical-id');assert.equal(basis.saved[0].idStatus,'unresolved historical ID');assert.equal(basis.notes['unknown-historical-id'],'Keep this');
});
