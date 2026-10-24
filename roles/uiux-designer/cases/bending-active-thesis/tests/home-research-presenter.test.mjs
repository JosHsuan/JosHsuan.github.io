import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHomeResearchStage,observeHomeResearchStage} from '../runtime/site/HomeResearchStageRegistry.mjs';
import {createHomeResearchPresenter,canCommitHomeResearchExposure} from '../runtime/site/HomeResearchPresenter.mjs';

function fixture(){
 const calls=[],exposures=[],attributes=new Map(),styles=new Map();let state={phase:'ready',id:1,paused:false,entryState:'requested'},callback=null;
 const root={offsetHeight:2000},host={offsetWidth:800,offsetHeight:2000};
 const presenter=createHomeResearchPresenter({root,host,present:value=>{calls.push(value);},expose:value=>{exposures.push(value);return{completed:true};},inspect:()=>({...state}),subscribe:listener=>{callback=listener;return()=>{callback=null;};},publisher:{attribute:(_,key,value)=>attributes.set(key,value),style:(_,key,value)=>styles.set(key,value)}});
 presenter.measure({naturalY:()=>100,viewportHeight:1000});
 return{presenter,calls,exposures,attributes,styles,root,host,setState:value=>{state={...state,...value};},subscription:()=>callback};
}

test('Home stage registry enforces one owner and idempotent release',()=>{
 const doc={},events=[];const unobserve=observeHomeResearchStage(doc,value=>events.push(value));
 const release=registerHomeResearchStage(doc,{id:'one'});assert.throws(()=>registerHomeResearchStage(doc,{id:'two'}),/already owns/);
 release();release();const second=registerHomeResearchStage(doc,{id:'two'});release();assert.equal(events.at(-1).id,'two');second();unobserve();
 assert.deepEqual(events.map(value=>value?.id??null),[null,'one',null,'two',null]);
});

test('native natural layout maps forward and reverse progress without accumulating deltas',()=>{
 const f=fixture();for(const docY of [-200,100,600,1100,1600,350])f.presenter.publish({docY,ready:true});
 assert.deepEqual(f.calls.map(value=>value.progress),[0,.5,1,.25]);assert.equal(f.presenter.inspect().progress,.25);
 assert.equal(f.attributes.get('data-home-research-motion'),'active');
});

test('ready source prepares current scroll before entry, but motion remains static',()=>{
 const f=fixture();f.presenter.publish({docY:800,ready:false});assert.equal(f.calls[0].progress,.7);
 assert.equal(f.attributes.get('data-home-research-motion'),'static');f.presenter.publish({docY:800,ready:true});assert.equal(f.calls.length,1);
 assert.equal(f.attributes.get('data-home-research-motion'),'active');
});

test('Pause freezes presentation while native scroll continues; Resume seeks actual progress',()=>{
 const f=fixture();f.presenter.publish({docY:300,ready:true});f.setState({paused:true});f.presenter.publish({docY:1000,ready:true});
 assert.equal(f.calls.length,1);assert.equal(f.presenter.inspect().progress,.9);assert.equal(f.attributes.get('data-home-research-motion'),'paused');
 f.setState({paused:false});f.presenter.publish({docY:1000,ready:true});assert.equal(f.calls.at(-1).progress,.9);
});

test('reduced, data, forced-colors, hidden and unready resources publish no scene work',()=>{
 for(const policy of [{reduced:true},{saveData:true},{forcedColors:true},{suspended:true}]){
  const f=fixture();f.presenter.publish({docY:600,ready:true,...policy});assert.equal(f.calls.length,0);
 }
 const f=fixture();f.setState({phase:'requested'});f.presenter.publish({docY:600,ready:true});assert.equal(f.calls.length,0);
});

test('resize and replacement identities republish without an idle frame loop',()=>{
 const f=fixture();f.presenter.publish({docY:600,ready:true});for(let index=0;index<100;index++)assert.equal(f.presenter.publish({docY:600,ready:true}),false);
 assert.equal(f.calls.length,1);f.host.offsetWidth=600;f.presenter.publish({docY:600,ready:true});assert.equal(f.calls.length,2);
 f.setState({id:2});f.presenter.publish({docY:600,ready:true});assert.equal(f.calls.length,3);
 f.root.offsetHeight=1500;f.presenter.measure({naturalY:()=>100,viewportHeight:1000});f.presenter.publish({docY:600,ready:true});assert.equal(f.calls.at(-1).progress,1);
});

