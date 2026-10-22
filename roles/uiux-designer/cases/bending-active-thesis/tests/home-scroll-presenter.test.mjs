import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomeScrollPresenter} from '../runtime/site/HomeScrollPresenter.mjs';
import {createInformationWindowPresenter} from '../runtime/presentation/InformationWindowPresenter.mjs';
import {projectGridRows} from '../components/project-grid-layout.mjs';

function fixture(factory=createHomeScrollPresenter,{profile=null,plane=false}={}){
  const root={attrs:new Map(),activeElement:null,querySelectorAll:()=>nodes};
  const document={activeElement:null,defaultView:{getComputedStyle:()=>({
    background:'transparent',borderTopWidth:'0px',borderRightWidth:'0px',borderBottomWidth:'0px',borderLeftWidth:'0px',
    borderTopColor:'transparent',borderRightColor:'transparent',borderBottomColor:'transparent',borderLeftColor:'transparent',
    outlineStyle:'none',outlineWidth:'0px',boxShadow:'none',borderTopLeftRadius:'0px',
  })}};
  root.ownerDocument=document;root.getAttribute=name=>root.attrs.get(name)??null;
  if(profile)root.attrs.set('data-information-motion-profile',profile);
  const nodes=[{attrs:new Map([['data-information-window','home-introduction']]),styles:new Map(),tagName:'DIV',
    clientWidth:480,clientHeight:300,top:100,parentElement:null,
    querySelector:()=>({}),getAttribute(name){return this.attrs.get(name)??null;},contains:node=>node?.parentElement===nodes[0],
  }];
  const publisher={
    style(element,name,value){if(value==='')element.styles.delete(name);else element.styles.set(name,String(value));},
    attribute(element,name,value){if(value===null)element.attrs.delete(name);else element.attrs.set(name,String(value));},
  };
  if(plane)nodes[0].attrs.set('data-information-motion-surface','plane');
  const presenter=factory({root,publisher});
  const measure=(docY=0)=>presenter.measure({naturalY:element=>element.top,viewportHeight:800,docY});
  const publish=(input={})=>presenter.publish({dt:1/60,docY:0,ready:true,...input});
  return{root,document,nodes,presenter,measure,publish};
}

test('conceptual project space grows in complete three-column rows without inventing projects',()=>{
  for(const count of [0,1,2,8,9])assert.equal(projectGridRows(count),3);
  for(const count of [10,11,12])assert.equal(projectGridRows(count),4);
  for(const count of [13,14,15])assert.equal(projectGridRows(count),5);
  assert.equal(projectGridRows(31),11);
  for(const count of [-1,2.5,NaN,Infinity,'12'])assert.throws(()=>projectGridRows(count),TypeError);
});

test('Home is motionless before the destination is ready and then uses Bending material motion exactly',()=>{
  const home=fixture(),bending=fixture(createInformationWindowPresenter);home.measure();bending.measure();
  assert.equal(home.publish({ready:false,docY:200}),false);
  assert.equal(home.root.attrs.has('data-home-scrolling-ready'),false);
  assert.equal(home.presenter.inspect().enabled,false);
  assert.equal(home.presenter.inspect().informationWindows.items[0].y,0);
  // Both samplers begin at the same native position when entry is acknowledged.
  bending.publish({docY:200,reduced:true});
  home.publish({docY:200});bending.publish({docY:200});
  assert.equal(home.root.attrs.has('data-home-scrolling-ready'),true);
  for(const docY of [360,490,430,200]){
    assert.equal(home.publish({docY}),bending.publish({docY}));
    assert.deepEqual(home.presenter.inspect().informationWindows,bending.presenter.inspect());
  }
});

