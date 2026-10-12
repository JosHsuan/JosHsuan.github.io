import type {DisposableScope,Disposable} from './DisposableScope.ts';
import type {RuntimeState} from '../contracts/state.ts';
import {CommittedEffectError,type TransactionEngine,type Transition} from './TransactionEngine.ts';

export type CommandResult = {status:'accepted';version:number}|{status:'rejected';reason:string}|{status:'queued'}|{status:'failed';version:number;committed:true;reason:string};
export class CommandRouter<Commands extends object> {
  private handlers=new Map<keyof Commands,{owner:string;prepare:(payload:unknown,state:RuntimeState)=>Transition}>();
  private transactions:TransactionEngine;
  constructor(transactions:TransactionEngine){this.transactions=transactions;}
  register<K extends keyof Commands>(scope:DisposableScope,owner:string,type:K,prepare:(payload:Commands[K],state:RuntimeState)=>Transition):Disposable{
    scope.assertLive();if(this.handlers.has(type))throw Error(`Command already owned: ${String(type)}`);
    const handler={owner,prepare:prepare as (payload:unknown,state:RuntimeState)=>Transition};this.handlers.set(type,handler);
    return scope.add(()=>{if(this.handlers.get(type)===handler)this.handlers.delete(type);});
  }
  execute<K extends keyof Commands>(type:K,payload:Commands[K]):CommandResult{
    if(this.transactions.busy){this.transactions.defer(()=>this.execute(type,payload));return{status:'queued'};}
    const handler=this.handlers.get(type);if(!handler)return{status:'rejected',reason:`No command owner: ${String(type)}`};
    try{return{status:'accepted',version:this.transactions.apply(handler.prepare(payload,this.transactions.state.get()))};}
    catch(error){return error instanceof CommittedEffectError?{status:'failed',version:error.version,committed:true,reason:error.message}:{status:'rejected',reason:error instanceof Error?error.message:String(error)};}
  }
  inspect(){return{commands:[...this.handlers].map(([type,entry])=>({type,owner:entry.owner}))};}
}
