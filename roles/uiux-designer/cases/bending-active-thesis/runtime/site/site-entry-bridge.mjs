/** Discrete case-entry facts only. The case Director remains its sole clock. */
let current=null;
const listeners=new Set();
export function publishSceneEntry(fact){
 if(!fact||!Number.isInteger(fact.id))return;
 if(current?.id!==fact.id)current={id:fact.id,facts:[]};
 if(current.facts.at(-1)?.phase===fact.phase)return;
 const value=Object.freeze({...fact});current.facts.push(value);
 if(current.facts.length>24)current.facts.shift();
 for(const listener of [...listeners])if(listeners.has(listener))listener(value);
}
export function subscribeSceneEntry(listener){
 listeners.add(listener);
 if(current)for(const fact of current.facts){if(!listeners.has(listener))break;listener(fact);}
 return()=>listeners.delete(listener);
}
