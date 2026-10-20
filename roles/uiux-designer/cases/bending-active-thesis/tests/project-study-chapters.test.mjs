import test from 'node:test';
import assert from 'node:assert/strict';
import {EventManager} from '../runtime/core/EventManager.ts';
import {DOMPresenter} from '../runtime/presentation/DOMPresenter.ts';
import {createProjectStudyChapterPresenter} from '../runtime/site/ProjectStudyChapterPresenter.mjs';

class Node extends EventTarget{
 constructor(){super();this.attributes=new Map();this.dataset={};this.textContent='';}
 getAttribute(name){return this.attributes.get(name)??null;}
 hasAttribute(name){return this.attributes.has(name);}
 setAttribute(name,value){this.attributes.set(name,String(value));if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]=String(value);}
 removeAttribute(name){this.attributes.delete(name);if(name.startsWith('data-'))delete this.dataset[name.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())];}
}
function fixture({paused=false}={}){
 const root=new Node(),tools=new Node(),counter=new Node(),toggle=new Node(),navigation=new Node(),events=new EventManager(),scope=events.createScope('test-chapters'),dom=new DOMPresenter();
 let docY=0,reads=0,pauseChanges=0;
 const chapters=['overview','system','making','credits'].map((id,index)=>{
  const node=new Node();node.dataset.projectChapter=id;node.top=[0,1000.375,2400.25,4200.75][index];node.getBoundingClientRect=()=>{reads++;return{top:node.top-docY};};return node;
 });
 const links=chapters.map(chapter=>{const node=new Node();node.dataset.projectChapterLink=chapter.dataset.projectChapter;return node;});
 root.querySelectorAll=()=>chapters;navigation.querySelectorAll=()=>links;
 tools.querySelector=selector=>selector==='[data-project-chapter-count]'?counter:selector==='[data-study-motion-toggle]'?toggle:null;
 tools.setAttribute('hidden','');if(paused)root.setAttribute('data-study-paused','');
 const presenter=createProjectStudyChapterPresenter({root,tools,counter,navigation,publisher:dom.forOwner('test'),listen:(...args)=>events.listen(scope,...args),onPause:()=>pauseChanges++});
 return{root,tools,counter,toggle,navigation,chapters,links,presenter,events,dom,get reads(){return reads;},get pauseChanges(){return pauseChanges;},
  measure(y=docY){docY=y;presenter.measure({docY});},read(y,height=1000){docY=y;presenter.publish({docY,viewportHeight:height});return root.dataset.projectActiveChapter;},
  dispose(){presenter.dispose();events.dispose();}};
}

test('fractional native midpoint selection, counter and rail agree through exact boundaries and reverse reading',()=>{
 const f=fixture();f.measure(300);
 for(const [y,id,ordinal]of [[-1000,'overview',1],[500.374,'overview',1],[500.375,'system',2],[1900.25,'making',3],[9000,'credits',4],[500.375,'system',2],[500.374,'overview',1]]){
  assert.equal(f.read(y),id);assert.equal(f.counter.textContent,`${String(ordinal).padStart(2,'0')} / 04`);
  assert.deepEqual(f.links.map(link=>link.getAttribute('aria-current')),f.chapters.map(chapter=>chapter.dataset.projectChapter===id?'location':null));
 }
 assert.equal(f.tools.hasAttribute('hidden'),false);assert.equal(f.root.hasAttribute('data-project-study-ready'),true);f.dispose();
});

test('scroll and viewport selection reuse measured native anchors; late layout refresh preserves the current document position',()=>{
 const f=fixture();f.measure();const measured=f.reads;
 for(let y=0;y<=5000;y+=25)f.read(y);
 assert.equal(f.reads,measured,'Native selection must not read chapter geometry');
 assert.equal(f.read(450,1101),'system','Browser-chrome viewport height still changes the reading midpoint');
 f.chapters[1].top=1300.625;f.measure(450);assert.equal(f.read(450,1101),'overview','A real layout invalidation refreshes anchors');
 assert.equal(f.read(800.625),'system');assert.equal(f.presenter.inspect().measurements,2);f.dispose();
});

test('pause is synchronous and derived from its one native intent, including externally restored policy',()=>{
 const f=fixture({paused:true});f.measure();
 assert.equal(f.toggle.textContent,'Resume motion');assert.equal(f.toggle.getAttribute('aria-pressed'),'true');
 f.toggle.dispatchEvent(new Event('click'));assert.equal(f.root.hasAttribute('data-study-paused'),false);assert.equal(f.toggle.getAttribute('aria-pressed'),'false');assert.equal(f.toggle.textContent,'Pause motion');assert.equal(f.pauseChanges,1);
 assert.equal(f.presenter.syncPause(),false,'An observer receipt for the same click cannot restart presentation');
 f.root.setAttribute('data-study-paused','');assert.equal(f.presenter.syncPause(),true);assert.equal(f.toggle.textContent,'Resume motion');assert.equal(f.presenter.syncPause(),false);
 assert.equal(f.read(2500),'making','Pause controls motion, not native chapter reading');f.dispose();
});

test('true departure closes native pause and publication while disposal remains idempotent',()=>{
 const f=fixture();f.measure();f.read(2000);assert.equal(f.events.inspect().nativeListeners,1);f.dispose();f.dispose();
 assert.equal(f.events.inspect().nativeListeners,0);assert.equal(f.root.hasAttribute('data-project-study-ready'),false);assert.equal(f.root.hasAttribute('data-project-active-chapter'),false);assert.equal(f.tools.hasAttribute('hidden'),true);assert(f.links.every(link=>!link.hasAttribute('aria-current')));
 const before=f.dom.inspect(),reads=f.reads;f.toggle.dispatchEvent(new Event('click'));f.presenter.measure();f.presenter.publish({docY:4000,viewportHeight:1000});f.presenter.syncPause();
 assert.deepEqual(f.dom.inspect(),before);assert.equal(f.reads,reads);assert.equal(f.pauseChanges,0);assert.equal(f.presenter.inspect().disposed,true);
});
