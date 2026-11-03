import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
test('Home keeps the exact approved introduction and original research bytes',async()=>{
 const pins={'release/introduction.json':'ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b','release/public/assets/source-layers.glb':'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e','release/public/assets/studio-small.hdr':'e7cfda5f4e98e623db12b8bfd0184e048488e4855d9c83e2751fb44a32e80c45'};
 for(const [file,pin]of Object.entries(pins))assert.equal(createHash('sha256').update(await readFile(new URL(file,root))).digest('hex'),pin);
 const source=await read('components/PortfolioHome.jsx');
 assert.match(source,/data-introduction-statement>\{introduction.statement\}/);assert.match(source,/data-introduction-description>\{introduction.description\}/);
 const intro=source.slice(source.indexOf('function Introduction'),source.indexOf('function ProjectDeck'));
 assert.match(intro,/Hi, I'm JosHsuan/);assert.doesNotMatch(intro,/FEATURED RESEARCH|researchEntry|<h2|<Projects/);
});
test('Home discovery and Project index retain distinct native navigation',async()=>{
 const source=await read('components/PortfolioHome.jsx');
 assert.match(source,/<Introduction\/><ProjectDeck\/><Contact scrolling\/>/);
 assert.match(source,/<Projects standalone\/>/);assert.match(source,/data-deck-card=\{project.id\}/);
 assert.match(source,/href=\{project.href\}/);assert.match(source,/href="\/projects\/"/);assert.match(source,/href="#contact"/);
 assert.doesNotMatch(source,/<HomeResearchStage/);
});
test('Home showcase and deck borrow the site scheduler and source-verified renderer',async()=>{
 const stage=await read('runtime/site/HomeShowcasePresenter.mjs'),deck=await read('runtime/site/HomeDeckPresenter.mjs');
 for(const source of[stage,deck])assert.doesNotMatch(source,/requestAnimationFrame|setInterval|setTimeout/);
 assert.match(stage,/acquireProjectStudyScene/);assert.match(stage,/const previous=resource;resource=null;try\{previous\?\.dispose\(\)/);
 assert.match(stage,/1\/24/);assert.match(deck,/behavior:'smooth'/);
 const driver=await read('runtime/background/SiteBackgroundDriver.mjs');assert.match(driver,/showcaseMoving\|\|deckMoving/);
});
