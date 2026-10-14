import {initialState,validateState,type RuntimeState} from '../contracts/state.ts';

export class StateStore {
  private state: RuntimeState;
  private revision=0;
  private listeners=new Set<(current:RuntimeState,previous:RuntimeState)=>void>();
  private onError:(error:unknown)=>void;
  constructor(state:RuntimeState=initialState,onError:(error:unknown)=>void=error=>console.error('State observer failed',error)){this.state=validateState(state);this.onError=onError;}
  get(){return this.state;}
  get version(){return this.revision;}
  commit(patch:Partial<RuntimeState>){
    const next=validateState({...this.state,...patch});
    const changed=(Object.keys(next) as (keyof RuntimeState)[]).some(key=>key==='sourceSelection'||key==='modelHeldSource'?
      JSON.stringify(next[key])!==JSON.stringify(this.state[key]):!Object.is(next[key],this.state[key]));
    if(!changed)return null;
    const previous=this.state;this.state=next;this.revision++;
    for(const listener of [...this.listeners])if(this.listeners.has(listener)){try{listener(next,previous);}catch(error){this.onError(error);}}
    return{version:this.revision,previous,current:next};
  }
  subscribe<T>(selector:(state:RuntimeState)=>T,callback:(next:T,previous:T)=>void,equal:(a:T,b:T)=>boolean=Object.is){
    let previous=selector(this.state);
    const listener=(state:RuntimeState)=>{const next=selector(state);if(!equal(next,previous)){const old=previous;previous=next;callback(next,old);}};
    this.listeners.add(listener);return()=>this.listeners.delete(listener);
  }
  inspect(){return{version:this.revision,subscriptions:this.listeners.size};}
  dispose(){this.listeners.clear();}
}
