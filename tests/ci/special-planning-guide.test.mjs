import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assertProjectStudies} from '../../scripts/project-studies.mjs';
import {projectStudyEvidence} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
const source='/assets/projects/special-assemblies/planning-workflow.webp';
const bounds=[[132,1180,238,102],[590,1204,162,78],[828,1204,474,78]];
const getSystem=data=>data.projects.find(p=>p.id==='special-assemblies').sections.find(s=>s.id==='system');
const data=()=>JSON.parse(read('release/project-studies.json'));
const manifest=()=>JSON.parse(read('release/manifest.json'));
// Independently fixed from bb602416, not generated from the current candidate.
const originalStudyHash="b5868af8313e4ff7754fc86718c8f13f2296a2254f201455b9973b6afb24e31f";
const originalManifestExceptStudyHash="b556972d0790d9b29d4c7f27ef02e83ad88a26d8de5945332b20fc059585da3b";
const unchangedPins={
  "components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f",
  "components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001"
};
function originalData(value){
 const copy=structuredClone(value),section=getSystem(copy);
 assert(section.diagramFocus,'Only the approved additive guide may be normalized');
 delete section.diagramFocus;
 assert.equal(hash(JSON.stringify(copy)),originalStudyHash,'All prior prose, media order, source metadata, cameras, motion, credits and other cases are unchanged');
}
test('Special guide is the sole additive data change and preserves Entrance/source/dedup bytes',()=>{
 originalData(data());
 for(const [path,pin]of Object.entries(unchangedPins))assert.equal(hash(read(path)),pin,path);
 const m=manifest();assert.equal(m.projectStudiesSHA256,hash(read('release/project-studies.json')));delete m.projectStudiesSHA256;
 assert.equal(hash(JSON.stringify(m)),originalManifestExceptStudyHash,'Only the corresponding release data digest changes');
});
test('new guide uses the exact original complete foreground plate once, with three reviewed source-pixel regions',()=>{
 const d=data(),p=d.projects.find(p=>p.id==='special-assemblies'),s=getSystem(d),g=s.diagramFocus;
 assert.deepEqual(Object.keys(g).sort(),['source','steps','title']);assert.equal(g.source,source);
 assert.deepEqual(g.steps.map(x=>x.bounds),bounds);assert.equal(g.steps.length,3);
 const images=projectStudyEvidence(p).get('system');
 assert.deepEqual(images.map(x=>x.src),['/assets/projects/special-assemblies/module-aggregation.webp',source]);
 assert.equal(images.filter(x=>x.src===source).length,1);
 const image=images.find(x=>x.src===source);assert.deepEqual([image.width,image.height,image.purpose],[1536,1903,'diagram']);
 assert.notEqual(s.media[0].src,source);
 assertProjectStudies(d,manifest());
});
function fixture(){
 const d=data(),s=getSystem(d);s.diagramFocus={title:'Planning guide',source,steps:bounds.map((bounds,i)=>({label:['Generate','Plan','Replan'][i],description:'Read the original source node.',bounds}))};return d;
}
test('bounded schema rejects other projects/chapters/sources, duplicate or primary placement, unsupported transforms and invalid regions',()=>{
 const reject=change=>{const d=fixture();change(d,getSystem(d));assert.throws(()=>assertProjectStudies(d,manifest()));};
 assert.doesNotThrow(()=>assertProjectStudies(fixture(),manifest()));
 for(const change of [
  (d,s)=>{d.projects[0].sections[0].diagramFocus=s.diagramFocus;},
  (d,s)=>{d.projects.find(p=>p.id==='special-assemblies').sections[0].diagramFocus=s.diagramFocus;},
  (d,s)=>{s.diagramFocus.source=s.media[0].src;},
  (d,s)=>{s.media.push(s.media.find(i=>i.src===source));},
  (d,s)=>{s.media.unshift(s.media.find(i=>i.src===source));},
  (d,s)=>{s.diagramFocus.crop=[0,0,1,1];},
  (d,s)=>{s.diagramFocus.steps.pop();},
  (d,s)=>{s.diagramFocus.steps[0].bounds=[0,0,1537,1903];},
  (d,s)=>{s.diagramFocus.steps[0].bounds=[0,0,Infinity,1];},
  (d,s)=>{s.diagramFocus.steps[0].description='';},
 ])reject(change);
});
test('independent baseline rejects unrelated prose, camera, source and Entrance drift',()=>{
 for(const change of [
  d=>{getSystem(d).paragraphs[0]+=' changed';},
  d=>{d.projects.find(p=>p.id==='special-assemblies').model.cameraPath[0].zoom+=.01;},
  d=>{getSystem(d).media[1].caption+=' changed';},
  d=>{d.projects.find(p=>p.id==='entrance-installation-art').sections[0].diagramFocus.steps[0].bounds[0]+=1;},
 ]){const d=fixture();change(d);assert.throws(()=>originalData(d));}
});

