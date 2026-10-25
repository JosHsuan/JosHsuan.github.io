import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root));
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured with git show 05b6796826a7f8bd60df01731e8335abec600711.
// Only these complete, unique context blocks may reverse. No runtime git,
// broad ARIA stripping, regenerated data baseline or source rehash exception.
const markup={
  "components/ProjectCaseStudy.jsx": {
    "baseline": "1e8c9d59ca48c9bbaa7c272be569a6c28ec879063e444ed4cf0df48e7dda1913",
    "replacements": [
      [
        "    <p className={styles.modelState} id={`${prefix}-${chapter}-model-state`} data-project-model-state={chapter} role=\"status\">Original source view.</p>\n    <p className={styles.modelDescription} data-project-model-description>{model.alt}</p>\n    <p className={styles.modelHelp} id={`${prefix}-${chapter}-model-help`} data-project-model-help={chapter} hidden>Scroll to follow the camera. With focus, use arrow keys to inspect; Home or Esc returns to the current scroll view.</p>\n    <button className={styles.sourceAction} type=\"button\" data-project-model-reset={chapter} hidden>Return to scroll view</button>\n",
        "    <p className={styles.modelState} id={`${prefix}-${chapter}-model-state`} data-project-model-state={chapter} role=\"status\">Original source view.</p>\n    <p className={styles.modelDescription} data-project-model-description>{model.alt}</p>\n    {prefix==='dot-based-3d-printing'&&chapter==='system'&&<p className={styles.dotDetailSummary} data-dot-detail-summary>14,810 recorded low-speed path sample positions. The close view examines a selected part of this point record, not an inferred surface or a deposition sequence. The next chapter shows a separate physical recording.</p>}\n    <p className={styles.modelHelp} id={`${prefix}-${chapter}-model-help`} data-project-model-help={chapter} hidden>Scroll to follow the camera. With focus, use arrow keys to inspect; Home or Esc returns to the current scroll view.</p>\n    <button className={styles.sourceAction} type=\"button\" data-project-model-reset={chapter} hidden>Return to scroll view</button>\n"
      ],
      [
        "     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner}>\n      {section.media[0]&&<PrimaryVisual image={section.media[0]} chapter={section.id} prefix={prefix} model={project.model} motion={motion}/>}\n      <Panel>\n",
        "     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner} data-dot-detail-passage={project.id==='dot-based-3d-printing'&&section.id==='system'?'':undefined}>\n      {section.media[0]&&<PrimaryVisual image={section.media[0]} chapter={section.id} prefix={prefix} model={project.model} motion={motion}/>}\n      <Panel>\n"
      ]
    ]
  },
  "components/ProjectCaseStudyStage.jsx": {
    "baseline": "697625588e79e3f96913c661d8578ac5b830476a7f4ac7c33363f779fb2f1f5f",
    "replacements": [
      [
        "   <img className={styles.modelPoster} data-project-model-poster data-site-critical src={model.poster.src} width={model.poster.width} height={model.poster.height} alt=\"\" loading=\"eager\" decoding=\"async\"/>\n  </div>\n </div>;\n}\n",
        "   <img className={styles.modelPoster} data-project-model-poster data-site-critical src={model.poster.src} width={model.poster.width} height={model.poster.height} alt=\"\" loading=\"eager\" decoding=\"async\"/>\n  </div>\n  {projectId==='dot-based-3d-printing'&&<div className={styles.dotDetailAnnotation} data-dot-detail-annotation data-dot-detail-beat=\"overview\" hidden aria-hidden=\"true\">\n   <span data-dot-detail-label=\"overview\">14,810 recorded path sample positions.</span>\n   <span data-dot-detail-label=\"detail\">Selected point detail \u00b7 no inferred surface.</span>\n   <span data-dot-detail-label=\"return\">Complete point record.</span>\n   <span data-dot-detail-label=\"handoff\">Next: a separate physical recording.</span>\n  </div>}\n </div>;\n}\n"
      ]
    ]
  },
  "components/ProjectCaseStudy.module.css": {
    "baseline": "2d2bab984ea7c78fefa0909d900224c9f626539fe995573e8ed99aa12a25a432",
    "replacements": [
      [
        "\n.evidenceImage{position:relative;isolation:isolate}\n",
        "\n.evidenceImage{position:relative;isolation:isolate}\n\n/* Optional source-reading annotation: outside the transformed source canvas.\n   The existing presenter alone publishes actual painted-model eligibility/beat. */\n.sourcePanel>.dotDetailSummary{font-size:var(--type-size-caption);line-height:var(--type-leading-caption);letter-spacing:var(--type-tracking-caption)}\n.dotDetailAnnotation{position:absolute;left:48%;top:calc(92% + .5rem);width:51%;display:grid;pointer-events:none;text-align:center;color:var(--paper);font-size:var(--type-size-caption);line-height:var(--type-leading-caption);letter-spacing:var(--type-tracking-caption)}\n.dotDetailAnnotation[hidden]{display:none}\n.dotDetailAnnotation>span{grid-area:1/1;visibility:hidden;padding:0 .5rem;overflow-wrap:anywhere}\n.dotDetailAnnotation:global([data-dot-detail-beat=overview])>:global([data-dot-detail-label=overview]),\n.dotDetailAnnotation:global([data-dot-detail-beat=detail])>:global([data-dot-detail-label=detail]),\n.dotDetailAnnotation:global([data-dot-detail-beat=return])>:global([data-dot-detail-label=return]),\n.dotDetailAnnotation:global([data-dot-detail-beat=handoff])>:global([data-dot-detail-label=handoff]){visibility:visible}\n@media(max-width:799px){.dotDetailAnnotation{left:3%;top:calc(65% + .5rem);width:94%}}\n@media(max-height:600px),(prefers-reduced-motion:reduce),(forced-colors:active){.dotDetailAnnotation{display:none}}\n@media print{.dotDetailAnnotation{display:none}}\n"
      ]
    ]
  }
};
const immutable={
  "release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "release/xr-assets.json": "33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad",
  "release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "release/contact.json": "c68b4bc45a3ecc13eeee55bae43f3cab75f2085a095a5084e1494f90c5695882",
  "release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "release/story.json": "250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da",
  "release/xr-workspace.json": "41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211",
  "release/dot-web-delivery.json": "f43d76d380dc5d1fbb55d67f6c02c2f4b142535e011662feeb176f931535ad0e",
  "release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "components/research-scene-geometry.mjs": "b46d6d873b971fe1ccfc11222b577cb216104897da64cd4675b888115b91a4c0",
  "components/project-study-appearance.mjs": "9314e35913f3bc2547f16dd319773beb35357582f8bc7159fecab3d1e4e5b0b8",
  "components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f",
  "components/XRProject.jsx": "25a0b301ebca2ca280643cbe13f8303ffee8e72022c53684340529f09864f075",
  "components/BendingProject.jsx": "585b055ff08bb0c8451d1780b6cf1268088b2ec46ded4661a2da46bca7b97970"
};
function original(source,contract){
 for(const [before,after] of contract.replacements){assert.equal(source.split(after).length,2,'Exact approved block occurs once');source=source.replace(after,before);}
 assert.equal(hash(source),contract.baseline,'All other component bytes remain deployed original');return source;
}
test('Dot presentation keeps all published data, sources, default fitter and other case components exact',async()=>{
 for(const [path,expected] of Object.entries(immutable))assert.equal(hash(await read(path)),expected,path);
 const manifest=JSON.parse(await read('release/manifest.json'));
 assert.equal(manifest.assets.length,137);
 for(const asset of manifest.assets){const bytes=await read('release/public/'+asset.path);assert.equal(bytes.length,asset.bytes,asset.path);assert.equal(hash(bytes),asset.sha256,asset.path);}
});
test('only exact Dot native summary, outside-canvas annotation and additive styles change markup',async()=>{
 for(const [path,contract] of Object.entries(markup))original((await read(path)).toString(),contract);
 const jsx=(await read('components/ProjectCaseStudy.jsx')).toString(),stage=(await read('components/ProjectCaseStudyStage.jsx')).toString(),css=(await read('components/ProjectCaseStudy.module.css')).toString();
 assert.equal(jsx.split('data-dot-detail-summary').length,2);assert.match(jsx,/prefix==='dot-based-3d-printing'&&chapter==='system'/);
 assert.match(stage,/data-dot-detail-annotation data-dot-detail-beat="overview" hidden aria-hidden="true"/);
 assert.equal((stage.match(/data-dot-detail-label=/g)||[]).length,4);
 assert.match(jsx,/not an inferred surface or a deposition sequence/);assert.match(jsx,/separate physical recording/);
 assert.match(css,/@media\(max-height:600px\),\(prefers-reduced-motion:reduce\),\(forced-colors:active\)/);
 assert.match(css,/pointer-events:none/);
});
test('exact presentation proof rejects unrelated source, caption, ownership and style mutations',async()=>{
 for(const [path,contract] of Object.entries(markup)){
  const source=(await read(path)).toString();assert.throws(()=>original(source+'\n/* unrelated */',contract));
  const after=contract.replacements[0][1];assert.throws(()=>original(source.replace(after,after+'\n'+after),contract));
 }
 const jsx=(await read('components/ProjectCaseStudy.jsx')).toString();
 for(const [from,to] of [['href={image.src}','href="https://example.invalid/"'],['{image.caption}','{"Invented caption"}'],['data-information-motion-surface="plane"','data-information-motion-surface="new-owner"']])assert.throws(()=>original(jsx.replace(from,to),markup['components/ProjectCaseStudy.jsx']));
});
test('detail is a declared camera crop while the complete original point record remains the draw source',async()=>{
 const projects=JSON.parse(await read('release/project-studies.json')).projects,dot=projects.find(p=>p.id==='dot-based-3d-printing');
 assert.equal(dot.model.sha256,'60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891');assert.equal(dot.model.vertices,14810);assert.equal(dot.model.triangles,0);assert.equal(dot.model.primitive,'points');
 const bytes=await read('release/public'+dot.model.src),length=bytes.readUInt32LE(12),glb=JSON.parse(bytes.subarray(20,20+length));
 assert.equal(glb.meshes.length,1);assert.equal(glb.meshes[0].primitives[0].mode,0);assert.equal(glb.accessors[0].count,14810);assert.equal(glb.animations,undefined);
 const scene=(await read('components/project-study-scene.mjs')).toString(),score=(await read('components/dot-detail-score.mjs')).toString();
 assert.match(scene,/revision===DOT_SOURCE_REVISION\?createDotDetailCollector\(\):null/);
 assert.match(scene,/detailWeight=nextDetail/);assert.match(score,/if\(weight===0\)return full/);
 assert.match(score,/editorial-source-coordinate-window/);assert.match(score,/allSourcePrimitivesRetained:true/);
 assert.doesNotMatch(scene,/setDrawRange|\.drawRange\s*=|\.setIndex\(|\.geometry\.setAttribute\(/);
 // Full framing is still mandatory at weight0. Labelled detail permits only
 // screen-space crop; actual-point projection/near-far and renderer tests prove
 // the geometric dual contract. Source inspection is not browser pixel proof.
});

test('build delivery adds only the exact Dot score helper to the existing allowlist',async()=>{
 const source=await readFile(new URL('../../scripts/build-pages.mjs',import.meta.url),'utf8');
 const before="  'components/project-study-appearance.mjs',\n",after="  'components/project-study-appearance.mjs', 'components/dot-detail-score.mjs',\n";
 assert.equal(source.split(after).length,2);assert.equal(hash(source.replace(after,before)),'f6d920e4ea45cb540f8c6dac2b3fae9187becb5ef78e5cfe82b5ed82e8591833');
 assert.throws(()=>assert.equal(hash((source+'unrelated').replace(after,before)),'f6d920e4ea45cb540f8c6dac2b3fae9187becb5ef78e5cfe82b5ed82e8591833'));
});
