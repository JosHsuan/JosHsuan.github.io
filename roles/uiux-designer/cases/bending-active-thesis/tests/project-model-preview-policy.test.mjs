import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Exercise the component's actual source callback without installing a second
// React effect runtime or substituting a browser/renderer-readiness result.
const source=await readFile(new URL('../components/ProjectModelPreview.jsx',import.meta.url),'utf8');
const match=source.match(/mode:'page',onChange:(\(\{[^}]+\}\)=>\{[\s\S]*?\n  \}),onSize:/);
assert.ok(match,'The active component must keep one explicit page-eligibility callback');
function fixture({arrivalStatic=false,phase='ready'}={}){
 const calls=[],lifecycle={inspect:()=>({phase}),stop:reason=>calls.push(['stop',reason]),setActive:(active,reason)=>calls.push(['active',active,reason])};
 const callback=new Function('arrivalStatic','lifecycle','settleStatic',`return (${match[1]});`)(arrivalStatic,lifecycle,reason=>calls.push(['static',reason]));
 return{callback,calls};
}

test('the actual ProjectModelPreview callback cannot turn OS motion or truthful save-data telemetry into a static arrival',()=>{
 for(const phase of ['poster','requested','ready'])for(const reduced of [false,true])for(const saveData of [false,true]){
  const f=fixture({phase});f.callback({active:true,reason:'page-ready',reduced,saveData});
  assert.deepEqual(f.calls,[['active',true,'page-ready']],`${phase}, reduced=${reduced}, saveData=${saveData}`);
 }
});

test('the active card keeps a genuine incomplete-hidden arrival static, a ready hidden resource retained, and a failed arrival latched',()=>{
 const pending=fixture({phase:'requested'});pending.callback({active:false,reason:'hidden',reduced:false,saveData:false});assert.deepEqual(pending.calls,[['static','hidden']]);
 const ready=fixture();ready.callback({active:false,reason:'hidden',reduced:true,saveData:true});assert.deepEqual(ready.calls,[['active',false,'hidden']]);
 const failed=fixture({arrivalStatic:true,phase:'failed'});failed.callback({active:true,reason:'page-ready'});assert.deepEqual(failed.calls,[]);
});
