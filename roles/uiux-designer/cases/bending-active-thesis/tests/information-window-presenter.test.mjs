import test from 'node:test';
import assert from 'node:assert/strict';
import {createInformationWindowPresenter} from '../runtime/presentation/InformationWindowPresenter.mjs';

const original={background:'linear-gradient(145deg, rgb(27,38,39), rgb(17,26,27))',borderTopWidth:'1px',borderRightWidth:'1px',borderBottomWidth:'1px',borderLeftWidth:'1px',borderTopColor:'rgb(180,199,183)',borderRightColor:'rgb(180,199,183)',borderBottomColor:'rgb(180,199,183)',borderLeftColor:'rgb(180,199,183)',outlineStyle:'none',outlineWidth:'0px',outlineColor:'black',boxShadow:'rgba(0,0,0,.2) 0px 16px 36px',borderTopLeftRadius:'28px'};

function fixture(specs){
  const operations=[],nodes=[];
  const root={activeElement:null,querySelectorAll:()=>nodes,defaultView:{getComputedStyle(element){
    operations.push('read:style');
    return {...original,...element.computed,...(element.attrs.has('data-information-ready')?{background:'transparent',boxShadow:'none',borderTopColor:'transparent'}:{})};
  }}};
  for(const spec of specs){
    const node={attrs:new Map([['data-information-window',spec.kind??'editorial']]),styles:new Map(),top:spec.top??100,computed:spec.computed??{},tagName:spec.details?'DETAILS':'DIV',open:spec.open??false,skin:spec.skin!==false,parentElement:null,
      querySelector:()=>node.skin?{}:null,getAttribute:key=>node.attrs.get(key)??null,
      closest(selector){return selector==='[data-information-window]'?node:spec.chapter?{dataset:{studyChapter:spec.chapter}}:null;},
      contains:element=>element?.parentElement===node,
      get clientWidth(){operations.push('read:width');return spec.width??480;},
      get clientHeight(){operations.push('read:height');return spec.height??300;},
    };
    if(spec.parent!==undefined)node.parentElement=nodes[spec.parent];
    nodes.push(node);
  }
  const publisher={style(element,key,value){operations.push('write:'+key);if(value==='')element.styles.delete(key);else element.styles.set(key,String(value));},attribute(element,key,value){operations.push('write:'+key);if(value===null)element.attrs.delete(key);else element.attrs.set(key,String(value));}};
  const presenter=createInformationWindowPresenter({root,publisher});
  const measure=(docY=0)=>presenter.measure({naturalY:element=>{operations.push('read:top');return element.top;},viewportHeight:800,docY});
  const publish=(args={})=>presenter.publish({docY:0,dt:1/60,...args});
  return {root,nodes,operations,presenter,measure,publish};
}

test('measurement batches reads, activates only topmost skins and retains source paint on remeasure',()=>{
  const f=fixture([{}, {parent:0,kind:'evidence-image'}, {details:true}, {top:700}, {skin:false}]);
  f.measure();
  assert.equal(f.presenter.inspect().recipe,'ink');
  assert.equal(f.presenter.inspect().count,2);
  assert.equal(f.presenter.inspect().nested,1);
  assert.equal(f.nodes[1].attrs.has('data-information-ready'),false);
  assert.equal(f.nodes[2].attrs.has('data-information-ready'),false);
  const firstWrite=f.operations.findIndex(value=>value.startsWith('write:'));
  assert(f.operations.slice(firstWrite).every(value=>!value.startsWith('read:')));
  assert.equal(f.nodes[0].styles.get('--information-background'),original.background);
  f.operations.length=0;f.measure();
  assert.equal(f.nodes[0].styles.get('--information-background'),original.background);
  assert.equal(f.nodes[0].styles.get('--information-shadow'),original.boxShadow);
  assert(!f.operations.some(value=>value.includes('opacity')));
});

