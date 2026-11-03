import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/components/',import.meta.url);
const components=['PortfolioHome.jsx','ProjectCaseStudy.jsx','XRProject.jsx','BendingProject.jsx','EditorialProjectStudy.jsx','EntranceDiagramFocus.jsx'];
function externalLinks(source){
 const links=[...source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map(row=>row[0]);
 for(const link of links){assert.match(link,/rel="[^"]*noreferrer/);assert.match(link,/aria-label=[\s\S]*new tab/);assert.doesNotMatch(link,/onClick|aria-hidden="true"/);}
 return links;
}
test('remaining recording and public-profile links announce their new tab and retain native navigation',async()=>{
 let count=0;for(const file of components)count+=externalLinks(await readFile(new URL(file,root),'utf8')).length;
 assert(count>=4,'Recording and approved contact/profile actions remain available');
});
test('link contract rejects concealed or intercepted new-tab actions',()=>{
 const source='<a href="/assets/movie.mp4" target="_blank" rel="noreferrer" aria-label="Recording (new tab)">';
 externalLinks(source);
 for(const changed of[source.replace('noreferrer','opener'),source.replace('aria-label=','aria-hidden="true" aria-label='),source.replace('<a ','<a onClick={intercept} ')])assert.throws(()=>externalLinks(changed));
});
test('Bending image comparison is removed while native research images and captions remain',async()=>{
 const source=await readFile(new URL('BendingProject.jsx',root),'utf8');
 assert.doesNotMatch(source,/data-inspect-figure|EvidenceInspector|mediaAction|Opens an inline source comparison/);
 assert.match(source,/<img src=\{item.src\}/);assert.match(source,/<p>\{item.caption\}<\/p>/);
});