// Literal additive UI blocks independently reviewed against bb602416.
const markupChanges=[
  [
    "function EvidenceFigure({image}){\n return <figure className={styles.evidence} data-study-evidence-layout={projectStudyEvidenceLayout(image)} data-study-evidence-role={image.purpose==='diagram'?'technical-plate':'photograph'}>\n  <a className={styles.evidenceImage} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-evidence\" href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image (new tab): ${image.alt}`}><InformationSkin/><img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading=\"lazy\" decoding=\"async\"/></a>\n",
    "function EvidenceFigure({image,guide,guideId}){\n return <figure className={styles.evidence} data-special-planning-guide={guide?guideId:undefined} data-study-evidence-layout={projectStudyEvidenceLayout(image)} data-study-evidence-role={image.purpose==='diagram'?'technical-plate':'photograph'}>\n  <a className={styles.evidenceImage} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-evidence\" href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image (new tab): ${image.alt}`}><InformationSkin/>{guide?<span className={styles.planningPlate}><img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading=\"lazy\" decoding=\"async\"/>\n   <svg className={styles.planningOverlay} viewBox={`0 0 ${image.width} ${image.height}`} aria-hidden=\"true\" focusable=\"false\">\n    {guide.steps.map((step,index)=><g key={step.label} data-planning-region={index}>{['halo','outline'].map(layer=><rect key={layer} data-planning-stroke={layer} x={step.bounds[0]} y={step.bounds[1]} width={step.bounds[2]} height={step.bounds[3]} pathLength=\"1\" vectorEffect=\"non-scaling-stroke\"/>)}</g>)}\n   </svg>\n  </span>:<img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading=\"lazy\" decoding=\"async\"/>}</a>\n  {guide&&<div className={styles.planningGuide}>\n   <h3>{guide.title}</h3>\n   <p className={styles.planningNote}>Reading guide to the original planning diagram; outlines identify source nodes, not simulated robot motion.</p>\n   <fieldset className={styles.planningChoices}>\n    <legend>Choose a relationship to follow</legend>\n    <label><input type=\"radio\" name={guideId} value=\"all\" defaultChecked/><span>Complete plate</span></label>\n    {guide.steps.map((step,index)=><label key={step.label}><input type=\"radio\" name={guideId} value={String(index)}/><span>{step.label}</span></label>)}\n   </fieldset>\n   <div className={styles.planningDescriptions}>\n    <p data-planning-description=\"all\">Explore any of the three source relationships, or return to the complete plate. These choices are a reading guide, not an execution sequence.</p>\n    {guide.steps.map((step,index)=><p key={step.label} data-planning-description={index}>{step.description}</p>)}\n   </div>\n  </div>}\n"
  ],
  [
    "     {evidence.length>0&&<div className={styles.evidenceBand}>{evidence.map(image=><EvidenceFigure key={image.src} image={image}/>)}</div>}\n",
    "     {evidence.length>0&&<div className={styles.evidenceBand}>{evidence.map(image=><EvidenceFigure key={image.src} image={image} guide={project.id==='special-assemblies'&&section.id==='system'&&section.diagramFocus?.source===image.src?section.diagramFocus:undefined} guideId={`${prefix}-${section.id}-guide`}/>)}</div>}\n"
  ]
];
const oldComponentHash="1e8c9d59ca48c9bbaa7c272be569a6c28ec879063e444ed4cf0df48e7dda1913";
const cssAddition="\n/* One source-bound reading guide; the original image/caption remain authoritative. */\n.planningGuide{padding:clamp(1rem,3vw,2rem);margin-bottom:1rem;border:1px solid var(--glass-border);border-radius:20px;background:var(--glass-background);color:var(--glass-foreground)}\n.planningGuide h3{margin:0 0 1rem;font:400 var(--type-size-subheading)/var(--type-leading-subheading) var(--ocr)}\n.planningNote{margin:0;max-width:68ch;font:400 var(--type-size-caption)/var(--type-leading-caption) var(--ocr);color:var(--glass-muted)}\n.planningChoices{display:flex;flex-wrap:wrap;gap:.5rem;min-width:0;border:0;padding:0;margin:1.25rem 0}\n.planningChoices legend{font:400 var(--type-size-label)/var(--type-leading-label) var(--ocr);margin-bottom:.5rem}\n.planningChoices label{display:flex;align-items:center;gap:.5rem;min-height:44px;max-width:100%;padding:.5rem .75rem;border:1px solid var(--glass-border);border-radius:12px;font:400 var(--type-size-control)/var(--type-leading-control) var(--ocr);cursor:pointer;box-sizing:border-box}\n.planningChoices input{accent-color:var(--accent);flex-shrink:0;margin:0}\n.planningChoices label:has(input:checked){border-color:var(--accent);background:var(--glass-control-hover)}\n.planningChoices label:focus-within{outline:2px solid var(--paper);outline-offset:3px}\n.planningDescriptions{display:grid}\n.planningDescriptions p{grid-area:1/1;min-width:0;margin:0;max-width:60ch;font:400 var(--type-size-body)/var(--type-leading-body) var(--ocr);overflow-wrap:anywhere;visibility:hidden}\n.planningPlate{display:block;position:relative;line-height:0}\n.planningOverlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}\n.planningOverlay g{opacity:0}\n.planningOverlay rect{fill:none;stroke:#ad3e16;stroke-width:2;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 220ms ease-out}\n.planningOverlay [data-planning-stroke=halo]{stroke:white;stroke-width:5}\n.evidence:has(.planningChoices input[value=all]:checked) [data-planning-description=all]{visibility:visible}\n.evidence:has(.planningChoices input[value=\"0\"]:checked) [data-planning-region=\"0\"],.evidence:has(.planningChoices input[value=\"1\"]:checked) [data-planning-region=\"1\"],.evidence:has(.planningChoices input[value=\"2\"]:checked) [data-planning-region=\"2\"]{opacity:1}\n.evidence:has(.planningChoices input[value=\"0\"]:checked) [data-planning-region=\"0\"] rect,.evidence:has(.planningChoices input[value=\"1\"]:checked) [data-planning-region=\"1\"] rect,.evidence:has(.planningChoices input[value=\"2\"]:checked) [data-planning-region=\"2\"] rect{stroke-dashoffset:0}\n.evidence:has(.planningChoices input[value=\"0\"]:checked) [data-planning-description=\"0\"],.evidence:has(.planningChoices input[value=\"1\"]:checked) [data-planning-description=\"1\"],.evidence:has(.planningChoices input[value=\"2\"]:checked) [data-planning-description=\"2\"]{visibility:visible}\n:global([data-study-paused]) .planningOverlay rect{transition:none}\n@media(prefers-reduced-motion:reduce){.planningOverlay rect{transition:none}}\n@media(forced-colors:active){.planningGuide{background:Canvas;color:CanvasText;border-color:CanvasText}.planningNote{color:CanvasText}.planningChoices label{background:Canvas;color:CanvasText;border-color:CanvasText}.planningChoices label:has(input:checked){background:Canvas;color:CanvasText;border-color:Highlight}.planningChoices label:focus-within{outline-color:Highlight}.planningOverlay rect{stroke:CanvasText}.planningOverlay [data-planning-stroke=halo]{stroke:Canvas}}\n@media print{.planningChoices,.planningOverlay{display:none}.planningDescriptions{display:block}.planningDescriptions p{visibility:visible;margin:1em 0}}\n";
const oldCssHash="2d2bab984ea7c78fefa0909d900224c9f626539fe995573e8ed99aa12a25a432";
function originalMarkup(source){
 let normalized=source;
 for(const [before,after]of markupChanges){assert.equal(normalized.split(after).length,2,'Each exact approved guide block occurs once');normalized=normalized.replace(after,before);}
 assert.equal(hash(normalized),oldComponentHash,'All original source anchors/caption/actions/other-case markup remain byte-identical');
}
test('guide is additive to one existing image and preserves all original markup and CSS',()=>{
 originalMarkup(read('components/ProjectCaseStudy.jsx'));
 const css=read('components/ProjectCaseStudy.module.css');assert.equal(css.split(cssAddition).length,2);assert(css.endsWith(cssAddition));assert.equal(hash(css.slice(0,-cssAddition.length)),oldCssHash);
 assert.match(cssAddition,/220ms/);assert.match(cssAddition,/prefers-reduced-motion:reduce/);assert.match(cssAddition,/data-study-paused/);assert.match(cssAddition,/pointer-events:none/);
});
test('exact UI normalization rejects unapproved anchor, caption, handler and unrelated markup changes',()=>{
 const source=read('components/ProjectCaseStudy.jsx');
 for(const changed of [source+'\n',source.replace('href={image.src}','href="https://example.invalid/"'),source.replace('<p>{image.caption}</p>','<p>Missing source caption</p>'),source.replace('data-evidence-source-link','data-evidence-source-link onClick={openModal}')])assert.throws(()=>originalMarkup(changed));
});
