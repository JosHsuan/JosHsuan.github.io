import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Independent deployed 2477 baseline. Reverse only these reviewed complete
// context blocks; never strip arbitrary markup, attributes or CSS declarations.
const root=new URL('../../',import.meta.url);
const read=path=>readFile(new URL(path,root));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// Editorial allowlist is independently reversed by editorial-scenes.test.mjs.
const contracts={
  "roles/uiux-designer/cases/bending-active-thesis/components/EntryLoader.jsx": {
    "baselineSha256": "e20d6b44bd6f4df4741e487a7ec010ccf3024e5b40b2c385ee97aba034cf3124",
    "replacements": [
      [
        "import {useExperienceInput} from '../runtime/ExperienceProvider';\nimport styles from './entry-loader.module.css';\nimport {acquireSiteReadiness} from '../runtime/site/SiteReadiness.mjs';\nimport {publishSceneEntry} from '../runtime/site/site-entry-bridge.mjs';\n",
        "import {useExperienceInput} from '../runtime/ExperienceProvider';\nimport styles from './entry-loader.module.css';\nimport ResearchEntryComposition from './ResearchEntryComposition';\nimport {acquireSiteReadiness} from '../runtime/site/SiteReadiness.mjs';\nimport {publishSceneEntry} from '../runtime/site/site-entry-bridge.mjs';\n"
      ],
      [
        " const ready=status.progress===100;\n return <><div ref={element} className={styles.loader} data-entry-loader data-phase=\"preparing\" aria-label=\"Preparing Bending-Active\">\n  <div className={styles.backdrop} aria-hidden=\"true\"><picture>\n   <source media=\"(max-width:780px)\" srcSet=\"/assets/cinematic/model-poster-mobile.webp\"/>\n   <img src=\"/assets/cinematic/model-poster.webp\" alt=\"\" decoding=\"async\"/>\n  </picture></div>\n  <div className={styles.content}>\n   <section className={styles.panel} aria-labelledby=\"entry-title\" aria-describedby=\"entry-description\">\n    <p className={styles.eyebrow}>Thesis study</p>\n",
        " const ready=status.progress===100;\n return <><div ref={element} className={styles.loader} data-entry-loader data-phase=\"preparing\" aria-label=\"Preparing Bending-Active\">\n  <ResearchEntryComposition>\n  <div className={styles.content} data-research-entry-content>\n   <section className={styles.panel} aria-labelledby=\"entry-title\" aria-describedby=\"entry-description\">\n    <p className={styles.eyebrow}>Thesis study</p>\n"
      ],
      [
        "   <p className={styles.identity}>JosHsuan Chao <a href={returnHref} data-entry-return>Back to projects</a></p>\n  </div>\n </div><noscript><style>{'[data-entry-loader]{display:none!important}'}</style></noscript></>;\n}\n",
        "   <p className={styles.identity}>JosHsuan Chao <a href={returnHref} data-entry-return>Back to projects</a></p>\n  </div>\n </ResearchEntryComposition></div><noscript><style>{'[data-entry-loader]{display:none!important}'}</style></noscript></>;\n}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/SiteExperience.jsx": {
    "baselineSha256": "e1be3be73fc9396a3b3c43b033f85aba206113da79fe20f91683300c9f1edd0c",
    "replacements": [
      [
        "'use client';\n/* eslint-disable @next/next/no-img-element -- The original pinned poster carries visual identity across native documents, never scene readiness. */\nimport {useEffect,useRef,useState} from 'react';\nimport {createSiteNavigation} from '../runtime/site/SiteNavigation.mjs';\nimport entry from './entry-loader.module.css';\nimport styles from './site-experience.module.css';\n\n/** Mounted once by the published layout. Generic pages import no case runtime. */\n",
        "'use client';\nimport {useEffect,useRef,useState} from 'react';\nimport {createSiteNavigation} from '../runtime/site/SiteNavigation.mjs';\nimport entry from './entry-loader.module.css';\nimport styles from './site-experience.module.css';\nimport ResearchEntryComposition from './ResearchEntryComposition';\n\n/** Mounted once by the published layout. Generic pages import no case runtime. */\n"
      ],
      [
        " },[]);\n const ready=status.phase==='ready'||status.phase==='revealing'||status.phase==='entered';\n return <><div ref={element} className={`${entry.loader} ${styles.loader}`} data-site-loader data-site-phase=\"requested\" aria-label=\"Preparing this page\">\n  <div className={`${entry.backdrop} ${styles.backdrop}`} aria-hidden=\"true\">{status.presentation==='bending-active'&&<img className={styles.researchHandoff} src=\"/assets/cinematic/model-poster.webp\" width=\"1440\" height=\"1000\" alt=\"\" decoding=\"async\" data-site-research-handoff/>}</div>\n  <div className={entry.content} data-site-loader-content>\n   <section className={entry.panel} aria-labelledby=\"site-entry-title\" aria-describedby=\"site-entry-description\">\n    <p className={entry.eyebrow}>Portfolio</p>\n",
        " },[]);\n const ready=status.phase==='ready'||status.phase==='revealing'||status.phase==='entered';\n const content=<div className={entry.content} data-site-loader-content data-research-entry-content>\n   <section className={entry.panel} aria-labelledby=\"site-entry-title\" aria-describedby=\"site-entry-description\">\n    <p className={entry.eyebrow}>Portfolio</p>\n"
      ],
      [
        "   </section>\n   <p className={entry.identity}><a href=\"/\">Return to home</a></p>\n  </div>\n </div><p className={styles.status} role=\"status\" aria-live=\"polite\">{status.phase==='failed'?'This page is available. Some preparation steps could not finish.':''}</p><noscript><style>{'[data-site-loader]{display:none!important}'}</style></noscript></>;\n}\n",
        "   </section>\n   <p className={entry.identity}><a href=\"/\">Return to home</a></p>\n  </div>;\n return <><div ref={element} className={`${entry.loader} ${styles.loader}`} data-site-loader data-site-phase=\"requested\" aria-label=\"Preparing this page\">\n  {status.presentation==='bending-active'?<ResearchEntryComposition outgoing>{content}</ResearchEntryComposition>:<><div className={`${entry.backdrop} ${styles.backdrop}`} aria-hidden=\"true\"/>{content}</>}\n </div><p className={styles.status} role=\"status\" aria-live=\"polite\">{status.phase==='failed'?'This page is available. Some preparation steps could not finish.':''}</p><noscript><style>{'[data-site-loader]{display:none!important}'}</style></noscript></>;\n}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/entry-loader.module.css": {
    "baselineSha256": "9a92f2e00675a8192e9dcb0e330d2d404d1b0662b8278bbd0dbe5e582a73c877",
    "replacements": [
      [
        ".subtitle,.preparation p{line-height:var(--type-leading-body);letter-spacing:var(--type-tracking-body)}\n.identity{line-height:var(--type-leading-caption);letter-spacing:var(--type-tracking-caption)}\n/* An adopted Home research link keeps the same original specimen composition.\n   The case still owns every preparation and reveal decision. */\n:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .backdrop picture{position:absolute;width:68%;height:85%;right:0;top:8%}\n:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .backdrop img{object-fit:contain;object-position:right center;opacity:.9}\n:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .content{justify-items:start;place-content:center start;padding-left:6vw}\n@media(max-width:900px){:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .backdrop picture{width:100%;height:65%;top:30%}:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .backdrop img{opacity:.55}:global(html[data-site-project-entry=bending-active]) .loader[data-entry-loader] .content{place-content:start center;justify-items:center;padding:12svh 1.5rem 2rem}}\n",
        ".subtitle,.preparation p{line-height:var(--type-leading-body);letter-spacing:var(--type-tracking-body)}\n.identity{line-height:var(--type-leading-caption);letter-spacing:var(--type-tracking-caption)}\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/site-experience.module.css": {
    "baselineSha256": "d827a138d4e7887a4b4fa2d0c1c8126b9c722137c58c9b59d0885b9bef62f20b",
    "replacements": [
      [
        "   fallback; both paths use the same bounded reveal and never run together. */\n.loader[data-site-phase=revealing]:not([data-site-reveal=native]){animation:site-reveal .72s cubic-bezier(.45,0,.15,1) both}\n.loader[data-site-phase=revealing]:not([data-site-reveal=native])>[data-site-loader-content]{animation:site-lift .72s cubic-bezier(.45,0,.15,1) both}\n/* JS-disabled pages use noscript; this is a separate hydration-failure escape. */\n.loader:not([data-site-connected]){animation:site-fail-open 30s step-end forwards}\n",
        "   fallback; both paths use the same bounded reveal and never run together. */\n.loader[data-site-phase=revealing]:not([data-site-reveal=native]){animation:site-reveal .72s cubic-bezier(.45,0,.15,1) both}\n.loader[data-site-phase=revealing]:not([data-site-reveal=native]) [data-site-loader-content]{animation:site-lift .72s cubic-bezier(.45,0,.15,1) both}\n/* JS-disabled pages use noscript; this is a separate hydration-failure escape. */\n.loader:not([data-site-connected]){animation:site-fail-open 30s step-end forwards}\n"
      ],
      [
        "@keyframes site-lift{from{transform:translateY(0)}to{transform:translateY(-12px)}}\n@keyframes site-fail-open{to{visibility:hidden;pointer-events:none}}\n@media(prefers-reduced-motion:reduce){.loader [data-site-activity],.loader[data-site-phase=revealing],.loader[data-site-phase=revealing]>[data-site-loader-content]{animation:none;transform:none}}\n@media(forced-colors:active){.backdrop{background:Canvas}}\n@media print{.loader{display:none}}\n/* Same original specimen, separate document/readiness owner. This finite\n   recession does not delay or replace native link navigation. */\n.researchHandoff{display:none!important}\n.loader[data-site-project-entry=bending-active] .researchHandoff{display:block!important;object-fit:contain;object-position:right center;opacity:.9;width:68%;height:85%;position:absolute;right:0;top:8%;transform:scale(.96)}\n.loader[data-site-project-entry=bending-active] [data-site-loader-content]{justify-items:start;place-content:center start;padding-left:6vw}\n@media(max-width:900px){.loader[data-site-project-entry=bending-active] .researchHandoff{width:100%;height:65%;top:30%;opacity:.55}.loader[data-site-project-entry=bending-active] [data-site-loader-content]{place-content:start center;justify-items:center;padding:12svh 1.5rem 2rem}}\n@media(prefers-reduced-motion:reduce){.loader[data-site-project-entry=bending-active] .researchHandoff{transform:none}}\n@media(forced-colors:active){.loader[data-site-project-entry=bending-active] .researchHandoff{display:none!important}}\n",
        "@keyframes site-lift{from{transform:translateY(0)}to{transform:translateY(-12px)}}\n@keyframes site-fail-open{to{visibility:hidden;pointer-events:none}}\n@media(prefers-reduced-motion:reduce){.loader [data-site-activity],.loader[data-site-phase=revealing],.loader[data-site-phase=revealing] [data-site-loader-content]{animation:none;transform:none}}\n@media(forced-colors:active){.backdrop{background:Canvas}}\n@media print{.loader{display:none}}\n"
      ]
    ]
  },
  "scripts/build-pages.mjs": {
    "baselineSha256": "3e50c10dbab389f2f0bbadc85693b53c82699858d7ed76395dd26064339e5200",
    "replacements": [
      [
        "  'components/LiquidGlassSkin.jsx',\n  'components/EntryLoader.jsx', 'components/entry-loader.module.css',\n  'components/EvidenceInspector.jsx', 'components/evidence-inspector.module.css',\n  'components/cinematic.module.css', 'components/story-input.js', 'components/story-response.mjs',\n",
        "  'components/LiquidGlassSkin.jsx',\n  'components/EntryLoader.jsx', 'components/entry-loader.module.css',\n  'components/ResearchEntryComposition.jsx', 'components/research-entry-composition.module.css',\n  'components/EvidenceInspector.jsx', 'components/evidence-inspector.module.css',\n  'components/cinematic.module.css', 'components/story-input.js', 'components/story-response.mjs',\n"
      ]
    ]
  }
};
const pins={
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/SiteNavigation.mjs": "62387e47168b0f35e4319e37acfbbad9470de72dcf712a07a94d18d48ecaec90",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/features/EntryManager.mjs": "a3a4487237a69cff607702ca6617c342fc374049efdd505229b9b83fe71dea26",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/motion/entry-motion.mjs": "fed0d7fb055f52a88cd0961c54cafec27f83bf2882c29a221c01628a9dcb4adf",
  "roles/uiux-designer/cases/bending-active-thesis/components/PortfolioHome.jsx": "ce2526fad8571a505319a5edc1ff37ce3f76b5f4f3ed999ff8e12a58ea3ebcab",
  "roles/uiux-designer/cases/bending-active-thesis/components/HomeResearchStage.jsx": "423124540cd675682d5a82def89906dfb7d959b8d2b79057fcc2925ae3721907",
  "roles/uiux-designer/cases/bending-active-thesis/release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "roles/uiux-designer/cases/bending-active-thesis/release/public/assets/cinematic/model-poster.webp": "931181ca2b0722d27f41bddbf60121c5d058d4297bd809aee9eb2fec68d377e7",
  "roles/uiux-designer/cases/bending-active-thesis/release/public/assets/cinematic/model-poster-mobile.webp": "b133e25443df7926f8b5b4fcf354765f371c3417e0662a0635b917f4546e8d24"
};
function original(path,source){
 const contract=contracts[path];
 for(const [before,after] of contract.replacements){assert.ok(after.length>0);assert.equal(source.split(after).length,2,`${path}: unique exact approved block`);source=source.replace(after,before);}
 assert.equal(hash(source),contract.baselineSha256,`${path}: unchanged baseline outside approved composition blocks`);return source;
}
const componentPath='roles/uiux-designer/cases/bending-active-thesis/components/ResearchEntryComposition.jsx';
const cssPath='roles/uiux-designer/cases/bending-active-thesis/components/research-entry-composition.module.css';
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
test('shared research composition changes only exact approved loader/layout and build-copy blocks',async()=>{
 for(const path of Object.keys(contracts))original(path,(await read(path)).toString());
});
test('entry source bytes, original state machines, Home markup and release records remain pinned',async()=>{
 for(const [path,digest]of Object.entries(pins))assert.equal(hash(await read(path)),digest,path);
});
test('one pure original responsive picture serves unhinted Bending SSR and conditional outgoing composition',async()=>{
 composition((await read(componentPath)).toString(),(await read(cssPath)).toString());
 const entry=(await read('roles/uiux-designer/cases/bending-active-thesis/components/EntryLoader.jsx')).toString();
 const site=(await read('roles/uiux-designer/cases/bending-active-thesis/components/SiteExperience.jsx')).toString();
 assert.equal(entry.split('<ResearchEntryComposition>').length,2);assert.ok(site.includes("status.presentation==='bending-active'?<ResearchEntryComposition outgoing>{content}</ResearchEntryComposition>"));
 assert.equal(site.split('data-site-loader-content').length,2);
 // Source-level geometry/ownership contracts are not a browser fit or paint claim.
});
test('contract rejects unrelated readiness/text/source changes and cropped or hint-switched shared composition',async()=>{
 for(const path of Object.keys(contracts)){const source=(await read(path)).toString();assert.throws(()=>original(path,source+'\n/* unrelated */'));for(const [,after]of contracts[path].replacements)assert.throws(()=>original(path,source.replace(after,after+' ')));}
 const component=(await read(componentPath)).toString(),css=(await read(cssPath)).toString();
 assert.throws(()=>composition(component.replace('model-poster-mobile.webp','other.webp'),css));assert.throws(()=>composition(component,css.replace('object-fit:contain','object-fit:cover')));assert.throws(()=>composition(component,css+'\nhtml[data-site-project-entry]{transform:scale(.96)}'));assert.throws(()=>composition(component.replace('{children}','{children}<canvas/>'),css));
});
