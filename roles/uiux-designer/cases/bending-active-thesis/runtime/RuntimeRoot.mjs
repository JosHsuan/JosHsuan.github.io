import {createRuntimeInput} from './RuntimeInput.ts';
import {FeatureRegistry} from './core/FeatureRegistry.ts';
import {Registrar} from './core/Registrar.ts';
import {createModelManager} from './features/ModelManager.mjs';
import {createDiagramManager} from './features/DiagramManager.mjs';
import {createEvidenceManager} from './features/EvidenceManager.mjs';
import {createLifecycleManager} from './features/LifecycleManager.mjs';
import {createReadingManager} from './features/ReadingManager.mjs';
import {createExperienceDirector} from './orchestration/ExperienceDirector.mjs';

/** A closed feature catalog; factories are pure and scene code stays dynamically loaded. */
export function createRuntimeRoot(){
 const input=createRuntimeInput(),registry=new FeatureRegistry(),kernelDispose=input.dispose;
 let query=null;
 input.scene={hitTest:(x,y)=>query?.(x,y)??null,bindHitTest(callback){query=callback;return()=>{if(query===callback)query=null;};}};
 registry.register({id:'kernel',create:()=>({input,dispose:kernelDispose})});
 for(const [id,factory] of [['model',createModelManager],['diagram',createDiagramManager],['evidence',createEvidenceManager],['lifecycle',createLifecycleManager],['reading',createReadingManager],['director',createExperienceDirector]]){
  registry.register({id,requires:['kernel'],create:(_context,services)=>options=>{
   const kernel=services.get('kernel').input;return factory({input:kernel,events:kernel.events,...options});
  }});
 }
 registry.register({id:'scene',requires:['kernel'],create:()=>({factory,...options})=>factory({input,...options})});
 const registrar=new Registrar(registry,{});registrar.start();
 input.features={create:(id,options)=>registrar.get(id)(options),connect:(label,setup)=>registrar.connect(label,()=>{
  const checkpoint=input.events.checkpoint();try{return setup();}catch(error){input.events.rollback(checkpoint);throw error;}
 }),inspect:()=>registrar.inspect()};
 input.stop=()=>registrar.stop();
 input.dispose=()=>registrar.dispose();
 return input;
}