test('native scroll causes bounded fluid lag, supports reversal, and settles without a scheduler',()=>{
  const f=fixture([{}]);f.measure();
  assert.equal(f.publish(),false);
  assert.equal(f.publish({docY:400}),true);
  let item=f.presenter.inspect().items[0];
  assert(Math.abs(item.y)<=12);assert(Math.abs(item.x)<=12);assert(item.edgeMaximum<=16);
  assert.match(f.nodes[0].styles.get('--information-skin-path'),/^path\('/);
  const oldProgress=item.progress;
  f.publish({docY:100,dt:0});
  assert.equal(f.presenter.inspect().items[0].progress,oldProgress,'retarget preserves the current body position');
  for(let index=0;index<360;index++)f.publish({docY:100});
  item=f.presenter.inspect().items[0];
  assert.equal(f.presenter.inspect().settled,true);
  assert.equal(item.y,0);assert.equal(item.edgeMaximum,0);
  assert.equal(f.nodes[0].styles.get('--information-skin-path'),'inset(0 round 28px)');
  assert(!f.operations.some(value=>value.includes('opacity')));
});

test('focus, reduced motion, seek, resume, and offscreen windows return to a readable rest',()=>{
  for(const option of [{reduced:true},{seek:true},{resumed:true},{focus:true},{docY:3000},{dt:1.1}]){
    const f=fixture([{}]);f.measure();f.publish({docY:350});
    if(option.focus)f.root.activeElement={parentElement:f.nodes[0]};
    assert.equal(f.publish({docY:350,...option}),false);
    const item=f.presenter.inspect().items[0];
    assert.equal(item.settled,true);assert.equal(item.x,0);assert.equal(item.y,0);assert.equal(item.edgeMaximum,0);
  }
});

test('3 Hz and 60 Hz consume the same active time, including material lag',()=>{
  const slow=fixture([{}]),fast=fixture([{}]);slow.measure();fast.measure();
  for(let index=0;index<3;index++)slow.publish({docY:400,dt:1/3});
  for(let index=0;index<60;index++)fast.publish({docY:400,dt:1/60});
  const a=slow.presenter.inspect().items[0],b=fast.presenter.inspect().items[0];
  for(const field of ['progress','velocity','x','y','edgeMaximum'])assert(Math.abs(a[field]-b[field])<1e-9,field+' differs with frame rate');
  const outline=slow.nodes[0].styles.get('--information-skin-path');
  slow.measure(400);
  assert.equal(slow.nodes[0].styles.get('--information-skin-path'),outline,'remeasure preserves the active material pose');
});

test('fixed side information responds to its chapter on the supplied clock, then becomes quiet',()=>{
  const f=fixture([{kind:'model-label',chapter:'form',width:180,height:420},{kind:'model-label',chapter:'system'}]);f.measure();
  assert.equal(f.publish({canvasPlacement:{chapter:'form',visible:true,y:0}}),true);
  let items=f.presenter.inspect().items;
  assert.equal(items[0].visible,true);assert.equal(items[0].settled,false);
  assert.equal(items[1].visible,false);assert.equal(items[1].settled,true);
  const progress=items[0].progress;
  f.publish({dt:0,canvasPlacement:{chapter:'form',visible:true,y:0}});
  assert.equal(f.presenter.inspect().items[0].progress,progress);
  for(let index=0;index<360;index++)f.publish({canvasPlacement:{chapter:'form',visible:true,y:0}});
  assert.equal(f.presenter.inspect().settled,true);
  f.publish({canvasPlacement:{chapter:'system',visible:true,y:0}});
  items=f.presenter.inspect().items;
  assert.equal(items[0].visible,false);assert.equal(items[0].settled,true);
  assert.equal(items[1].visible,true);assert.equal(items[1].settled,false);
});

test('details and dynamically inserted portal skins follow layout invalidation and dispose releases ownership',()=>{
  const f=fixture([{details:true}, {parent:0,kind:'evidence-caption'}]);f.measure();
  assert.equal(f.presenter.inspect().count,0);
  f.nodes[0].open=true;f.measure();
  assert.equal(f.presenter.inspect().count,1);
  f.nodes[0].open=false;f.measure();
  assert.equal(f.presenter.inspect().count,0);
  assert.equal(f.nodes[0].styles.size,0);
  const portal=fixture([{kind:'source-portal'}]).nodes[0];f.nodes.push(portal);f.measure();
  assert.equal(f.presenter.inspect().count,1);
  assert.equal(portal.attrs.has('data-information-ready'),true);
  f.nodes.pop();f.measure();
  assert.equal(portal.attrs.has('data-information-ready'),false);
  f.nodes[0].open=true;f.measure();f.publish({docY:300});f.presenter.dispose();
  assert.equal(f.presenter.inspect().count,0);assert.equal(f.presenter.inspect().settled,true);
  for(const node of f.nodes){assert.equal(node.styles.size,0);assert.equal(node.attrs.has('data-information-ready'),false);assert.equal(node.attrs.has('data-information-nested'),false);}
  assert.equal(f.publish({docY:500}),false);
});
