import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured from published d3eabb897e787287eefdb632d119718bffc35f61.
// Exact contextual reversals, never arbitrary attribute/CSS stripping or runtime git baselines.
const contracts={
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.jsx": {
    "sha256": "6edcd2c07d23c6230d1772c40ddf2ce65cf2ac16fbea1b6a4d81a63f7cf02086",
    "blocks": [
      [
        "import InformationSkin from './InformationSkin';\nimport EntranceDiagramFocus from './EntranceDiagramFocus';\nimport EditorialProjectStudy from './EditorialProjectStudy';\nimport {editorialProjectLayout} from './project-editorial-layout.mjs';\nimport {projectStudyEvidence} from './project-study-media.mjs';\nimport {projectStudyLayout,projectStudyEvidenceLayout} from './project-study-layout.mjs';\n",
        "import InformationSkin from './InformationSkin';\nimport EntranceDiagramFocus from './EntranceDiagramFocus';\nimport EditorialProjectStudy,{NativeStudyOpening,NativeStudyChapter} from './EditorialProjectStudy';\nimport {editorialProjectLayout,hybridProjectLayout} from './project-editorial-layout.mjs';\nimport {projectStudyEvidence} from './project-study-media.mjs';\nimport {projectStudyLayout,projectStudyEvidenceLayout} from './project-study-layout.mjs';\n"
      ],
      [
        " const editorial=editorialProjectLayout(project);\n if(editorial)return <EditorialProjectStudy project={project} layout={editorial}/>;\n const prefix=project.id,evidenceByChapter=projectStudyEvidence(project),chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits'}];\n return <>\n  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>\n  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>\n  <main id=\"portfolio-main\" tabIndex={-1} className={styles.page} data-project-study={project.id} data-information-motion-profile=\"velocity-skin\" data-portfolio-root data-portfolio-section=\"project-study\">\n   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}\n   <article aria-labelledby={`${prefix}-overview-heading`}>\n    <header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.chapter} ${styles.opening}`} data-project-chapter=\"overview\" {...layoutAttributes(projectStudyLayout(project,'overview'))}>\n     <div className={styles.chapterInner}>\n      <Panel opening>\n",
        " const editorial=editorialProjectLayout(project);\n if(editorial)return <EditorialProjectStudy project={project} layout={editorial}/>;\n const hybrid=hybridProjectLayout(project);\n const prefix=project.id,evidenceByChapter=projectStudyEvidence(project),chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits'}];\n return <>\n  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>\n  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>\n  <main id=\"portfolio-main\" tabIndex={-1} className={styles.page} data-project-study={project.id} data-study-presentation={hybrid?'hybrid-scenes':undefined} data-information-motion-profile=\"velocity-skin\" data-portfolio-root data-portfolio-section=\"project-study\">\n   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}\n   <article aria-labelledby={`${prefix}-overview-heading`}>\n    {hybrid?<NativeStudyOpening project={project}/>:<header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.chapter} ${styles.opening}`} data-project-chapter=\"overview\" {...layoutAttributes(projectStudyLayout(project,'overview'))}>\n     <div className={styles.chapterInner}>\n      <Panel opening>\n"
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
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.jsx": {
    "sha256": "7cb2c16657c4155c404f2edfbc37b63cfe5dd6e480bbf478d54432f08441d0de",
    "blocks": [
      [
        "import styles from './EditorialProjectStudy.module.css';\n\nfunction ReadingRail({children}){\n return <div className={styles.rail} data-information-window=\"editorial\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-narrative\"><InformationSkin/>{children}</div>;\n}\nfunction SourceAction({image,evidence=false}){\n return <a className={styles.sourceAction} data-evidence-source-link={evidence?'':undefined} href={image.src} target=\"_blank\" rel=\"noopener noreferrer\" aria-label={`Open full image (new tab): ${image.alt}`}>Open full image (new tab)</a>;\n}\nfunction SourceReference({image}){\n return <div className={styles.reference} data-editorial-source-reference={image.src}><p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image}/></div>;\n}\nfunction SourceFigure({image,evidence=false,eager=false}){\n const technical=image.purpose==='diagram';\n return <figure className={technical?styles.evidence:styles.scene} data-editorial-source={image.src} data-study-evidence-layout={evidence?'full':undefined} data-study-evidence-role={evidence?(technical?'technical-plate':'photograph'):undefined}>\n",
        "import styles from './EditorialProjectStudy.module.css';\n\nexport function ReadingRail({children}){\n return <div className={styles.rail} data-information-window=\"editorial\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-narrative\"><InformationSkin/>{children}</div>;\n}\nexport function SourceAction({image,evidence=false}){\n return <a className={styles.sourceAction} data-evidence-source-link={evidence?'':undefined} href={image.src} target=\"_blank\" rel=\"noopener noreferrer\" aria-label={`Open full image (new tab): ${image.alt}`}>Open full image (new tab)</a>;\n}\nexport function SourceReference({image}){\n return <div className={styles.reference} data-editorial-source-reference={image.src}><p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image}/></div>;\n}\nexport function SourceFigure({image,evidence=false,eager=false}){\n const technical=image.purpose==='diagram';\n return <figure className={technical?styles.evidence:styles.scene} data-editorial-source={image.src} data-study-evidence-layout={evidence?'full':undefined} data-study-evidence-role={evidence?(technical?'technical-plate':'photograph'):undefined}>\n"
      ],
      [
        "  <figcaption data-information-window=\"evidence-caption\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-caption\"><InformationSkin/><p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image} evidence={evidence}/></figcaption>\n </figure>;\n}\n/** Native chapter-owned sources: no fixed backdrop registration or additional clock. */\n",
        "  <figcaption data-information-window=\"evidence-caption\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-caption\"><InformationSkin/><p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image} evidence={evidence}/></figcaption>\n </figure>;\n}\n/** Native still-source roles for hybrid cases; model/video ownership stays with the caller. */\nexport function NativeStudyOpening({project}){\n const prefix=project.id;\n return <header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.nativeSurface} ${styles.nativeOpening}`} data-project-chapter=\"overview\" data-project-native-source=\"overview\" data-study-composition=\"native-still\">\n  <div className={styles.chapterHeading}><a className={styles.sourceAction} href=\"/projects/\">\u2190 All projects</a><StudyLabel opening>{project.yearLabel} / {project.category}</StudyLabel><h1 id={`${prefix}-overview-heading`} tabIndex={-1}>{project.title}</h1></div>\n  <div className={styles.nativeOpeningRow}>\n   <div className={styles.sourceColumn}><SourceFigure image={project.hero} eager/></div>\n   <ReadingRail>{project.subtitle&&<p>{project.subtitle}</p>}<p>{project.summary}</p><dl className={styles.metadata}><div><dt>Context</dt><dd>{project.context}</dd></div><div><dt>Role</dt><dd>{project.role}</dd></div></dl><a className={styles.sourceAction} href={`#${prefix}-${project.sections[0].id}`}>Follow the study <span aria-hidden=\"true\">\u2193</span></a></ReadingRail>\n  </div>\n </header>;\n}\nexport function NativeStudyChapter({project,section,index,scene,evidence=[]}){\n const prefix=project.id;\n return <section id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.nativeSurface} data-project-chapter={section.id} data-project-native-source={section.id} data-study-composition=\"native-still\" aria-labelledby={`${prefix}-${section.id}-heading`}>\n  <div className={styles.chapterHeading}><StudyLabel kind={section.kind}>{String(index+1).padStart(2,'0')} / {section.label}</StudyLabel><h2 id={`${prefix}-${section.id}-heading`} tabIndex={-1}>{section.title}</h2></div>\n  <div className={styles.nativeSceneRow}>\n   <div className={styles.sourceColumn}><SourceFigure image={scene}/></div>\n   <ReadingRail>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</ReadingRail>\n  </div>\n  {evidence.length>0&&<div className={styles.evidenceSequence}>{evidence.map(image=><SourceFigure key={image.src} image={image} evidence/>)}</div>}\n </section>;\n}\n/** Native chapter-owned sources: no fixed backdrop registration or additional clock. */\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.module.css": {
    "sha256": "cd924dedbd9e1496bd2d7bdabfc971edb39a36ead7355c2bba1b10c5b3a74989",
    "blocks": [
      [
        "\n.sourceColumn{min-width:0;width:100%}\n",
        "\n.sourceColumn{min-width:0;width:100%}\n\n/* Opt-in hybrid still chapters: no fixed backdrop or additional information owner. */\n.nativeSurface{position:relative;z-index:2;max-width:1600px;margin:auto;padding:3rem clamp(1.5rem,6vw,7rem) 5rem;color:var(--paper);scroll-margin-top:8rem}\n.nativeSurface h1{font-size:var(--type-size-title);line-height:var(--type-leading-display);letter-spacing:var(--type-tracking-display)}\n.nativeSurface h2{font-size:var(--type-size-heading);line-height:var(--type-leading-heading);letter-spacing:var(--type-tracking-display)}\n.nativeSurface h1,.nativeSurface h2{margin:.8rem 0 1rem;text-wrap:balance}\n.nativeSurface .rail>p{font-size:var(--type-size-body);line-height:var(--type-leading-body);letter-spacing:var(--type-tracking-body);max-width:var(--type-measure-body);margin:0 0 var(--type-space-paragraph)}\n.nativeOpening{padding-top:8rem}\n.nativeOpeningRow{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,4vw,4rem);align-items:start}\n.nativeOpeningRow .metadata{grid-template-columns:1fr;gap:1rem}\n.nativeSceneRow{display:grid;gap:2rem;align-items:start}\n.nativeSceneRow>.rail{width:min(100%,60ch);justify-self:end}\n.nativeSurface a:focus-visible{outline:2px solid currentColor;outline-offset:5px}\n@media(max-width:799px){.nativeSurface{padding-top:2rem;padding-bottom:3rem}.nativeOpening{padding-top:7.5rem}.nativeOpeningRow{grid-template-columns:minmax(0,1fr);gap:1.5rem}.nativeSceneRow{gap:1.5rem}}\n@media(max-width:360px){.nativeSurface{padding-left:1.25rem;padding-right:1.25rem}}\n@media(forced-colors:active){.nativeSurface{color:CanvasText}}\n@media print{.nativeSurface{color:#111;padding:1rem 0}.nativeOpeningRow,.nativeSceneRow{display:block}.nativeSurface .rail{width:100%}}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs": {
    "sha256": "a5a50acb441b1bad14b1dd0d08226855b5f258936ef98721516b0a1d415b2955",
    "blocks": [
      [
        " });\n}\n",
        " });\n}\n\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id !== 'special-assemblies') return null;\n const results = project.sections.find(section => section.id === 'results');\n const names = ['front-prototype.webp', 'assembly-detail.webp'];\n if (!project.model || project.model.chapters.join(',') !== 'context,system' ||\n     project.motionMedia?.length !== 1 || project.motionMedia[0].chapter !== 'making' ||\n     project.motionMedia[0].loop !== false || project.motionMedia[0].kind !== 'simulation' ||\n     !project.hero.src.endsWith('/special-assemblies/hero.webp') ||\n     results?.media.length !== 2 || results.media.some((image,index) => !image.src.endsWith(`/special-assemblies/${names[index]}`))) {\n  throw new Error('Hybrid scenes require the reviewed Special Assemblies source roles.');\n }\n return {nativeChapters:['overview','results','credits'],results:{section:results,scene:results.media[0],evidence:[results.media[1]]}};\n}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/runtime/background/SiteBackgroundDriver.mjs": {
    "sha256": "ae3fb1606d65fa9236ef6a01b18572ce1aadb63f11967d13f5b19f14f146ee77",
    "blocks": [
      [
        "  const studyRoot=doc.querySelector?.('[data-project-study]')??null;\n  const editorialStudy=studyRoot?.getAttribute('data-study-presentation')==='editorial-scenes';\n  const nativeImages=[];\n  // Ordinary editorial routes share this existing clock. XR and Bending keep\n",
        "  const studyRoot=doc.querySelector?.('[data-project-study]')??null;\n  const editorialStudy=studyRoot?.getAttribute('data-study-presentation')==='editorial-scenes';\n  const hybridStudy=studyRoot?.getAttribute('data-study-presentation')==='hybrid-scenes';\n  const nativeImages=[];\n  // Ordinary editorial routes share this existing clock. XR and Bending keep\n"
      ],
      [
        "  // never acquire a second fixed copy or the background transition transport.\n  // Native loading/error facts need no animation clock or eager decode request.\n  if(editorialStudy)for(const image of studyRoot.querySelectorAll('[data-editorial-image]')){\n    const figure=image.closest('[data-editorial-source]');\n    if(!figure)continue;\n",
        "  // never acquire a second fixed copy or the background transition transport.\n  // Native loading/error facts need no animation clock or eager decode request.\n  if(editorialStudy||hybridStudy)for(const image of studyRoot.querySelectorAll('[data-editorial-image]')){\n    const figure=image.closest('[data-editorial-source]');\n    if(!figure)continue;\n"
      ],
      [
        "  function dispose(){if(disposed)return;disposed=true;releaseHomeResearch();homeResearch?.dispose();releaseStage();projectBackdrop?.dispose();projectScene?.dispose();projectScene=null;projectChapters?.dispose();scheduler.dispose();home?.dispose();liquid?.dispose();scope.dispose();events.dispose();binding.dispose();}\n  return {\n    inspect:()=>({owner:'site',frames,playback:sampleChapterPlayback(playback),chapterScene:latest,size:{...size},lifecycle:scheduler.inspect(),events:events.inspect(),pageField:binding.inspect(),homeScrolling:home?.inspect()??null,homeResearch:homeResearch?.inspect()??null,projectStudy:studyRoot?{paused:studyPaused(),chapters:projectChapters?.inspect()??null,liquidGlass:liquid?.inspect(),scene:projectScene?.inspect()??null,backdrop:projectBackdrop?.inspect()??null,media:projectBackdrop?.inspect().media??[],...(editorialStudy?{presentation:'editorial-scenes',nativeImages:nativeImages.map(row=>({...row}))}:{})}:null,domPublication:publisher.inspect(),disposed}),\n    dispose,\n  };\n",
        "  function dispose(){if(disposed)return;disposed=true;releaseHomeResearch();homeResearch?.dispose();releaseStage();projectBackdrop?.dispose();projectScene?.dispose();projectScene=null;projectChapters?.dispose();scheduler.dispose();home?.dispose();liquid?.dispose();scope.dispose();events.dispose();binding.dispose();}\n  return {\n    inspect:()=>({owner:'site',frames,playback:sampleChapterPlayback(playback),chapterScene:latest,size:{...size},lifecycle:scheduler.inspect(),events:events.inspect(),pageField:binding.inspect(),homeScrolling:home?.inspect()??null,homeResearch:homeResearch?.inspect()??null,projectStudy:studyRoot?{paused:studyPaused(),chapters:projectChapters?.inspect()??null,liquidGlass:liquid?.inspect(),scene:projectScene?.inspect()??null,backdrop:projectBackdrop?.inspect()??null,media:projectBackdrop?.inspect().media??[],...(editorialStudy||hybridStudy?{presentation:editorialStudy?'editorial-scenes':'hybrid-scenes',nativeImages:nativeImages.map(row=>({...row}))}:{})}:null,domPublication:publisher.inspect(),disposed}),\n    dispose,\n  };\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropMotion.mjs": {
    "sha256": "cb5c8bc8f50cf29cbd7a3070613eebd0154e08a4a37108361f999889a519c244",
    "blocks": [
      [
        " state.request.failure=reason;state.request.terminal='failed';fact(state,'failed',reason);state.transition=null;state.settled=true;\n}\nexport function advanceProjectStudyBackdropMotion(state,dt,{key,chapter,direction=1,ready=false,failure='',snap=false,resumed=false}={}){\n if(!key||!chapter||!Number.isFinite(dt)||dt<0)throw RangeError('An actual source identity, chapter and finite active seconds are required');\n if(state.request?.key!==key){\n  if(state.request&&!state.request.terminal){state.request.terminal='cancelled';fact(state,'cancelled','superseded');}\n  state.request={id:++state.sequence,key,chapter,direction:Math.sign(direction)||1,terminal:null,failure:''};fact(state,'requested');\n }\n const request=state.request;\n",
        " state.request.failure=reason;state.request.terminal='failed';fact(state,'failed',reason);state.transition=null;state.settled=true;\n}\nexport function advanceProjectStudyBackdropMotion(state,dt,{key,chapter,direction=1,ready=false,failure='',absent=false,snap=false,resumed=false}={}){\n if(!key||!chapter||!Number.isFinite(dt)||dt<0)throw RangeError('An actual source identity, chapter and finite active seconds are required');\n if(state.request?.key!==key){\n  if(state.request&&!state.request.terminal){state.request.terminal='cancelled';fact(state,'cancelled','superseded');}\n  state.request={id:++state.sequence,key,chapter,direction:Math.sign(direction)||1,terminal:null,failure:'',...(absent?{absent:true}:{})};fact(state,'requested');\n }\n const request=state.request;\n"
      ],
      [
        "   state.key=request.key;state.chapter=request.chapter;state.pose=outside(-request.direction);state.transition=null;\n  }\n  if(!ready){state.mode='waiting';state.transition=null;state.settled=false;return;}\n  if(snap){state.pose=held();state.transition=null;state.mode='hold';state.settled=true;finish(state,'static');}\n",
        "   state.key=request.key;state.chapter=request.chapter;state.pose=outside(-request.direction);state.transition=null;\n  }\n  // A native chapter owns its real document source, not a backdrop resource.\n  // Complete the previous exit, then settle absent without decode or entry.\n  if(request.absent){state.pose=outside(request.direction);state.mode='absent';state.transition=null;state.settled=true;finish(state,'native-source');return;}\n  if(!ready){state.mode='waiting';state.transition=null;state.settled=false;return;}\n  if(snap){state.pose=held();state.transition=null;state.mode='hold';state.settled=true;finish(state,'static');}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropPresenter.mjs": {
    "sha256": "565da2e75e20418e235041f5137c7840ea754c9276e5498ca5d0425c06857845",
    "blocks": [
      [
        " const chapters=[...root.querySelectorAll('[data-project-chapter]')].map(node=>node.dataset.projectChapter);\n const figures=[...root.querySelectorAll('[data-project-media]')],records=[],descriptors=new Map();\n const listen=(node,type,handler,options)=>events.listen(scope,node,type,handler,options);\n const clock=()=>win.performance?.now?.()??Date.now();\n",
        " const chapters=[...root.querySelectorAll('[data-project-chapter]')].map(node=>node.dataset.projectChapter);\n const figures=[...root.querySelectorAll('[data-project-media]')],records=[],descriptors=new Map();\n const nativeChapters=new Set([...root.querySelectorAll('[data-project-native-source]')].map(node=>node.dataset.projectNativeSource||node.dataset.projectChapter||node.closest?.('[data-project-chapter]')?.dataset.projectChapter).filter(chapter=>chapters.includes(chapter)));\n const listen=(node,type,handler,options)=>events.listen(scope,node,type,handler,options);\n const clock=()=>win.performance?.now?.()??Date.now();\n"
      ],
      [
        " }\n const wanted=(chapter,p)=>{\n  const modelState=scene?.actor.inspect(),modelUnavailable=modelState?.arrivalStatic&&modelState.posterFailed;\n   const modelKey=scene?`model:${scene.model.sha256}`:null;\n",
        " }\n const wanted=(chapter,p)=>{\n  // Native document sources explicitly release the background owner. They are\n  // not missing media, a last-record fallback, or a synthetic decoded image.\n  if(nativeChapters.has(chapter)){\n   const key=`native:${chapter}`;\n   if(!descriptors.has(key))descriptors.set(key,{key,chapter,kind:'native'});\n   return descriptors.get(key);\n  }\n  const modelState=scene?.actor.inspect(),modelUnavailable=modelState?.arrivalStatic&&modelState.posterFailed;\n   const modelKey=scene?`model:${scene.model.sha256}`:null;\n"
      ],
      [
        "   // A target may acquire/paint only after the previously displayed subject is\n   // completely outside. Its native reading chapter is already immediate.\n   let result=motion.key===target.key?readyTarget(target,p):{ready:false,failure:''};\n   advanceProjectStudyBackdropMotion(motion,dt,{key:target.key,chapter:target.chapter,direction,...result,snap,resumed});\n   if(motion.key===target.key&&motion.mode==='waiting'){\n    result=readyTarget(target,p);advanceProjectStudyBackdropMotion(motion,0,{key:target.key,chapter:target.chapter,direction,...result,snap,resumed});\n   }\n   if(motion.mode==='hold'){initial=false;seekPending=false;}\n   render();\n   const actorMoving=scene?.actor.publish({dt,resumed,stage:snapshot()})??false;\n",
        "   // A target may acquire/paint only after the previously displayed subject is\n   // completely outside. Its native reading chapter is already immediate.\n   let result=target.kind==='native'?{}:motion.key===target.key?readyTarget(target,p):{ready:false,failure:''};\n   advanceProjectStudyBackdropMotion(motion,dt,{key:target.key,chapter:target.chapter,direction,...result,absent:target.kind==='native',snap,resumed});\n   if(motion.key===target.key&&motion.mode==='waiting'){\n    result=readyTarget(target,p);advanceProjectStudyBackdropMotion(motion,0,{key:target.key,chapter:target.chapter,direction,...result,absent:target.kind==='native',snap,resumed});\n   }\n   if(motion.mode==='hold'||motion.mode==='absent'&&motion.settled){initial=false;seekPending=false;}\n   render();\n   const actorMoving=scene?.actor.publish({dt,resumed,stage:snapshot()})??false;\n"
      ]
    ]
  }
};
const pins={
  "roles/uiux-designer/cases/bending-active-thesis/release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-assets.json": "33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "roles/uiux-designer/cases/bending-active-thesis/release/contact.json": "c68b4bc45a3ecc13eeee55bae43f3cab75f2085a095a5084e1494f90c5695882",
  "roles/uiux-designer/cases/bending-active-thesis/release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "roles/uiux-designer/cases/bending-active-thesis/release/story.json": "250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json": "41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211",
  "roles/uiux-designer/cases/bending-active-thesis/release/dot-web-delivery.json": "f43d76d380dc5d1fbb55d67f6c02c2f4b142535e011662feeb176f931535ad0e",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudyStage.jsx": "697625588e79e3f96913c661d8578ac5b830476a7f4ac7c33363f779fb2f1f5f",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.module.css": "2d2bab984ea7c78fefa0909d900224c9f626539fe995573e8ed99aa12a25a432",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-scene.mjs": "f04ca2d77f48a2bc3c366fee0d4a4a0959ce718db7b4f4263a050823193b659e",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs": "1eeb0aaf68cb6bdd6f844b3025405005fd5891ed4bff87edff836bf3e5567682",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f",
  "roles/uiux-designer/cases/bending-active-thesis/components/XRProject.jsx": "25a0b301ebca2ca280643cbe13f8303ffee8e72022c53684340529f09864f075",
  "roles/uiux-designer/cases/bending-active-thesis/components/BendingProject.jsx": "585b055ff08bb0c8451d1780b6cf1268088b2ec46ded4661a2da46bca7b97970",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyScenePresenter.mjs": "91746860fb4157d5377f7c929605051ec3b2ff100c177483dc51bcccb8b85873",
  "scripts/build-pages.mjs": "2229a5e88a8150375318403433dd6069c606e7cc38149ab120f8e97466664bb7"
};

function original(path,source){
 for(const [before,after]of contracts[path].blocks){assert.equal(source.split(after).length,2,'Unique reviewed context');source=source.replace(after,before);}
 assert.equal(hash(source),contracts[path].sha256,path);return source;
}
test('hybrid additions reverse exactly to published d3 across dispatch, shared markup, scoped CSS and native-absence runtime',async()=>{
 for(const path of Object.keys(contracts))original(path,await read(path));
});
test('hybrid baseline proof rejects missing/duplicated blocks and any unreviewed bytes',async()=>{
 for(const path of Object.keys(contracts)){
  const source=await read(path),block=contracts[path].blocks[0][1];
  for(const mutation of [source+'\n',source.replace(block,''),source.replace(block,block+block)])assert.throws(()=>original(path,mutation));
 }
 const path=casePath+'components/EditorialProjectStudy.jsx',source=await read(path);
 assert.throws(()=>original(path,source.replace('href={image.src}','href="/substitute"')));
 assert.throws(()=>original(path,source.replace('evidence={evidence}','evidence={false}')));
});
test('hybrid preserves every release record and asset, default cameras/materials, source controls and empty-framework build surface',async()=>{
 for(const [path,pin]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),pin,path);
 const manifest=JSON.parse(await read(casePath+'release/manifest.json'));assert.equal(manifest.assets.length,137);
 for(const asset of manifest.assets){const bytes=await readFile(new URL(casePath+'release/public/'+asset.path,root));assert.equal(bytes.length,asset.bytes,asset.path);assert.equal(hash(bytes),asset.sha256,asset.path);}
});
test('only Special explicit original Overview/Results/Credits become native while model and nonloop simulation roles remain intact',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),before=JSON.stringify(data);
 for(const project of data.projects){
  const layout=hybridProjectLayout(project);
  if(project.id!=='special-assemblies'){assert.equal(layout,null);assert.equal(!!editorialProjectLayout(project),project.id==='project-caschlatsch');continue;}
  assert.deepEqual(layout.nativeChapters,['overview','results','credits']);
  const section=project.sections.find(s=>s.id==='results');assert.equal(layout.results.section,section);assert.equal(layout.results.scene,section.media[0]);assert.equal(layout.results.evidence[0],section.media[1]);assert.equal(layout.results.evidence.length,1);
  assert.deepEqual(section.media.map(i=>i.src),['/assets/projects/special-assemblies/front-prototype.webp','/assets/projects/special-assemblies/assembly-detail.webp']);
  assert.equal(project.hero.src,'/assets/projects/special-assemblies/hero.webp');assert.equal(project.model.sha256,'43de5ca2dd8095a125d7f29e58851b5a80dc9588625912918d75dbadae8e28df');assert.equal(project.model.meshes,60);assert.deepEqual(project.model.chapters,['context','system']);
  assert.equal(project.motionMedia.length,1);assert.equal(project.motionMedia[0].src,'/assets/projects/special-assemblies/robot-assembly-motion.mp4');assert.equal(project.motionMedia[0].durationSeconds,7.56);assert.equal(project.motionMedia[0].kind,'simulation');assert.equal(project.motionMedia[0].loop,false);
  for(const bad of [{...project,model:null},{...project,model:{...project.model,chapters:['results']}},{...project,motionMedia:[]},{...project,motionMedia:[{...project.motionMedia[0],loop:true}]},{...project,motionMedia:[{...project.motionMedia[0],kind:'recording'}]},{...project,hero:{...project.hero,src:'/wrong.webp'}},{...project,sections:project.sections.map(s=>s===section?{...s,media:[...s.media].reverse()}:s)}])assert.throws(()=>hybridProjectLayout(bad));
 }
 assert.equal(JSON.stringify(data),before,'Role mapping never mutates source objects');
});
test('shared native figures keep secure original links, credit-only span styling and separate retained runtime ownership',async()=>{
 const jsx=await read(casePath+'components/EditorialProjectStudy.jsx'),css=await read(casePath+'components/EditorialProjectStudy.module.css'),driver=await read(casePath+'runtime/background/SiteBackgroundDriver.mjs'),presenter=await read(casePath+'runtime/site/ProjectStudyBackdropPresenter.mjs');
 assert(jsx.includes('export function SourceFigure('));assert(jsx.includes('export function NativeStudyOpening('));assert(jsx.includes('export function NativeStudyChapter('));assert(jsx.includes('<p>{image.caption}</p><span>{image.credit}</span><SourceAction image={image} evidence={evidence}/>'));
 assert(jsx.includes('rel="noopener noreferrer"'));assert(jsx.includes('href={image.src}'));assert(!/onClick=|requestAnimationFrame|setInterval|setTimeout/.test(jsx));
 assert(css.includes('figcaption>span:not(:global([data-information-skin]))'));assert(css.includes('height:auto;object-fit:contain'));assert(css.includes('min-height:44px'));
 assert(driver.includes('if(studyRoot&&!editorialStudy)projectBackdrop='));assert(driver.includes('if(studyRoot&&!editorialStudy)releaseStage='));assert(driver.includes('if(editorialStudy||hybridStudy)for(const image'));
 assert(presenter.includes("if(nativeChapters.has(chapter))"));assert(presenter.includes("kind:'native'"));assert(presenter.includes("absent:target.kind==='native'"));
 // Source contracts do not claim native browser pixels, actual media completion or accessibility acceptance.
});