test('native scrolling exits the viewport and returning resumes the same finite response',()=>{
  const f=fixture();f.measure();f.publish();
  assert.equal(f.publish({docY:300}),true);
  assert.equal(f.presenter.inspect().informationWindows.items[0].visible,true);
  assert.equal(f.publish({docY:2000}),false);
  let item=f.presenter.inspect().informationWindows.items[0];
  assert.equal(item.visible,false);assert.equal(item.settled,true);assert.equal(item.y,0);
  f.publish({docY:200});item=f.presenter.inspect().informationWindows.items[0];
  assert.equal(item.visible,true);assert.equal(item.settled,false);
  for(let index=0;index<360;index++)f.publish({docY:200});
  item=f.presenter.inspect().informationWindows.items[0];
  assert.equal(item.settled,true);assert.equal(item.y,0);assert.equal(item.edgeMaximum,0);
  assert(![...f.nodes[0].styles.keys()].some(key=>key.includes('opacity')));
});

test('Reduced Motion, Save Data, forced colors and document suspension all return Home to readable rest',()=>{
  for(const option of [{reduced:true},{saveData:true},{forcedColors:true},{suspended:true},{ready:false}]){
    const f=fixture();f.measure();f.publish();f.publish({docY:350});
    assert.equal(f.presenter.inspect().informationWindows.moving,true);
    assert.equal(f.publish({docY:350,...option}),false);
    const state=f.presenter.inspect();
    assert.equal(state.enabled,false);assert.equal(state.informationWindows.settled,true);
    assert.equal(state.informationWindows.items[0].y,0);assert.equal(state.informationWindows.items[0].edgeMaximum,0);
    f.publish({docY:350,resumed:true});
    assert.equal(f.presenter.inspect().enabled,true);assert.equal(f.presenter.inspect().informationWindows.moving,false);
  }
});

test('focused reading stays still; new layout measurements update native positions without replay',()=>{
  const f=fixture();f.measure();f.publish();f.publish({docY:350});
  f.document.activeElement={parentElement:f.nodes[0]};
  assert.equal(f.publish({docY:350}),false);
  f.document.activeElement=null;f.nodes[0].top=180;f.measure(350);
  assert.equal(f.presenter.inspect().informationWindows.items[0].top,180);
  f.publish({docY:350,seek:true});
  assert.equal(f.presenter.inspect().informationWindows.items[0].y,0);
});

test('disposal releases Home markers and all owned material properties; stale samples cannot publish',()=>{
  const f=fixture();f.measure();f.publish();f.publish({docY:300});
  assert.equal(f.root.attrs.has('data-home-scrolling-ready'),true);
  f.presenter.dispose();
  assert.equal(f.root.attrs.has('data-home-scrolling-ready'),false);
  assert.equal(f.nodes[0].styles.size,0);assert.equal(f.nodes[0].attrs.has('data-information-ready'),false);
  assert.equal(f.presenter.inspect().informationWindows.count,0);
  assert.equal(f.publish({docY:500}),false);
  f.measure();f.presenter.dispose();
  assert.equal(f.nodes[0].styles.size,0);
});


test('ordinary page adapter applies existing static policies to explicit whole planes only',()=>{
 for(const option of [{reduced:true},{saveData:true},{forcedColors:true},{suspended:true},{ready:false},{resumed:true},{seek:true}]){
  const f=fixture(createHomeScrollPresenter,{profile:'velocity-skin',plane:true});f.measure();f.publish();f.publish({docY:80});
  assert(f.presenter.inspect().informationWindows.items[0].skinStrength>0);
  f.publish({docY:80,...option});const item=f.presenter.inspect().informationWindows.items[0];
  assert.equal(item.skinStrength,0);assert.equal(item.settled,true);
  const count=f.presenter.inspect().informationWindows.outlineSamples;
  for(let i=0;i<60;i++)f.publish({docY:80,...option});
  assert.equal(f.presenter.inspect().informationWindows.outlineSamples,count);
  f.presenter.dispose();assert(!f.nodes[0].attrs.has('data-information-plane'));
 }
 const unmarked=fixture(createHomeScrollPresenter,{profile:'velocity-skin'});unmarked.measure();unmarked.publish({docY:80});
 assert.equal(unmarked.presenter.inspect().informationWindows.items[0].plane,false);
});
