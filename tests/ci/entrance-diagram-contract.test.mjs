import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertProjectStudies} from '../../scripts/project-studies.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name+'.json',root),'utf8'));
function fixture(){
 const studies=read('project-studies'),manifest=read('manifest');
 const project=studies.projects.find(item=>item.id==='entrance-installation-art');
 const section=project.sections.find(item=>item.id==='context'),source=section.media[0];
 section.diagramFocus={title:'Read the source groups',source:source.src,steps:[
  {label:'First group',description:'Source group at the left.',bounds:[0,0,source.width/2,source.height]},
  {label:'Second group',description:'Source group at the right.',bounds:[source.width/2,0,source.width/2,source.height]},
 ]};
 return{studies,manifest,project,section};
}
const validate=value=>assertProjectStudies(value.studies,value.manifest);
const reject=change=>{const value=fixture();change(value);assert.throws(()=>validate(value));};
test('Entrance focus is finite metadata on an existing complete pinned source',()=>{
 assert.doesNotThrow(()=>validate(fixture()));
});
test('unreviewed source replacements, extra transforms and other projects fail closed',()=>{
 reject(({section})=>{section.diagramFocus.source='/assets/diagrams/invented.svg';});
 reject(({section})=>{section.diagramFocus.crop=[0,0,1,1];});
 reject(({section})=>{section.diagramFocus.steps[0].opacity=.2;});
 reject(({studies,section})=>{studies.projects[0].sections[0].diagramFocus=section.diagramFocus;});
});
test('source focus groups cannot escape the raster or lose readable explanations',()=>{
 for(const bounds of [[-1,0,1,1],[0,0,0,1],[0,0,Infinity,1],[0,0,1],[0,0,100000,1]])reject(({section})=>{section.diagramFocus.steps[0].bounds=bounds;});
 reject(({section})=>{section.diagramFocus.steps=[];});
 reject(({section})=>{section.diagramFocus.steps[0].label='';});
 reject(({section})=>{section.diagramFocus.steps[0].description='';});
 reject(({section})=>{section.diagramFocus.steps[1].label=section.diagramFocus.steps[0].label;});
});

test('Entrance plates expose every numbered group and explanation in native document order',()=>{
 const source=readFileSync(new URL('../components/EntranceDiagramFocus.jsx',root),'utf8');
 assert.match(source,/<img src=\{image.src\} width=\{image.width\} height=\{image.height\}[^>]*data-entrance-original/);
 assert.match(source,/<svg viewBox=\{`0 0 \$\{image.width\} \$\{image.height\}`\} aria-hidden="true" focusable="false"/);
 assert.match(source,/guide.steps.map\(\(step,index\)=><g[^>]*><rect data-focus-region=\{index\} x=\{step.bounds\[0\]\} y=\{step.bounds\[1\]\} width=\{step.bounds\[2\]\} height=\{step.bounds\[3\]\}/);
 assert.match(source,/<ol[^>]*>\s*\{guide.steps.map\(\(step,index\)=><li[^>]*data-focus-description=\{index\}/);
 assert.match(source,/\{step.label\}<\/h4><p>\{step.description\}<\/p>/);
 assert.match(source,/\{image.caption\}/);assert.match(source,/\{image.credit\}/);
 assert.doesNotMatch(source,/<(?:a|input|button|select)\b|\b(?:useState|onClick|onKeyDown|aria-controls|aria-selected)=?|\shidden(?:[=>\s])/);
 const css=readFileSync(new URL('../components/EntranceDiagramFocus.module.css',root),'utf8');
 assert.match(css,/\.plate img\{[^}]*height:auto;object-fit:contain/);
 assert.match(css,/\.overlay\{[^}]*pointer-events:none/);
 assert.doesNotMatch(css,/:checked|:has\(|prefers-reduced-motion|\.descriptions[^}]*display:none|\.descriptions[^}]*opacity:0/);
});
