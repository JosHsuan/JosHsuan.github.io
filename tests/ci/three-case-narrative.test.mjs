// Historical exact-baseline checks below first reverse ONLY the separately
// reviewed 26 October scroll-reading delta; raw current-DOM contracts live in
// scroll-reading-contract.test.mjs and source-access.test.mjs. No asset is normalized.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readReviewedFile as readFile} from './scroll-reading-contract.mjs';
import test from 'node:test';
import {projectStudyEvidence} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs';
import {projectStudyEvidenceLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs';
const projects=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const selected=["dot-based-3d-printing","special-assemblies","project-caschlatsch"];
// Independently captured from live 86a6ce58c57f12a0e1ac2eb7fe48e2d632f0fc0b,
// before narrative edits. No runtime git dependency and no refreshed source pins.
const preserved={
  "dot-based-3d-printing": "5ff3051937015ec563e1eed097b53879869fb07fcdcee1fab6a0dd14a04ca103",
  "special-assemblies": "798e3af5007b2a218044219ea948588d397f28cc5005465cae947c60232dab9e",
  "project-caschlatsch": "e9b46cd71b5b8a4326fe1204db98215fc811185f245ed5a19a0df358b42080cd"
};
const untouched={
  "mode-s-of-making": "771bd3d904aeb4fc5a51a42d783ea29d2e93fc2087bb8a3e7f11d2cbd674d0a3",
  "entrance-installation-art": "e0e175c3ef29f32b5fb75bf9255d2c324e5cb18ecc8f4ee6ea8b1b2273beafb5",
  "hc3dp-caustics": "e5c16d1871376c4733fcb95372224703307e1ae8524eb386a15b1055a878609b"
};
const allowedDiagramSources=[
  "/assets/projects/dot-based-3d-printing/path-strategies.webp",
  "/assets/projects/special-assemblies/module-aggregation.webp",
  "/assets/projects/special-assemblies/planning-workflow.webp",
  "/assets/projects/special-assemblies/robot-trajectories.webp"
];
const originalImages={
  "/assets/projects/dot-based-3d-printing/hero.webp": [
    "38c56383422d9d35b47b77e17d9e971f93cde41bfe25c2ed4000379fa100ec6a"
  ],
  "/assets/projects/dot-based-3d-printing/parameter-study.webp": [
    "8f0b985030b89da93e0a84b7b2b70a672a1fd6c75853d89689246c5eef9c9ddb"
  ],
  "/assets/projects/dot-based-3d-printing/path-strategies.webp": [
    "944045a15679df95ef9e6fd3dc4247b914f67349d225d245266321fe74696a18"
  ],
  "/assets/projects/dot-based-3d-printing/form-development.webp": [
    "a6c697f6b94827359ad51d2268fb354e2ed86bbd5cdec8157c575484cd1a0aeb"
  ],
  "/assets/projects/dot-based-3d-printing/printing-process.webp": [
    "228a5d0593f790183c5f5541e9240d59d10f64426a662e96dd819466a86be909",
    "8f9b11971c52fca03eb5206be44e0ab3f98063b6cad223890d3a05ce052355b0"
  ],
  "/assets/projects/dot-based-3d-printing/prototype-family.webp": [
    "2cd0d3f58ae32da9c25c4715b21beb2189a4cf8bd630e3389e9cbac0218fd8f1"
  ],
  "/assets/projects/dot-based-3d-printing/translucent-prototypes.webp": [
    "98974168bbef00f069d1ab4bd8907ea61ec36736c15e47c28e0f6c984490ce64"
  ],
  "/assets/projects/special-assemblies/hero.webp": [
    "d8a5e36b0f2fcd60bd2161e51cd47d51a8073f426275e7ae79e1a9c42b32114d"
  ],
  "/assets/projects/special-assemblies/prototype-study.webp": [
    "c1af0f9d1579092a097d60c48b9b971af4367001fce918b860b838f7d4cb1454"
  ],
  "/assets/projects/special-assemblies/module-aggregation.webp": [
    "77232fffd05a8114d59c562fda22f5c8d39dfa908cf5b18f7eac54b19870f6b0"
  ],
  "/assets/projects/special-assemblies/planning-workflow.webp": [
    "35fad0a18af70369bb941e59a58f332d52b9ccf9ed47802c21e62392e3ffd677"
  ],
  "/assets/projects/special-assemblies/robot-trajectories.webp": [
    "3317bfd9bf82f94c3491abf6c191c0a83c45d968bc55c87b86cd9976b0f5666f"
  ],
  "/assets/projects/special-assemblies/front-prototype.webp": [
    "8b391c702d06f7ffa33ee362889e10d0c88560fcfee6bfb7a6734cfe34b6fb41"
  ],
  "/assets/projects/special-assemblies/assembly-detail.webp": [
    "f77d0668cdd250b7319ffd316cb15b6edfeb6c889f84fb1945af8de33f7f2f55"
  ],
  "/assets/projects/special-assemblies/robot-assembly-motion-poster.webp": [
    "93305e9054a88dfa1f7772a76718d6236156ce3682ecd3372bcf788a9296f94e"
  ],
  "/assets/projects/project-caschlatsch/portfolio-timber-model.webp": [
    "ac6fa57d339642bc1d53761265335f1207374a5df76b96fae47f88b5e4e51ead"
  ],
  "/assets/projects/project-caschlatsch/portfolio-tower-on-site.webp": [
    "f1e96970e8925f7f21024b55acf35c704a0d482fa1a3bef67b09228439bdc806"
  ],
  "/assets/projects/project-caschlatsch/portfolio-voxel-framework.webp": [
    "bb98b53735e7deccdef374c92c2c8c1bc3b91c55a2039573ae272b722c767b74"
  ],
  "/assets/projects/project-caschlatsch/portfolio-module-infill.webp": [
    "292b11432929aaaf88baebb7f7f5ebd8b43d8f15fad44366018fb8ec0042d46b"
  ],
  "/assets/projects/project-caschlatsch/portfolio-xr-assembly-sequence.webp": [
    "e88d30fda73c1a5596ecd5c7245092e3ea5e8faa949e05afd3a334a806a0b8e2"
  ],
  "/assets/projects/project-caschlatsch/portfolio-xr-data-exchange.webp": [
    "5b646bbdfd8855ce1e634f02a06a7c32cccfa8814f00159ecc7afd1bc2284cef"
  ],
  "/assets/projects/project-caschlatsch/portfolio-xr-interface.webp": [
    "f1ad52061edbdc9209f7ee6a160628ab378d67070615c96b66595a54826ad8d3"
  ],
  "/assets/projects/project-caschlatsch/portfolio-xr-workshop.webp": [
    "648c73bc808e8d9e07934d09775cf269e114985fb7769b583745d05b28be620c"
  ],
  "/assets/projects/project-caschlatsch/portfolio-robotic-assembly.webp": [
    "2e0de976ce4c0707038da95a2dceee78692efbd36b613d26efa9626d62b8ac97"
  ],
  "/assets/projects/project-caschlatsch/portfolio-timber-interior.webp": [
    "487ac0851b8a0250de14f4aad066ed164d2ca32f9725078859b34ea2b5aff65f"
  ]
};
const expectedMedia={
  "dot-based-3d-printing/context": "b4d22885fa4084753c6d5269c00c2fc8a3a556b7ce9a3f53dafcb557ede9797e",
  "dot-based-3d-printing/system": "f22bece666359f08e37355d951cd801ba487360b5164a8fdf1666e69d1779138",
  "dot-based-3d-printing/making": "7049149ddca48dd4701250a291210f33b90781d8f5ced65638308c2a0ea35e6c",
  "dot-based-3d-printing/results": "c9e8545f8981c758ae6e738f4615c10af5ed1fa68bc571ead8f44cf012a2d9ec",
  "special-assemblies/context": "257fb080b7a56b8125719e58b99dfea9cfd8767bc833e0f5198360e83d3091f5",
  "special-assemblies/system": "48b8d7c64902c459cda567266d39b88a327c6e03cf7bdf64c6d8eb47a1438ef7",
  "special-assemblies/making": "31260b03bd183f1f69ea85fa2e59853157c6c96436fd27eb9e99689c55687610",
  "special-assemblies/results": "610c0f3633dbe970c1d4f283dee7139101982252a1f3f048e0b2b179de384863",
  "project-caschlatsch/context": "bc8fff52a9fff6473eae204e00a794ea3d37cb4e34e848ef7298425991e83ceb",
  "project-caschlatsch/system": "0ce8f0787bd3d406b6b4e8eb9b25925b5337b48fe49fa183b73d2c02e4232168",
  "project-caschlatsch/xr-guidance": "5808f02b8b34a5003f075ec9db3a512d9da467a01e49f8bac77ddcf26f69a8a1",
  "project-caschlatsch/making": "a8562ebd52149163bf44f32d3c5f3dd11edbe55049261f1b19da55a80f2e53eb",
  "project-caschlatsch/results": "3c9fc7a587578ad68974d5ae9738fdd24139dfb48069098f6d5fb1624ad87cfa"
};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const project=id=>projects.find(p=>p.id===id),section=(p,id)=>p.sections.find(s=>s.id===id);
const asset=(id,name)=>'/assets/projects/'+id+'/'+name+'.webp';
const protectedProject=p=>(()=>{const{sections,...rest}=p;return{...rest,chapters:sections.map(s=>({id:s.id,label:s.label,kind:s.kind}))};})();
const images=p=>[p.hero,...p.sections.flatMap(s=>s.media),...(p.model?[p.model.poster]:[]),...(p.motionMedia??[]).map(m=>m.poster)];

function assertImmutableRecords(projects){
 const project=id=>projects.find(p=>p.id===id);
 assert.deepEqual(projects.map(p=>p.id),['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch']);
 for(const [id,digest] of Object.entries(untouched))assert.equal(hash(project(id)),digest,id+' whole case');
 for(const id of selected){
  assert.equal(hash(protectedProject(project(id))),preserved[id],id+' immutable source/chapter contract');
  for(const s of project(id).sections)assert.equal(hash(s.media),expectedMedia[id+'/'+s.id],id+'/'+s.id+' exact approved media placement');
 }
 const seen=new Set();
 for(const image of selected.flatMap(id=>images(project(id)))){
  const copy=structuredClone(image);
  if(allowedDiagramSources.includes(copy.src)){assert.equal(copy.purpose,'diagram');delete copy.purpose;}
  assert(originalImages[copy.src]?.includes(hash(copy)),copy.src+' original image record');seen.add(copy.src+':'+hash(copy));
 }
 assert.deepEqual([...seen].sort(),Object.entries(originalImages).flatMap(([src,hashes])=>hashes.map(h=>src+':'+h)).sort());
}

test('three-case prose preserves other cases and all original source/camera/credit identities',()=>assertImmutableRecords(projects));
test('independent baseline pins reject source, chapter, camera and unrelated-case drift',()=>{
 for(const mutate of [
  p=>{p.find(p=>p.id==='dot-based-3d-printing').model.cameraPath[0].yawRad+=.01;},
  p=>{p.find(p=>p.id==='special-assemblies').sections[1].media[1].caption+=' changed';},
  p=>{p.find(p=>p.id==='project-caschlatsch').sections.reverse();},
  p=>{p.find(p=>p.id==='special-assemblies').sections[0].media[0].purpose='diagram';},
  p=>{p.find(p=>p.id==='entrance-installation-art').sections[0].paragraphs[0]+=' changed';},
 ]){const changed=structuredClone(projects);mutate(changed);assert.throws(()=>assertImmutableRecords(changed));}
});

test('four existing-source primary insertions expose exact complete foreground plates',()=>{
 const dot=project('dot-based-3d-printing'),special=project('special-assemblies'),cas=project('project-caschlatsch');
 assert.deepEqual(section(dot,'system').media[0],dot.model.poster);
 assert.deepEqual(section(special,'system').media[0],special.model.poster);
 assert.deepEqual(section(cas,'system').media[0],cas.hero);
 assert.deepEqual(section(cas,'xr-guidance').media[0],section(cas,'making').media[0]);
 for(const [p,chapter,names] of [[dot,'system',['path-strategies','form-development']],[special,'system',['module-aggregation','planning-workflow']],[special,'making',['robot-trajectories']],[cas,'system',['portfolio-voxel-framework','portfolio-module-infill']],[cas,'xr-guidance',['portfolio-xr-assembly-sequence','portfolio-xr-interface','portfolio-xr-data-exchange']]]){
  const foreground=projectStudyEvidence(p).get(chapter);
  assert.deepEqual(foreground.map(m=>m.src),names.map(name=>asset(p.id,name)),p.id+'/'+chapter);
  for(const image of foreground)if(image.purpose==='diagram')assert.equal(projectStudyEvidenceLayout(image),'full',image.src+' complete plate row');
 }
 for(const src of allowedDiagramSources)assert(images(project(src.split('/')[3])).some(m=>m.src===src&&m.purpose==='diagram'));
});

test('narrative distinguishes point-path evidence and simulated planning from physical fabrication',()=>{
 const dot=project('dot-based-3d-printing'),special=project('special-assemblies'),cas=project('project-caschlatsch');
 const prose=(p,id)=>section(p,id).paragraphs.join(' ');
 assert.match(prose(dot,'system'),/point model.*sample positions, not a finished solid or a complete fabrication sequence/i);
 assert.match(prose(dot,'making'),/not presented as one continuous recorded operation/i);
 assert.match(prose(dot,'results'),/rather than a ranked set of optimal printing settings/i);
 assert.equal(dot.model.primitive,'points');
 assert.match(prose(special,'making'),/simulation, not footage of a completed physical assembly/i);
 assert.match(prose(special,'results'),/do not by themselves establish collision-free execution or a verified assembly sequence/i);
 assert.equal(special.motionMedia[0].kind,'simulation');
 assert.match(prose(cas,'system'),/five-class framework/i);
 assert.match(prose(cas,'system'),/26-direction/i);
 assert.match(prose(cas,'system'),/occupied-voxel checks/i);
 assert.match(prose(cas,'xr-guidance'),/select and switch modules.*track beam IDs.*assembly sequence/i);
 assert.equal(cas.model,undefined);assert.equal(cas.motionMedia,undefined);
});
