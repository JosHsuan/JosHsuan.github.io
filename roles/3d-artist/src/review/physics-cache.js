import {initPhysics,createDropWorld} from '../physics.js';
let pending;
export function preparePhysics(){return pending??=(async()=>{await initPhysics();const data={};for(const [variant,restitution]of[['a',.08],['b',.85]]){const sim=createDropWorld(restitution);try{const frames=[];for(let i=0;i<=240;i++){frames.push(sim.bodies.map(b=>{const p=b.translation();return[p.x,p.y,p.z];}));if(i<240)sim.advance(1/60);}data[variant]=frames;}finally{sim.dispose();}}return data;})();}
