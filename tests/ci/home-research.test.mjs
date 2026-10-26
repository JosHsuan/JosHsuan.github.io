// Historical exact-baseline checks below first reverse ONLY the separately
// reviewed 26 October scroll-reading delta; raw current-DOM contracts live in
// scroll-reading-contract.test.mjs and source-access.test.mjs. No asset is normalized.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readReviewedFile as readFile} from './scroll-reading-contract.mjs';
import {createHash} from 'node:crypto';
import {originalHomeSource,homeResearchReplacements} from './home-research-contract.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root));
const pins={
  "release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "release/public/assets/source-layers.glb": "ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e",
  "release/public/assets/source-layers.json": "355633399d5cb38d8b340fe96a53314dca6d1f88b87cbdb6b3167a5ad81610ea",
  "release/public/assets/studio-small.hdr": "e7cfda5f4e98e623db12b8bfd0184e048488e4855d9c83e2751fb44a32e80c45",
  "release/public/assets/cinematic/model-poster.webp": "931181ca2b0722d27f41bddbf60121c5d058d4297bd809aee9eb2fec68d377e7",
  "components/ProjectModelPreview.jsx": "1effe8937f21a0ca53bc905632a9a5832add5a182075978546019a4a2cab9089",
  "components/project-model-recipe.mjs": "8853992d826fa710441bffda22283963972fda78e508eb3cdb4956b72418fdc4"
};
test('Home redesign retains original research assets, study records and default Projects renderer recipe',async()=>{for(const [path,digest] of Object.entries(pins))assert.equal(createHash('sha256').update(await read(path)).digest('hex'),digest,path);});
test('Home changes only the exact hero/entry/grid ownership markup',async()=>{const source=(await read('components/PortfolioHome.jsx')).toString();originalHomeSource(source);assert.ok(source.includes("project.id==='bending-active'&&standalone"));assert.equal(source.split('<HomeResearchStage ').length,2);assert.equal(source.split('data-home-research-link').length,2);});
test('Home proof rejects unrelated source, copy, link and ownership mutations',async()=>{const source=(await read('components/PortfolioHome.jsx')).toString();for(const [before,after] of homeResearchReplacements){assert.throws(()=>originalHomeSource(source.replace(after,before)));}for(const [from,to] of [["'/assets/cinematic/model-poster.webp'","'/assets/other.webp'"],["href=\"/projects/bending-active/\"","href=\"/projects/\""],["<HomeResearchStage ","<ProjectModelPreview "]]){assert.ok(source.includes(from));assert.throws(()=>originalHomeSource(source.replace(from,to)));}assert.throws(()=>originalHomeSource(source+'\n// Unreviewed change'));});
