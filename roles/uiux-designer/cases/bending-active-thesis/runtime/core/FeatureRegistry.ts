export type FeatureDefinition<Context> = {id:string;requires?:readonly string[];create:(context:Context,services:ReadonlyMap<string,unknown>)=>unknown};

export class FeatureRegistry<Context> {
  private definitions=new Map<string,FeatureDefinition<Context>>();
  register(definition:FeatureDefinition<Context>){
    if(this.definitions.has(definition.id))throw Error(`Duplicate feature ${definition.id}`);
    this.definitions.set(definition.id,definition);return this;
  }
  order(){
    const result:FeatureDefinition<Context>[]=[],visiting=new Set<string>(),visited=new Set<string>();
    const visit=(id:string)=>{
      if(visited.has(id))return;
      if(visiting.has(id))throw Error(`Cyclic feature dependency ${id}`);
      const definition=this.definitions.get(id);if(!definition)throw Error(`Missing feature ${id}`);
      visiting.add(id);for(const dependency of definition.requires??[])visit(dependency);
      visiting.delete(id);visited.add(id);result.push(definition);
    };
    for(const id of this.definitions.keys())visit(id);return result;
  }
}