test('disposal disconnects stage subscription and ignores further publications',()=>{
 const f=fixture();assert.equal(typeof f.subscription(),'function');f.presenter.dispose();f.presenter.dispose();f.presenter.publish({docY:600,ready:true});
 assert.equal(f.subscription(),null);assert.equal(f.calls.length,0);assert.equal(f.attributes.get('data-home-research-motion'),'static');
});

test('offscreen specimen stops publication and CSS idle; reentry seeks without replay',()=>{
 const f=fixture();f.host.offsetHeight=400;f.presenter.measure({naturalY:()=>100,viewportHeight:1000});
 f.presenter.publish({docY:0,ready:true});assert.equal(f.calls.length,1);
 f.presenter.publish({docY:700,ready:true});assert.equal(f.calls.length,1);assert.equal(f.presenter.inspect().visible,false);assert.equal(f.attributes.get('data-home-research-motion'),'suspended');
 f.presenter.publish({docY:200,ready:true});assert.equal(f.calls.length,2);assert.equal(f.calls.at(-1).progress,.1);
});

test('cached sticky bounds retain actual visibility until the containing block exits',()=>{
 const f=fixture(),parent={offsetHeight:2000},visual={offsetHeight:500,parentElement:parent,ownerDocument:{defaultView:{getComputedStyle:()=>({position:'sticky',top:'100px'})}}};
 f.host.offsetHeight=450;f.host.closest=()=>visual;
 f.presenter.measure({naturalY:node=>node===parent?100:node===visual?200:node===f.host?210:100,viewportHeight:1000});
 f.presenter.publish({docY:1000,ready:true});assert.equal(f.presenter.inspect().visible,true);assert.equal(f.calls.length,1);
 f.presenter.publish({docY:2200,ready:true});assert.equal(f.presenter.inspect().visible,false);assert.equal(f.calls.length,1);
});

test('actual entered exposure commits once even when prepared pose is identical, then idle dedup resumes',()=>{
 const f=fixture();f.presenter.publish({docY:600,ready:false});assert.equal(f.calls.length,1);assert.equal(f.exposures.length,0);
 f.setState({entryState:'entered'});f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,1);assert.equal(f.exposures[0].generation,1);
 for(let index=0;index<100;index++)f.presenter.publish({docY:600,ready:true});
 assert.equal(f.exposures.length,1);assert.equal(f.calls.length,1);assert.equal(f.presenter.inspect().exposureCommits,1);
 f.presenter.publish({docY:600,ready:true,suspended:true});f.presenter.publish({docY:600,ready:true});
 f.presenter.publish({docY:3000,ready:true});f.presenter.publish({docY:600,ready:true});
 f.setState({paused:true});f.presenter.publish({docY:600,ready:true});f.setState({paused:false});f.presenter.publish({docY:600,ready:true});
 assert.equal(f.exposures.length,1,'retained resource is not re-exposed for visibility/Pause epochs');
 f.setState({id:2});f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,2);
});

test('exposure awaits genuine entered, visible, unpaused eligible state, never failed entry',()=>{
 const f=fixture();f.setState({entryState:'failed'});f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,0);
 f.setState({entryState:'entered',paused:true});f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,0);
 f.setState({paused:false});f.presenter.publish({docY:600,ready:true,suspended:true});assert.equal(f.exposures.length,0);
 f.presenter.publish({docY:3000,ready:true});assert.equal(f.exposures.length,0);
 f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,1);
 f.presenter.dispose();f.setState({id:3});f.presenter.publish({docY:600,ready:true});assert.equal(f.exposures.length,1);
});

test('exposure gate rejects stale generations, hidden/disposed owners and an uncleared entry cover',()=>{
 const valid={stage:{active:true,phase:'ready',id:4},generation:4,connected:true,hasResource:true,entryState:'entered',loaderHidden:true,loaderDisplay:'none'};
 assert.equal(canCommitHomeResearchExposure(valid),true);
 for(const patch of [{disposed:true},{arrivalStatic:true},{paused:true},{hidden:true},{connected:false},{hasResource:false},{generation:3},{generation:null},{entryState:'revealing'},{entryState:'failed'},{loaderHidden:false},{loaderDisplay:'flex'},{stage:{active:false,phase:'ready',id:4}},{stage:{active:true,phase:'requested',id:4}}])assert.equal(canCommitHomeResearchExposure({...valid,...patch}),false,JSON.stringify(patch));
});
