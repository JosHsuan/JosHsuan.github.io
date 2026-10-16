import {createPageFieldRenderer} from '../../components/page-field-renderer.mjs';

/** One document-scoped Layer 1 lease. A case Director can supply its existing
 * frame; a site driver may own frames only when no case has acquired the lease.
 * This service owns neither a camera, WebGL context, clock nor global listener.
 */
export function createBackgroundRuntime({createRenderer=createPageFieldRenderer}={}) {
  let current=null,sequence=0,acquisitions=0,releases=0;
  const history=[];
  const fact=(phase,binding)=>{
    history.push(Object.freeze({id:binding.id,owner:binding.owner,phase}));
    if(history.length>32)history.shift();
  };
  return {
    acquire({owner,canvas,backdrop,publisher}) {
      if(!['site','bending-director'].includes(owner))throw TypeError('Known background owner required');
      if(current)throw Error(`Background already owned by ${current.owner}`);
      if(typeof publisher?.style!=='function')throw TypeError('Background DOM publisher required');
      const field=createRenderer(canvas);
      const binding={id:++sequence,owner,field,disposed:false};
      current=binding;acquisitions++;fact('acquired',binding);
      return {
        present(scene,{frameTimeMs,paused=false,hidden=false,systemReduced=false}={},width,height) {
          if(binding.disposed||current!==binding)return field.inspect();
          const lightField=scene.backdrop;
          // Preserve the existing Director's exact quantization, strings and
          // publication order. Do not alter source-derived scene/material data.
          publisher.style(backdrop,'--backdrop-cool-rgb',lightField.coolRgb.join(' '));
          publisher.style(backdrop,'--backdrop-warm-rgb',lightField.warmRgb.join(' '));
          publisher.style(backdrop,'--backdrop-cool-energy',Math.round(lightField.coolEnergy*100)/100);
          publisher.style(backdrop,'--backdrop-warm-energy',Math.round(lightField.warmEnergy*100)/100);
          publisher.style(backdrop,'--backdrop-warm-x',Math.round(63-lightField.warmSide*45)+'%');
          return field.render({field:scene.field,frameTimeMs,paused,hidden,systemReduced},width,height);
        },
        inspect:()=>field.inspect(),
        dispose() {
          if(binding.disposed)return;binding.disposed=true;
          try{field.dispose();}finally{
            if(current===binding)current=null;releases++;fact('released',binding);
          }
        },
      };
    },
    inspect() {return{owner:current?.owner??null,id:current?.id??null,acquisitions,releases,activeBindings:current?1:0,pageField:current?.field.inspect()??null,history:[...history]};},
  };
}
