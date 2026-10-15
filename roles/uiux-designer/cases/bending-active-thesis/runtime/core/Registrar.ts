import type {FeatureRegistry} from './FeatureRegistry.ts';

export class Registrar<Context> {
  private registry:FeatureRegistry<Context>;
  private context:Context;
  private services=new Map<string,unknown>();
  private connections=new Set<{label:string;release:()=>void}>();
  private started=false;
  private closed=false;
  private stopping=false;
  private connectionEpoch=0;
  private setups=0;
  constructor(registry:FeatureRegistry<Context>,context:Context){this.registry=registry;this.context=context;}
  start(){
    if(this.closed)throw Error('Registrar is disposed');
    if(this.started)return;
    try{for(const definition of this.registry.order())this.services.set(definition.id,definition.create(this.context,this.services));this.started=true;}
    catch(error){
      const errors=this.releaseServices();
      if(errors.length)throw new AggregateError([error,...errors],'Feature startup and rollback failed',{cause:error});
      throw error;
    }
  }
  get<T>(id:string):T{this.start();if(!this.services.has(id))throw Error(`Unknown service ${id}`);return this.services.get(id) as T;}
  connect(label:string,setup:()=>void|(()=>void)){
    if(this.stopping)throw Error('Cannot connect during runtime stop');
    this.start();const epoch=this.connectionEpoch;let active=true,cleanup:(()=>void)|undefined;
    const connection={label,release:()=>{if(!active)return;active=false;this.connections.delete(connection);cleanup?.();}};
    const errors:unknown[]=[];this.setups++;
    try{cleanup=setup()??undefined;if(this.closed||epoch!==this.connectionEpoch)connection.release();else this.connections.add(connection);}
    catch(error){errors.push(error);try{connection.release();}catch(cleanupError){errors.push(cleanupError);}}
    finally{
      this.setups--;
      // Disposal may be requested inside setup before its cleanup exists. Keep
      // dependencies alive until that last synchronous owner can release them.
      if(this.closed&&!this.stopping&&this.setups===0){try{this.stop();}catch(error){errors.push(error);}}
    }
    if(errors.length===1)throw errors[0];
    if(errors.length)throw new AggregateError(errors,'Feature setup and cleanup failed',{cause:errors[0]});
    return connection.release;
  }
  private releaseServices(){
    const errors:unknown[]=[];
    for(const service of [...this.services.values()].reverse()){
      try{(service as {dispose?:()=>void})?.dispose?.();}catch(error){errors.push(error);}
    }
    this.services.clear();this.started=false;return errors;
  }
  stop(){
    if(this.stopping)return;
    this.stopping=true;this.connectionEpoch++;
    const errors:unknown[]=[];
    try{for(const connection of [...this.connections].reverse()){
      try{connection.release();}catch(error){errors.push(error);}
    }}finally{
      // A terminal observer may request permanent disposal during stop. Its
      // services must outlive every remaining connection, including setup work.
      if(this.closed&&this.setups===0)errors.push(...this.releaseServices());
      this.stopping=false;
    }
    if(errors.length)throw new AggregateError(errors,'Feature connection cleanup failed');
  }
  dispose(){
    if(this.closed)return;this.closed=true;
    const errors:unknown[]=[];
    try{this.stop();}catch(error){errors.push(error);}
    if(errors.length)throw new AggregateError(errors,'Feature runtime cleanup failed');
  }
  inspect(){return{services:[...this.services.keys()],connections:[...this.connections].map(value=>value.label)};}
}
