import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured from deployed 05b6796826a7f8bd60df01731e8335abec600711.
// No runtime git baseline and no arbitrary JSX/ARIA/CSS stripping.
const reversals={
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.jsx": {
    "sha256": "1e8c9d59ca48c9bbaa7c272be569a6c28ec879063e444ed4cf0df48e7dda1913",
    "blocks": [
      // Entrance exact833 reversal independently proved in entrance-hybrid-scenes.test.mjs.
      ["     </div>\n    </header>}\n    {project.sections.map((section,index)=>{\n     if(hybrid?.results.section===section)return <NativeStudyChapter key={section.id} project={project} section={section} index={index} scene={hybrid.results.scene} evidence={hybrid.results.evidence}/>;\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner}>\n", "     </div>\n    </header>}\n    {project.sections.map((section,index)=>{\n     if(hybrid?.results?.section===section)return <NativeStudyChapter key={section.id} project={project} section={section} index={index} scene={hybrid.results.scene} evidence={hybrid.results.evidence}/>;\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner}>\n"],
      [
        "import InformationSkin from './InformationSkin';\nimport EntranceDiagramFocus from './EntranceDiagramFocus';\nimport {projectStudyEvidence} from './project-study-media.mjs';\nimport {projectStudyLayout,projectStudyEvidenceLayout} from './project-study-layout.mjs';\n",
        "import InformationSkin from './InformationSkin';\nimport EntranceDiagramFocus from './EntranceDiagramFocus';\nimport EditorialProjectStudy,{NativeStudyOpening,NativeStudyChapter} from './EditorialProjectStudy';\nimport {editorialProjectLayout,hybridProjectLayout} from './project-editorial-layout.mjs';\nimport {projectStudyEvidence} from './project-study-media.mjs';\nimport {projectStudyLayout,projectStudyEvidenceLayout} from './project-study-layout.mjs';\n"
      ],
      [
        " * selected application's material, entry and ordinary-page clock. */\nexport default function ProjectCaseStudy({project}){\n const prefix=project.id,evidenceByChapter=projectStudyEvidence(project),chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits'}];\n return <>\n  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>\n  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>\n  <main id=\"portfolio-main\" tabIndex={-1} className={styles.page} data-project-study={project.id} data-information-motion-profile=\"velocity-skin\" data-portfolio-root data-portfolio-section=\"project-study\">\n   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}\n   <article aria-labelledby={`${prefix}-overview-heading`}>\n    <header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.chapter} ${styles.opening}`} data-project-chapter=\"overview\" {...layoutAttributes(projectStudyLayout(project,'overview'))}>\n     <div className={styles.chapterInner}>\n      <Panel opening>\n",
        " * selected application's material, entry and ordinary-page clock. */\nexport default function ProjectCaseStudy({project}){\n const editorial=editorialProjectLayout(project);\n if(editorial)return <EditorialProjectStudy project={project} layout={editorial}/>;\n const hybrid=hybridProjectLayout(project);\n const prefix=project.id,evidenceByChapter=projectStudyEvidence(project),chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits'}];\n return <>\n  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>\n  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>\n  <main id=\"portfolio-main\" tabIndex={-1} className={styles.page} data-project-study={project.id} data-study-presentation={hybrid?'hybrid-scenes':undefined} data-information-motion-profile=\"velocity-skin\" data-portfolio-root data-portfolio-section=\"project-study\">\n   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}\n   <article aria-labelledby={`${prefix}-overview-heading`}>\n    {hybrid?<NativeStudyOpening project={project}/>:<header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.chapter} ${styles.opening}`} data-project-chapter=\"overview\" {...layoutAttributes(projectStudyLayout(project,'overview'))}>\n     <div className={styles.chapterInner}>\n      <Panel opening>\n"
      ],
      [
        "      <PrimaryVisual image={project.hero} chapter=\"overview\" prefix={prefix} opening model={project.model} motion={project.motionMedia?.find(media=>media.chapter==='overview')}/>\n     </div>\n    </header>\n    {project.sections.map((section,index)=>{\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n",
        "      <PrimaryVisual image={project.hero} chapter=\"overview\" prefix={prefix} opening model={project.model} motion={project.motionMedia?.find(media=>media.chapter==='overview')}/>\n     </div>\n    </header>}\n    {project.sections.map((section,index)=>{\n     if(hybrid?.results.section===section)return <NativeStudyChapter key={section.id} project={project} section={section} index={index} scene={hybrid.results.scene} evidence={hybrid.results.evidence}/>;\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n"
      ],
      [
        "     {evidence.length>0&&<div className={styles.evidenceBand}>{evidence.map(image=><EvidenceFigure key={image.src} image={image}/>)}</div>}\n    </section>;})}\n    <footer id={`${prefix}-credits`} tabIndex={-1} className={`${styles.chapter} ${styles.creditsChapter}`} data-project-chapter=\"credits\" aria-labelledby={`${prefix}-credits-heading`} {...layoutAttributes(projectStudyLayout(project,'credits'))}>\n     <div className={styles.chapterInner}><Panel>\n      <StudyLabel kind=\"make\">{String(chapters.length-1).padStart(2,'0')} / CREDITS</StudyLabel>\n",
        "     {evidence.length>0&&<div className={styles.evidenceBand}>{evidence.map(image=><EvidenceFigure key={image.src} image={image}/>)}</div>}\n    </section>;})}\n    <footer id={`${prefix}-credits`} tabIndex={-1} className={`${styles.chapter} ${styles.creditsChapter}`} data-project-chapter=\"credits\" data-project-native-source={hybrid?'credits':undefined} aria-labelledby={`${prefix}-credits-heading`} {...layoutAttributes(projectStudyLayout(project,'credits'))}>\n     <div className={styles.chapterInner}><Panel>\n      <StudyLabel kind=\"make\">{String(chapters.length-1).padStart(2,'0')} / CREDITS</StudyLabel>\n"
      ]
    ]
  },
  "scripts/build-pages.mjs": {
    "sha256": "f6d920e4ea45cb540f8c6dac2b3fae9187becb5ef78e5cfe82b5ed82e8591833",
    "blocks": [
      [
        "  'components/ProjectCaseStudy.jsx', 'components/ProjectCaseStudy.module.css', 'components/project-study-media.mjs', 'components/project-study-layout.mjs',\n",
        "  'components/ProjectCaseStudy.jsx', 'components/ProjectCaseStudy.module.css', 'components/project-study-media.mjs', 'components/project-study-layout.mjs',\n  'components/EditorialProjectStudy.jsx', 'components/EditorialProjectStudy.module.css', 'components/project-editorial-layout.mjs',\n"
      ]
    ]
  }
};
const pins={
  "roles/uiux-designer/cases/bending-active-thesis/release/contact.json": "c68b4bc45a3ecc13eeee55bae43f3cab75f2085a095a5084e1494f90c5695882",
  "roles/uiux-designer/cases/bending-active-thesis/release/dot-web-delivery.json": "f43d76d380dc5d1fbb55d67f6c02c2f4b142535e011662feeb176f931535ad0e",
  "roles/uiux-designer/cases/bending-active-thesis/release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "roles/uiux-designer/cases/bending-active-thesis/release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "roles/uiux-designer/cases/bending-active-thesis/release/story.json": "250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-assets.json": "33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json": "41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.module.css": "2d2bab984ea7c78fefa0909d900224c9f626539fe995573e8ed99aa12a25a432",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudyStage.jsx": "697625588e79e3f96913c661d8578ac5b830476a7f4ac7c33363f779fb2f1f5f",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs": "1eeb0aaf68cb6bdd6f844b3025405005fd5891ed4bff87edff836bf3e5567682",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f",
  "roles/uiux-designer/cases/bending-active-thesis/components/XRProject.jsx": "25a0b301ebca2ca280643cbe13f8303ffee8e72022c53684340529f09864f075",
  "roles/uiux-designer/cases/bending-active-thesis/components/BendingProject.jsx": "585b055ff08bb0c8451d1780b6cf1268088b2ec46ded4661a2da46bca7b97970",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-scene.mjs": "f04ca2d77f48a2bc3c366fee0d4a4a0959ce718db7b4f4263a050823193b659e"
};
// Hybrid changes additionally reverse to d3 in hybrid-scenes.test.mjs.
// Reviewed new templates are frozen, not treated as proof of rendered accessibility.
const templates={
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.jsx": "ba1bed68dc665013c2a076d6bf3b30c07830a3e6c0e480c0b4fe82131d98e0b6",
  // Exact Dot policy/CSS deltas are independently reversed in dot-hybrid-scenes.test.mjs.
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.module.css": "fd89ea83120fba43a85c4e49d7707f99dcef519c8add49388a79b7e6a4159b52",
  // Exact HC-only addition is independently reversed in hc3dp-hybrid.test.mjs.
  "roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs": "fc911953c502dd2835a17e2964dd45627c44217414ca676d7757daecffa15f94"
};
function original(path,source){
 for(const [before,after]of reversals[path].blocks){assert.equal(source.split(after).length,2,'Unique exact approved context');source=source.replace(after,before);}
 assert.equal(hash(source),reversals[path].sha256,path);return source;
}
test('editorial dispatch and build additions reverse exactly to the independent live baseline',async()=>{
 for(const path of Object.keys(reversals))original(path,await read(path));
});
test('editorial reversals reject extra edits, missing or duplicated dispatch and changed source anchors',async()=>{
 for(const path of Object.keys(reversals)){
  const source=await read(path),after=reversals[path].blocks[0][1];
  for(const changed of [source+'\n',source.replace(after,''),source.replace(after,after+after),source.replace('EditorialProjectStudy','OtherProjectStudy')])assert.throws(()=>original(path,changed));
 }
 const path=casePath+'components/ProjectCaseStudy.jsx',source=await read(path);
 assert.throws(()=>original(path,source.replace('href={image.src}','href="/wrong-source"')));
});
test('editorial presentation preserves all release data, original source assets and unrelated renderers',async()=>{
 for(const [path,expected]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),expected,path);
 const manifest=JSON.parse(await read(casePath+'release/manifest.json'));assert.equal(manifest.assets.length,137);
 for(const asset of manifest.assets){const bytes=await readFile(new URL(casePath+'release/public/'+asset.path.replace(/^\//,''),root));assert.equal(bytes.length,asset.bytes,asset.path);assert.equal(hash(bytes),asset.sha256,asset.path);}
});
const sceneNames=['portfolio-tower-on-site.webp','portfolio-timber-model.webp','portfolio-xr-workshop.webp','portfolio-robotic-assembly.webp','portfolio-timber-interior.webp'];
const evidenceNames=['portfolio-voxel-framework.webp','portfolio-module-infill.webp','portfolio-xr-assembly-sequence.webp','portfolio-xr-interface.webp','portfolio-xr-data-exchange.webp'];
test('only Cas uses ten original native figures, six existing evidence actions and one workshop reference',async()=>{
 const projects=JSON.parse(await read(casePath+'release/project-studies.json')).projects;
 for(const project of projects){
  const before=JSON.stringify(project),rows=editorialProjectLayout(project);assert.equal(JSON.stringify(project),before);
  if(project.id!=='project-caschlatsch'){assert.equal(rows,null);continue;}
  const prefix='/assets/projects/project-caschlatsch/';
  assert.deepEqual(rows.map(r=>r.section.id),['context','system','xr-guidance','making','results']);
  assert.deepEqual(rows.map(r=>r.scene.src),sceneNames.map(n=>prefix+n));
  assert.deepEqual(rows.flatMap(r=>r.evidence.map(i=>i.src)),evidenceNames.map(n=>prefix+n));
  assert.deepEqual(rows.flatMap(r=>r.references.map(i=>i.src)),[prefix+'portfolio-xr-workshop.webp']);
  assert.deepEqual(project.hero,rows[1].scene,'Consolidated hero has no unique caption/credit/source omitted');
  const images=rows.flatMap(r=>[r.scene,...r.evidence]);assert.equal(images.length,10);assert.equal(new Set(images.map(i=>i.src)).size,10);
  const actions=rows.flatMap(r=>[...(r.section.media.indexOf(r.scene)>0?[r.scene]:[]),...r.evidence]);assert.deepEqual(actions.map(i=>i.src),[...evidenceNames,'portfolio-robotic-assembly.webp'].map(n=>prefix+n));
  for(const row of rows){assert.equal(row.section,project.sections.find(s=>s.id===row.section.id));assert.deepEqual(new Set([row.scene,...row.evidence,...row.references]),new Set(row.section.media));}
  for(const bad of [{...project,model:{}},{...project,motionMedia:[{}]},{...project,sections:[{id:'unreviewed'}]},{...project,sections:[{...project.sections[0],media:[]}]}])assert.throws(()=>editorialProjectLayout(bad));
 }
});
test('native editorial templates retain secure source actions, captions, complete images and one glass owner per surface',async()=>{
 for(const [path,expected]of Object.entries(templates))assert.equal(hash(await read(path)),expected,path);
 const source=await read(casePath+'components/EditorialProjectStudy.jsx'),css=await read(casePath+'components/EditorialProjectStudy.module.css');
 assert(source.includes('data-evidence-source-link={evidence?'));assert(source.includes('rel="noopener noreferrer"'));assert(source.includes('aria-label={`Open full image (new tab): ${image.alt}`}'));
 assert(source.includes('<p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image} evidence={evidence}/>'));
 assert(source.includes('width={image.width} height={image.height} alt={image.alt}'));assert(source.includes('href={image.src} target="_blank"'));
 assert(!/data-project-media|<canvas|onClick=|requestAnimationFrame|setInterval|setTimeout/.test(source));
 assert(css.includes('position:relative;z-index:2;'));assert(css.includes('height:auto;object-fit:contain'));assert(css.includes('min-height:44px'));assert(css.includes('@media(forced-colors:active)'));
 // Credit typography must not activate the decorative skin before its presenter is ready.
 const creditSelectors='.scene figcaption>span:not(:global([data-information-skin])),.evidence figcaption>span:not(:global([data-information-skin])),.reference>span';
 assert(css.includes(`${creditSelectors}{display:block;`));
 assert(!/\.(?:scene|evidence) figcaption>span(?=[,{])/.test(css),'Unqualified credit selectors must not override the no-JavaScript skin suppression');
 const globals=await read(casePath+'app/globals.css');
 assert(globals.includes('[data-information-skin]{display:none;'));
 assert(globals.includes('html [data-information-window][data-information-ready]>[data-information-skin]{'));
 const driver=await read(casePath+'runtime/background/SiteBackgroundDriver.mjs');
 assert(driver.includes("getAttribute('data-study-presentation')==='editorial-scenes'"));assert(driver.includes('if(studyRoot&&!editorialStudy)projectBackdrop='));assert(driver.includes('if(studyRoot&&!editorialStudy)releaseStage='));assert(driver.includes("listen(image,'load',publish)"));assert(driver.includes("listen(image,'error'"));
});
