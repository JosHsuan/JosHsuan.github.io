import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {withShareMetadata} from '../../roles/uiux-designer/cases/bending-active-thesis/app/share-metadata.mjs';
import {assertProjectImage} from '../../scripts/project-studies.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independent exact 9394233 baseline. Only these reviewed metadata declarations
// and imports may change; visible JSX, layout/error policy and source data cannot.
const pages=[
  {
    "path": "app/about/page.jsx",
    "sha256": "f47c575ea6b778c56fb6cec2d0699667ed91ebcbf7766a4f68b2df31f7fdc5d3",
    "old": "export const metadata={title:'About — JosHsuan Chao',description:'Computational designer and developer bridging design technology, digital fabrication and spatial interaction.',alternates:{canonical:'/about/'}};\n",
    "new": "export const metadata=withShareMetadata({title:'About — JosHsuan Chao',description:'Computational designer and developer bridging design technology, digital fabrication and spatial interaction.',alternates:{canonical:'/about/'}});\n",
    "imports": [
      "import {withShareMetadata} from '../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/contact/page.jsx",
    "sha256": "933284403253e98e27adb08bde8b32ca24db95225b806812fefd484237be0867",
    "old": "export const metadata={title:'Contact — JosHsuan Chao',description:'Contact JosHsuan Chao by email and find public work and profiles.',alternates:{canonical:'/contact/'}};\n",
    "new": "export const metadata=withShareMetadata({title:'Contact — JosHsuan Chao',description:'Contact JosHsuan Chao by email and find public work and profiles.',alternates:{canonical:'/contact/'}});\n",
    "imports": [
      "import {withShareMetadata} from '../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/page.jsx",
    "sha256": "b5c9fcbba934f9159ac6510e92b59f4c68fd3665e068dc853ed176d84b7035df",
    "old": "",
    "new": "export const metadata=withShareMetadata({title:introduction.metadataTitle,description:introduction.metadataDescription,alternates:{canonical:'/'}});\n",
    "imports": [
      "import introduction from '../release/introduction.json';\n",
      "import {withShareMetadata} from './share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/bending-active/page.jsx",
    "sha256": "c787458000c4e32a172f9e5f4b8ecab695ceacae47da44b5779878955002c1ef",
    "old": "export const metadata={title:'Bending-Active — JosHsuan Chao',description:'A research story about geometry, openings and the behaviour of a metal sheet.',alternates:{canonical:'/projects/bending-active/'}};\n",
    "new": "export const metadata=withShareMetadata({title:'Bending-Active — JosHsuan Chao',description:'A research story about geometry, openings and the behaviour of a metal sheet.',alternates:{canonical:'/projects/bending-active/'}}, {src:'/assets/cinematic/model-poster.webp',width:1440,height:1000,alt:'The approved Bending-Active metal-panel model, shown in its original exhibition scene.'});\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/dot-based-3d-printing/page.jsx",
    "sha256": "b9780dd7979cf8f77ae9aad32dcc7b5afcbc59de4e4befe3177365d1bd116e57",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/dot-based-3d-printing/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/dot-based-3d-printing/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/entrance-installation-art/page.jsx",
    "sha256": "e534c2b2fe1189be43ceccdd20fc326a72bbfb239db7f68050260f197170e484",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/entrance-installation-art/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/entrance-installation-art/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/hc3dp-caustics/page.jsx",
    "sha256": "076654c2c593f345334d6e6cca28e01e953e72d087dde4ae602a35554556ea7a",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/hc3dp-caustics/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/hc3dp-caustics/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/mode-s-of-making/page.jsx",
    "sha256": "f1bb38211a9230088a3d5859153d05e1046ab19c01c3b2d6f410aa9f2d1e6390",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/mode-s-of-making/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/mode-s-of-making/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/page.jsx",
    "sha256": "afbc5a34a9cca6818ed164aa2cbee7c0efa38704d0def9050c3a5ee3adcf6bf9",
    "old": "export const metadata={title:'Projects — JosHsuan Chao',description:'Explore two connected studies in material geometry and extended reality: Bending-Active and motion capture for bending-active structures.',alternates:{canonical:'/projects/'}};\n",
    "new": "export const metadata=withShareMetadata({title:'Projects — JosHsuan Chao',description:'Selected work in computational design, digital fabrication and spatial interaction, spanning material research, robotic assembly and XR workflows.',alternates:{canonical:'/projects/'}});\n",
    "imports": [
      "import {withShareMetadata} from '../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/project-caschlatsch/page.jsx",
    "sha256": "edfdaf3c3e5efd0bb50df230bf49bd7503fc7f872452c6b8e0b940234b352b7f",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/project-caschlatsch/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/project-caschlatsch/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/special-assemblies/page.jsx",
    "sha256": "4fdef720a1f9ff059e34309623ae0ccad5c256fa3d60530e8fb7a4d838ec73f3",
    "old": "export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/special-assemblies/'}};\n",
    "new": "export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/special-assemblies/'}}, project.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  },
  {
    "path": "app/projects/xr-bending-active/page.jsx",
    "sha256": "8b8679b75a555dc187edbc3a799289eaf21b9c801b6990835dd5dff33c9be2ed",
    "old": "export const metadata = {\n  title: study.metadataTitle,\n  description: study.metadataDescription,\n  alternates: { canonical: '/projects/xr-bending-active/' },\n};\n",
    "new": "export const metadata=withShareMetadata({\n  title: study.metadataTitle,\n  description: study.metadataDescription,\n  alternates: { canonical: '/projects/xr-bending-active/' },\n}, study.hero);\n",
    "imports": [
      "import {withShareMetadata} from '../../share-metadata.mjs';\n"
    ]
  }
];
// The single Special guide/data digest delta is independently pinned in special-planning-guide.test.mjs.
const pins={
  "release/manifest.json": "a9809c01b88c5fb015a06ed58b1d904721e967c499d4e120238496ca6528524e",
  "release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "release/project-studies.json": "a5648233801958adeb56e960e7060b62ebea05aacf474d6a57ad389eed3aac22",
  "release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "app/layout.jsx": "d810313efd7e235b6c511264150f9c45705e5d322c9eae6b55d317684e37ca82",
  "app/not-found.jsx": "457c40aea33af217eead30592c9f9441e0ad6f00cc80b01dfe80e0f2d4ac0479"
};
function verifyPage(source,record){
 let normalized=source;
 for(const allowed of record.imports){assert.equal(normalized.split(allowed).length,2,'Unique reviewed import');normalized=normalized.replace(allowed,'');}
 assert.equal(normalized.split(record.new).length,2,'Unique exact approved declaration');
 normalized=normalized.replace(record.new,record.old);
 assert.equal(hash(normalized),record.sha256,record.path+': all other bytes remain baseline');
}
const generic=['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch'];
const bendingImage={src:'/assets/cinematic/model-poster.webp',width:1440,height:1000,alt:'The approved Bending-Active metal-panel model, shown in its original exhibition scene.'};
const introduction=JSON.parse(await read('release/introduction.json'));
const studies=JSON.parse(await read('release/project-studies.json'));
const study=JSON.parse(await read('release/xr-study.json'));
const expected=[
 {route:'/',title:introduction.metadataTitle,description:introduction.metadataDescription},
 {route:'/about/',title:'About — JosHsuan Chao',description:'Computational designer and developer bridging design technology, digital fabrication and spatial interaction.'},
 {route:'/projects/',title:'Projects — JosHsuan Chao',description:'Selected work in computational design, digital fabrication and spatial interaction, spanning material research, robotic assembly and XR workflows.'},
 {route:'/contact/',title:'Contact — JosHsuan Chao',description:'Contact JosHsuan Chao by email and find public work and profiles.'},
 {route:'/projects/bending-active/',title:'Bending-Active — JosHsuan Chao',description:'A research story about geometry, openings and the behaviour of a metal sheet.',image:bendingImage},
 {route:'/projects/xr-bending-active/',title:study.metadataTitle,description:study.metadataDescription,image:study.hero},
 ...generic.map(id=>{const p=studies.projects.find(p=>p.id===id);return{route:`/projects/${id}/`,title:p.metadataTitle,description:p.metadataDescription,image:p.hero};}),
];
test('metadata additions preserve exact route bodies, root/error policy and approved source data',async()=>{
 for(const [path,sha]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),sha,path);
 assert.equal(pages.length,12);
 for(const record of pages)verifyPage(await read(record.path),record);
});
test('metadata normalization rejects visible edits, cross-route canonical, credentials and unapproved declarations',async()=>{
 for(const r of pages){const src=await read(r.path);for(const changed of [src+'\n',src.replace('export default','/* unrelated */export default'),src.replace(r.new,r.new.replace('alternates:','robots:{index:false},alternates:')),src.replace(r.new,r.new.replace('description:','description:"Award-winning licensed architect",unused:'))])assert.throws(()=>verifyPage(changed,r));}
});
test('all twelve actual route declarations produce exact factual canonical/title/description and explicit social policy',async()=>{
 assert.equal(new Set(expected.map(x=>x.route)).size,12);
 for(const e of expected){
  const record=pages.find(p=>p.path===`app${e.route==='/'?'/':e.route}page.jsx`);assert(record,e.route);
  const source=await read(record.path);verifyPage(source,record);
  const project=studies.projects.find(p=>`/projects/${p.id}/`===e.route);
  // Evaluate only the exact reviewed metadata expression, never JSX or imports.
  const value=runInNewContext(record.new.replace(/^export const metadata\s*=/,'').replace(/;\n$/,''),{withShareMetadata,introduction,study,project});
  const actual=JSON.parse(JSON.stringify(value));
  const base={title:e.title,description:e.description,alternates:{canonical:e.route}};
  const image=e.image;
  assert.deepEqual(actual,{...base,openGraph:{type:'website',title:e.title,description:e.description,url:e.route,...(image?{images:[{url:image.src,width:image.width,height:image.height,alt:image.alt,type:'image/webp'}]}:{})},twitter:{card:image?'summary_large_image':'summary',title:e.title,description:e.description,...(image?{images:[{url:image.src,alt:image.alt}]}:{})}});
 }
});
test('eight share images retain approved native WebP bytes, dimensions and original meaningful alt',async()=>{
 const manifest=JSON.parse(await read('release/manifest.json'));assert.equal(manifest.origin,'https://joshsuan.github.io');
 const images=expected.filter(e=>e.image).map(e=>e.image);assert.equal(images.length,8);
 for(const image of images){const pin=manifest.assets.find(p=>'/'+p.path===image.src);assert(pin,image.src);const bytes=await readFile(new URL('release/public'+image.src,root));assert.equal(bytes.length,pin.bytes);assert.equal(hash(bytes),pin.sha256);assertProjectImage(bytes,image);assert(image.alt.length>15);}
});
test('pure sharing helper preserves caller metadata without mutation and never inherits an unrelated preview',()=>{
 const base=Object.freeze({title:'Exact title',description:'Exact description',alternates:Object.freeze({canonical:'/about/'}),robots:Object.freeze({index:true})});
 const image=Object.freeze({...bendingImage});const before=JSON.stringify({base,image});
 const rich=withShareMetadata(base,image),plain=withShareMetadata(base);
 assert.equal(JSON.stringify({base,image}),before);assert.equal(rich.robots,base.robots);assert.equal(plain.twitter.card,'summary');assert(!('images'in plain.openGraph));assert(!('images'in plain.twitter));
 rich.openGraph.images[0].alt='Mutated output';assert.equal(image.alt,bendingImage.alt);
});

import {assertShareMetadataHtml,assertNotFoundMetadataHtml,assertNoNativeBodySource} from '../../scripts/share-metadata.mjs';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function nativeHead(e){
 const url=path=>new URL(path,'https://joshsuan.github.io').href;
 const meta=(key,value)=>`<meta ${key.startsWith('og:')?'property':'name'}="${key}" content="${escape(value)}">`;
 const fields=[['description',e.description],['og:type','website'],['og:title',e.title],['og:description',e.description],['og:url',url(e.route)],['twitter:card',e.image?'summary_large_image':'summary'],['twitter:title',e.title],['twitter:description',e.description]];
 if(e.image){const i=e.image;fields.push(['og:image',url(i.src)],['og:image:type','image/webp'],['og:image:width',i.width],['og:image:height',i.height],['og:image:alt',i.alt],['twitter:image',url(i.src)],['twitter:image:alt',i.alt]);}
 return `<html><head><title>${escape(e.title)}</title><link rel="canonical" href="${url(e.route)}">${fields.map(([k,v])=>meta(k,v)).join('')}</head><body>Visible content</body></html>`;
}
test('built-head audit accepts exact twelve native route heads and decodes real HTML entities',()=>{
 for(const e of expected)assertShareMetadataHtml(nativeHead(e),e);
 const escaped={route:'/',title:'Design & "source" <proof>',description:"Chao's source > promise"};assertShareMetadataHtml(nativeHead(escaped).replaceAll('&amp;','&#38;'),escaped);
});
test('built-head audit rejects RSC-only evidence, missing/duplicate/wrong-route and inherited images',()=>{
 const e=expected.find(x=>x.image),good=nativeHead(e);
 const cases=[
  '<html><head></head><body><script>'+good+'</script></body></html>',
  '<html><head><!--'+good+'--></head></html>',
  good.replace(/<title>.*?<\/title>/,''),
  good.replace('</head>','<title>'+e.title+'</title></head>'),
  good.replace('property="og:image"','property="og:wrong"'),
  good.replace('name="twitter:card"','name="twitter:wrong"'),
  good.replace('</head>','<meta property="og:title" content="duplicate"></head>'),
  good.replace('rel="canonical" href="https://joshsuan.github.io'+e.route+'"','rel="canonical" href="https://joshsuan.github.io/about/"'),
  good.replace('property="og:image:width" content="'+e.image.width+'"','property="og:image:width" content="1"'),
  good.replace('property="og:image:type" content="image/webp"','property="og:image:type" content="image/jpeg"'),
 ];
 for(const html of cases)assert.throws(()=>assertShareMetadataHtml(html,e));
 const ordinary=expected[0];for(const key of ['og:image','og:image:alt','twitter:image','twitter:image:alt'])assert.throws(()=>assertShareMetadataHtml(nativeHead(ordinary).replace('</head>',`<meta property="${key}" content="inherited"></head>`),ordinary));
});
test('404 remains native noindex, not a script assertion or inherited project preview',()=>{
 const good='<html><head><meta name="robots" content="noindex, follow"></head></html>';assertNotFoundMetadataHtml(good);
 for(const bad of [good.replace('noindex','index'),'<head><script>'+good+'</script></head>',good.replace('</head>','<meta property="og:image" content="/project.webp"></head>')])assert.throws(()=>assertNotFoundMetadataHtml(bad));
});

test('removed XR opening source may exist in native social metadata or inert payloads, never native reading content',()=>{
 const source=study.hero.src;
 const allowed=`<html><head><meta property="og:image" content="https://joshsuan.github.io${source}"><meta name="twitter:image" content="${source}"></head><body><main>Original workspace content</main><script>self.__next_f.push([1,${JSON.stringify(source)}])</script><style>.unused{background:url(${source})}</style><!-- <img src="${source}"> --></body></html>`;
 assertNoNativeBodySource(allowed,source);
 for(const content of [
  `<img src="${source}" alt="Removed opening">`,
  `<picture><source srcset="${source} 1x"><img src="/approved-workspace.webp"></picture>`,
  `<img src="https://joshsuan.github.io${source}">`,
  `<img src="${source.replaceAll('/','&#47;')}">`,
  `<div style="background-image:url(${source})"></div>`,
 ])assert.throws(()=>assertNoNativeBodySource(allowed.replace('</main>',content+'</main>'),source),/Removed opening photograph/);
 for(const malformed of ['<head></head>',allowed.replace('</html>','<body>Duplicate body</body></html>')])assert.throws(()=>assertNoNativeBodySource(malformed,source),/One actual exported native body/);
});
