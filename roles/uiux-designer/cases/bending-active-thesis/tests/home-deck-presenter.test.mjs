import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomeDeckPresenter} from '../runtime/site/HomeDeckPresenter.mjs';
function setup(){
 const node=()=>Object.assign(new EventTarget(),{attrs:{},styles:{},offsetWidth:400,offsetHeight:400,contains:()=>false,querySelector:()=>null,getAttribute:key=>key==='data-deck-card'?'project':null});
 const cards=Array.from({length:8},node),counter=node(),contact=node();
 const deck={...node(),offsetHeight:6600,querySelectorAll:()=>cards,querySelector:()=>counter};
 const root={ownerDocument:{activeElement:null},contains:()=>false,querySelector:s=>s==='[data-home-deck]'?deck:contact};
 const moves=[],win={scrollY:0,innerWidth:1440,CustomEvent,scrollTo:value=>moves.push(value)};
 let styleWrites=0;const publisher={attribute:(n,k,v)=>{if(n)n.attrs[k]=v;},style:(n,k,v)=>{styleWrites++;n.styles[k]=v;},text:(n,v)=>{n.text=v;}};
 const listen=(node,type,handler)=>{node.addEventListener(type,handler);return{dispose:()=>node.removeEventListener(type,handler)};};
 const presenter=createHomeDeckPresenter({root,window:win,publisher,listen});presenter.measure({naturalY:()=>1000,viewportHeight:1000});
 const at=(y,extra={})=>{win.scrollY=y;const sample={docY:y,dt:1,ready:true,suspended:false,resumed:false,...extra};presenter.input(sample);return presenter.publish(sample);};
 return{presenter,cards,counter,root,deck,moves,at,writes:()=>styleWrites};
}
test('native scroll visits every project exactly forward and backward, preserving the same pose and one focusable card',()=>{
 const f=setup(),poses=[];
 for(let i=0;i<8;i++){f.at(1000+i*800,{resumed:true});assert.equal(f.presenter.inspect().index,i);assert.equal(f.counter.text,`0${i+1} / 08`);assert.equal(f.cards.filter(c=>c.attrs.inert===null).length,1);poses[i]=structuredClone(f.cards.map(c=>c.styles));}
 for(let i=7;i>=0;i--){f.at(1000+i*800,{resumed:true});assert.equal(f.presenter.inspect().index,i);assert.deepEqual(f.cards.map(c=>c.styles),poses[i]);}
 assert.equal(f.moves.length,0);
});

test('selection belongs to native input and one instance event, never repeated idle frames',()=>{
 const f=setup(),events=[];
 for(let i=0;i<8;i++)for(const type of ['portfolio:card-enter','portfolio:card-leave'])f.cards[i].addEventListener(type,e=>events.push({i,type,...e.detail}));
 f.at(1410);assert.equal(f.presenter.inspect().index,1);assert.deepEqual(events.map(e=>[e.i,e.type]),[[0,'portfolio:card-leave'],[1,'portfolio:card-enter']]);
 const count=f.presenter.inspect().transitions;
 for(let i=0;i<120;i++)f.presenter.publish({docY:1410,dt:1/60,ready:true,suspended:false,resumed:false});
 assert.equal(events.length,2);assert.equal(f.presenter.inspect().transitions,count);
 f.at(1390);assert.equal(f.presenter.inspect().index,0);assert.equal(events.at(-1).direction,-1);
 const active=f.cards[0];f.presenter.dispose();active.dispatchEvent(new CustomEvent('portfolio:card-enter'));
 assert.equal(active.attrs['data-deck-active'],null);
});

test('counter and canvas mutation invalidation preserves an in-flight reveal when layout did not change',()=>{
 const f=setup();f.at(1410,{dt:1/60});const before=f.presenter.inspect();
 assert(before.position>0&&before.position<before.target);
 f.presenter.measure({naturalY:()=>1000,viewportHeight:1000});
 assert.equal(f.presenter.inspect().position,before.position);assert.equal(f.presenter.inspect().transitions,before.transitions);
});

test('the compact hand shares acceleration-driven liquid deformation and stops rewriting settled poses',()=>{
 const f=setup();f.at(1000,{resumed:true});f.at(1500,{dt:1/60});
 assert(f.presenter.inspect().field.strength>0);assert(Number.parseFloat(f.cards[1].styles['--deck-pitch'])<0);
 assert.match(f.cards[1].styles['--deck-rim'],/^path\(/);
 for(let frame=0;frame<180;frame++)f.at(1500,{dt:1/60});
 assert(f.presenter.inspect().field.resting);assert.match(f.cards[1].styles['--deck-rim'],/^inset\(/);
 const writes=f.writes();for(let frame=0;frame<60;frame++)f.at(1500,{dt:1/60});assert.equal(f.writes(),writes);
 f.at(1000,{dt:1/60});assert(f.presenter.inspect().field.strength<0);assert(Number.parseFloat(f.cards[0].styles['--deck-pitch'])>0);
});
test('half-screen section boundaries snap symmetrically without consuming the seven project intervals',()=>{
 const f=setup();f.at(490);assert.equal(f.moves.length,0);f.at(510);assert.equal(f.moves.at(-1).top,1000);f.at(1000);
 for(let i=1;i<8;i++)f.at(1000+i*800);assert.equal(f.moves.length,1);
 f.at(7110);assert.equal(f.moves.at(-1).top,7600);f.at(7600);f.at(7090);assert.equal(f.moves.at(-1).top,6600);f.at(6600);
 f.at(1000,{resumed:true});f.at(490);assert.equal(f.moves.at(-1).top,0);
});
test('resumption, suspension and keyboard focus never force a section jump; disposal restores native links',()=>{
 const f=setup();f.at(510,{resumed:true});f.at(700,{suspended:true});assert.equal(f.moves.length,0);
 f.root.contains=()=>true;f.root.ownerDocument.activeElement={matches:()=>true};f.at(800);assert.equal(f.moves.length,0);
 f.presenter.dispose();assert.equal(f.presenter.inspect().disposed,true);assert(f.cards.every(c=>c.attrs.inert===null&&c.attrs['aria-hidden']===null));assert(f.cards.every(c=>Object.values(c.styles).every(value=>value==='')),'native fallback must not retain invisible or transformed cards');assert.equal(f.at(2000),false);
});

test('small reversals within a section do not snap until native input crosses its half-screen threshold',()=>{
 const f=setup();
 for(const y of [13,37,61,85,109,85,61,37,13])f.at(y);
 assert.equal(f.moves.length,0);
 f.at(510);assert.equal(f.moves.at(-1).top,1000);f.at(600);f.at(550);
 assert.equal(f.moves.length,1);f.at(490);assert.equal(f.moves.at(-1).top,0);
 f.at(7200,{resumed:true});const count=f.moves.length;
 for(const y of [7300,7250,7200])f.at(y);assert.equal(f.moves.length,count);
 f.at(7090);assert.equal(f.moves.at(-1).top,6600);
});
test('scrolling a focused card away transfers focus to the revealed project without a second focusable card',()=>{
 const f=setup();const links=f.cards.map(card=>{const link={focus:options=>{assert.equal(options.preventScroll,true);f.root.ownerDocument.activeElement=link;}};card.contains=node=>node===link;card.querySelector=()=>link;return link;});
 f.at(1000,{resumed:true});f.root.ownerDocument.activeElement=links[0];f.at(1800,{resumed:true});
 assert.equal(f.root.ownerDocument.activeElement,links[1]);assert.equal(f.cards.filter(c=>c.attrs.inert===null).length,1);
});
