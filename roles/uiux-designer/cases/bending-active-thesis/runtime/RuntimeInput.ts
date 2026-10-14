import {EventManager} from './core/EventManager.ts';
import {StateStore} from './core/StateStore.ts';
import {FrameStore} from './core/FrameStore.ts';
import {TransactionEngine} from './core/TransactionEngine.ts';
import {CommandRouter} from './core/CommandRouter.ts';
import type {CommandMap,InteractionPatch,RuntimeEvents} from './contracts/commands.ts';
import {initialState} from './contracts/state.ts';
import {DOMPresenter} from './presentation/DOMPresenter.ts';

/** Discrete command state and latest presentation data have separate lifetimes. */
export function createRuntimeInput(){
  const events=new EventManager<RuntimeEvents>(),state=new StateStore(),frames=new FrameStore(),dom=new DOMPresenter();
  const transactions=new TransactionEngine(state,events),commands=new CommandRouter<CommandMap>(transactions);
  const scope=events.createScope('kernel-commands');
  commands.register(scope,'preferences','preferences.apply',payload=>({patch:payload}));
  commands.register(scope,'model','model.interact',payload=>{
    for(const key of Object.keys(payload))if(!['modelEngaged','modelRecovering','modelInteractionChapter','modelHeldSource','sourceSelection'].includes(key))throw Error(`Model cannot change ${key}`);
    return{patch:payload};
  });
  commands.register(scope,'model','model.select',payload=>({patch:{sourceSelection:{chapterId:payload.chapterId,index:payload.index,selectedAt:payload.selectedAt},
    modelEngaged:false,modelRecovering:payload.modelRecovering??false,modelInteractionChapter:payload.chapterId,modelHeldSource:null}}));
  frames.publish({...state.get(),stateVersion:state.version});
  const unsubscribe=state.subscribe(value=>value,current=>{frames.publish({...current,stateVersion:state.version});frames.notify();});
  const get=()=>frames.get();
  const publishFrame=(patch:Record<string,unknown>)=>{
    for(const key of Object.keys(patch))if(Object.hasOwn(initialState,key))throw Error(`Frame data cannot change state field ${key}`);
    frames.publish(patch);frames.notify();
  };
  const updateInteraction=(patch:InteractionPatch&{modelHover?:unknown})=>{
    const {modelHover,...discrete}=patch;
    if(Object.keys(discrete).length){const result=commands.execute('model.interact',discrete);if(result.status==='rejected')throw Error(result.reason);}
    publishFrame({...(modelHover!==undefined?{modelHover}:{}),inspectionRevision:Number(get().inspectionRevision??0)+1});
  };
  return{events,state,commands,frames,dom,get,publishFrame,updateInteraction,
    subscribe:(listener:()=>void)=>frames.subscribe(listener),
    getPresentation:()=>frames.getPresentation(),markPresented:(frame:number,chapter:string)=>frames.markPresented(frame,chapter),
    invalidateLayout:(reason:string,resumed=true)=>events.emit('layoutInvalidated',{reason,resumed}),
    inspect:()=>({events:events.inspect(),state:state.inspect(),frame:frames.inspect(),commands:commands.inspect()}),
    dispose(){unsubscribe();frames.dispose();state.dispose();events.dispose();},
  };
}
