// Historical exact-baseline checks below first reverse ONLY the separately
// reviewed 26 October scroll-reading delta; raw current-DOM contracts live in
// scroll-reading-contract.test.mjs and source-access.test.mjs. No asset is normalized.
import assert from 'node:assert/strict';
import {readFile as readActualFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readReviewedFile as readFile} from './scroll-reading-contract.mjs';
import test from 'node:test';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independent immutable fdb67bcb source capture. Exact approved desktop-only
// suffix removal protects every pre-existing rule, including native <=780px.
// This is source/intrinsic-track coverage, not measured browser stability.
const baselineHash="646024f3bcb9913461d76bfd5993f7ab47a2edfcaadb3d9a1a591d502a5fed94";
const addition="\n/* The fixed desktop card uses the same intrinsic all-source envelopes as the\n   native card, so a representation change cannot resize its reading tracks. */\n@media(min-width:781px){\n .titleSlot{display:grid;grid-template-columns:minmax(0,1fr);margin:14px 0 8px}\n .titleSlot h3{grid-area:1/1;min-width:0;margin:0}\n .titleSizer{display:grid;grid-area:1/1;min-width:0;min-height:2.4em;visibility:hidden;pointer-events:none;user-select:none;font-family:var(--display);font-size:clamp(14px,1.25vw,20px);line-height:var(--type-leading-subheading);font-weight:500;letter-spacing:var(--type-tracking-subheading);overflow-wrap:anywhere}\n .titleSizer>span{grid-area:1/1;min-width:0}\n .positionSlot,.annotationSlot{display:grid;grid-template-columns:minmax(0,1fr);min-width:0}\n .positionSlot>.position,.annotationSlot>span{grid-area:1/1;min-width:0}\n .positionSizer,.annotationSizer{display:grid;visibility:hidden;pointer-events:none;user-select:none}\n .positionSizer>span,.annotationSizer>span{grid-area:1/1;min-width:0}\n}\n";
const pins={
  "components/ModelInspector.jsx": "3f8e62eb750bf5e1846c658374b6b66d4e5100fd5b345dbbf767f9866764a51d",
  "components/model-information.mjs": "c2a9bfd99eefce1293c7cd5fa1f673b2dd0c041c4db3fca99a8fb05e2b13e450",
  "runtime/features/ModelManager.mjs": "ad0dbb4a26b3757d828afb7f5193d2f9e15579b75808eb86594db3e32b69cbe7"
};
function verify(css){
 assert.equal(css.split(addition).length,2,'exact desktop reserve occurs once');
 assert(css.endsWith(addition),'approved addition is an isolated suffix');
 assert.equal(hash(css.slice(0,-addition.length)),baselineHash,'original rules must remain byte-identical');
}
test('desktop model-label reserve is an exact intrinsic suffix, not a changed mobile or typography baseline',async()=>{
 const css=await read('components/model-inspector.module.css');verify(css);
 assert.match(addition,/@media\(min-width:781px\)/);
 assert.doesNotMatch(addition,/(?:^|[;{])(?:height|max-height):|overflow:(?:hidden|clip)|display:none/);
 for(const name of ['titleSizer','positionSizer','annotationSizer'])assert(addition.includes('.'+name));
 assert.match(addition,/grid-template-columns:minmax\(0,1fr\)/);
 assert.match(addition,/visibility:hidden;pointer-events:none;user-select:none/);
});
test('existing source variants, accessible current labels and original model policy stay byte-identical',async()=>{
 for(const [path,expected] of Object.entries(pins))assert.equal(hash(await read(path)),expected,path);
 const jsx=await read('components/ModelInspector.jsx');
 assert.match(jsx,/titleSizer} aria-hidden="true"/);
 assert.match(jsx,/\.\.\.study.labels,'Source geometry','Assembly reference'/);
 assert.match(jsx,/ANNOTATION_LABELS.map/);
 assert.match(jsx,/Representation 4 \/ 4/);
 assert.match(jsx,/Experiment 3 \/ 3/);
});
test('missing, duplicated, fixed-height and unrelated baseline mutations fail closed',async()=>{
 const css=await read('components/model-inspector.module.css');
 for(const broken of [css.slice(0,-addition.length),css+addition,css.replace('@media(min-width:781px)','@media(min-width:780px)'),css.replace('.titleSlot{display:grid;','.titleSlot{height:76px;display:grid;'),css.replace('.titleSizer{display:grid;','.titleSizer{display:none;'),css.replace('.overlay{position:fixed;','.overlay{position:absolute;')])assert.throws(()=>verify(broken));
});

// Actual current pointer policy is separate from the historical intrinsic-track
// proof above: only the noninteractive geometry surface ignores pointer input.
test('native source information remains selectable while geometry never captures reading gestures',async()=>{
 const css=await readActualFile(new URL('components/model-inspector.module.css',root),'utf8');
 assert.match(css,/\.surface\{pointer-events:none\}/);
 assert.doesNotMatch(css,/\.surface,\.sideLabel\{pointer-events:none\}/);
 const jsx=await readActualFile(new URL('components/ModelInspector.jsx',root),'utf8');
 assert.match(jsx,/<aside[^>]*data-model-side-label/);
 assert.doesNotMatch(jsx,/model\.pointer|role="button"|onKeyDown=|onClick=/);
});
