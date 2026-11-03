import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const componentPath='components/ResearchEntryComposition.jsx';
const cssPath='components/research-entry-composition.module.css';
function composition(component,css){
 assert.equal((component.match(/<picture>/g)||[]).length,1);assert.equal((component.match(/<img /g)||[]).length,1);
 assert.ok(component.includes('<source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/>'));
 assert.ok(component.includes(`<img src="/assets/cinematic/model-poster.webp" width="1440" height="1000" alt="" decoding="async" data-site-research-handoff={outgoing?'':undefined}/>`));
 assert.ok(component.includes('data-research-entry-composition="bending-active"'));assert.ok(component.includes('aria-hidden="true" data-research-entry-backdrop'));assert.ok(component.includes('{children}'));
 assert.doesNotMatch(component,/useEffect|useState|useLayoutEffect|requestAnimationFrame|setTimeout|sessionStorage|onLoad=|onClick=|dangerouslySetInnerHTML|<canvas/);
 assert.ok(css.includes('object-fit:contain;object-position:center;opacity:.9;transform:none'));
 assert.doesNotMatch(css,/data-site-project-entry|object-fit:cover|scale\(|animation:|transition:/);
 assert.ok(css.includes('@media(forced-colors:active)'));assert.ok(css.includes('@media(prefers-reduced-transparency:reduce)'));
 assert.ok(css.includes('.frame>[data-research-entry-content]'));assert.ok(css.includes('@media(max-height:600px) and (orientation:landscape)'));
}
test('shared entry composition retains the original responsive source and independent readiness owners',async()=>{
 const component=await read(componentPath),css=await read(cssPath);composition(component,css);
 const entry=await read('components/EntryLoader.jsx'),site=await read('components/SiteExperience.jsx');
 assert.equal(entry.split('<ResearchEntryComposition>').length,2);
 assert.ok(site.includes("status.presentation==='bending-active'?<ResearchEntryComposition outgoing>{content}</ResearchEntryComposition>"));
 assert.equal(site.split('data-site-loader-content').length,2);
 assert.match(await read('runtime/features/EntryManager.mjs'),/entry/);
 const pins={'model-poster.webp':'931181ca2b0722d27f41bddbf60121c5d058d4297bd809aee9eb2fec68d377e7','model-poster-mobile.webp':'b133e25443df7926f8b5b4fcf354765f371c3417e0662a0635b917f4546e8d24'};
 for(const [file,sha]of Object.entries(pins))assert.equal(createHash('sha256').update(await readFile(new URL('release/public/assets/cinematic/'+file,root))).digest('hex'),sha);
});
test('composition rejects source replacement, cropping, competing clocks and hidden source switching',async()=>{
 const component=await read(componentPath),css=await read(cssPath);
 for(const changed of [component.replace('model-poster-mobile.webp','other.webp'),component.replace('{children}','{children}<canvas/>'),component+'requestAnimationFrame()'])assert.throws(()=>composition(changed,css));
 assert.throws(()=>composition(component,css.replace('object-fit:contain','object-fit:cover')));
 assert.throws(()=>composition(component,css+'\nhtml[data-site-project-entry]{transform:scale(.96)}'));
});
