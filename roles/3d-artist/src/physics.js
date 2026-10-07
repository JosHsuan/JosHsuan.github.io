import RAPIER from '@dimforge/rapier3d-compat';
let ready;
export const initPhysics = () => ready ??= RAPIER.init();
export function createDropWorld(restitution=.15, gravity=9.81) {
  const world = new RAPIER.World({x:0,y:-gravity,z:0});
  world.timestep = 1/60;
  const ground = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  for (const [x,y,z,hx,hy,hz] of [[0,-1.5,0,2.3,.12,1.6],[-2.3,-.95,0,.1,.55,1.6],[2.3,-.95,0,.1,.55,1.6],[0,-.95,-1.6,2.3,.55,.1],[0,-.95,1.6,2.3,.55,.1]]) world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setTranslation(x,y,z).setRestitution(restitution).setFriction(.5),ground);
  const bodies = Array.from({length:12}, (_,i) => {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation((i%4-1.5)*.72, .2+Math.floor(i/4)*.8, ((i%3)-1)*.45).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.ball(.25).setRestitution(restitution).setFriction(.5),body); return body;
  });
  let accumulator=0, steps=0;
  return { bodies, world, advance(delta) { accumulator += Math.min(delta,5/60); let taken=0; while(accumulator>=1/60 && taken<5) {world.step();accumulator-=1/60;taken++;steps++;} return taken; }, get steps(){return steps;}, dispose(){world.free();} };
}
