import type {RuntimeState} from '../contracts/state.ts';
import type {RuntimeEvents} from '../contracts/commands.ts';
import type {EventManager} from './EventManager.ts';
import type {StateStore} from './StateStore.ts';

export type Transition = {patch:Partial<RuntimeState>;effects?: (()=>void)[]};
export class CommittedEffectError extends Error {
  readonly version:number;
  constructor(version:number,error:unknown){super(error instanceof Error?error.message:String(error));this.version=version;}
}
export class TransactionEngine {
  readonly state: StateStore;
  private events: EventManager<RuntimeEvents>;
  private publishing=false;
  private queue:(()=>void)[]=[];
  constructor(state:StateStore,events:EventManager<RuntimeEvents>){this.state=state;this.events=events;}
  get busy(){return this.publishing;}
  defer(work:()=>void){this.queue.push(work);}
  apply(transition:Transition){
    this.publishing=true;
    try{
      const change=this.state.commit(transition.patch);
      if(change){
        this.events.emit('stateChanged',change);
        if(JSON.stringify(change.previous.sourceSelection)!==JSON.stringify(change.current.sourceSelection))this.events.emit('representationChanged',{selection:change.current.sourceSelection,version:change.version});
      }
      for(const effect of transition.effects??[]){try{effect();}catch(error){throw new CommittedEffectError(this.state.version,error);}}
      return this.state.version;
    }finally{
      this.publishing=false;
      while(this.queue.length)this.queue.shift()!();
    }
  }
}
