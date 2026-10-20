import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertProjectStudies,assertProjectAssetRecord} from '../../scripts/project-studies.mjs';

const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name+'.json',release),'utf8'));
const fixture=()=>({studies:read('project-studies'),assets:read('project-assets'),manifest:read('manifest')});
const validate=({studies,assets,manifest})=>{
  const images=assertProjectStudies(studies,manifest);
  assertProjectAssetRecord(assets,images,manifest,studies);
  return images;
};
const project=(fixture,id='mode-s-of-making')=>fixture.studies.projects.find(item=>item.id===id);
const motion=(fixture,id='mode-s-of-making')=>project(fixture,id).motionMedia[0];
const provenance=(fixture,id='mode-s-of-making')=>fixture.assets.motionAssets.find(item=>item.projectId===id);
const reject=change=>{const current=fixture();change(current);assert.throws(()=>validate(current));};

test('five source motions and their posters have complete release provenance',()=>{
  const current=fixture(),images=validate(current);
  assert.equal(images.length,46);
  assert.equal(new Set(images.map(image=>image.src)).size,43);
  assert.equal(current.assets.motionAssets.length,5);
  assert.equal(current.manifest.assets.length,124);
  assert.equal(project(current,'project-caschlatsch').motionMedia,undefined);
  assert.doesNotThrow(()=>assertProjectAssetRecord(current.assets,images,current.manifest));
});

test('motion selection rejects an omitted source or unreviewed chapter, loop and simulation claim',()=>{
  reject(current=>delete project(current).motionMedia);
  reject(current=>motion(current,'entrance-installation-art').chapter='making');
  reject(current=>motion(current,'special-assemblies').loop=true);
  reject(current=>project(current,'project-caschlatsch').motionMedia=[motion(current)]);
  reject(current=>motion(current,'hc3dp-caustics').caption='Verified physical optical result.');
  reject(current=>motion(current).caption='Physical prototype operation.');
});

test('one source model cannot leave and return in separated story chapters',()=>{
  const current=fixture(),mode=project(current);
  mode.model.chapters=['context','results'];
  mode.model.views={context:mode.model.views.context,results:structuredClone(mode.model.views.context)};
  assert.throws(()=>assertProjectStudies(current.studies,current.manifest),/one ordered, continuous chapter interval/);
});

test('motion metadata rejects dropped frames, retiming, resizing and changed native posters',()=>{
  reject(current=>motion(current).frameCount--);
  reject(current=>motion(current).durationSeconds=8);
  reject(current=>motion(current).width=640);
  reject(current=>motion(current).poster.width=640);
  reject(current=>{
    const src=motion(current).poster.src;
    current.manifest.assets=current.manifest.assets.filter(pin=>'/'+pin.path!==src);
  });
});

test('provenance rejects orphaned, duplicated, mismatched and unpinned motion assets',()=>{
  reject(current=>current.assets.motionAssets.pop());
  reject(current=>current.assets.motionAssets[1]=structuredClone(current.assets.motionAssets[0]));
  reject(current=>provenance(current).frameCount--);
  reject(current=>provenance(current).sha256='0'.repeat(64));
  reject(current=>current.manifest.assets.push(structuredClone(current.manifest.assets[0])));
});

test('the five original sources and exact PPTX members cannot be silently substituted',()=>{
  reject(current=>provenance(current).source.sha256='0'.repeat(64));
  reject(current=>provenance(current,'dot-based-3d-printing').source.container.zipMember='ppt/media/image49.gif');
  reject(current=>provenance(current,'hc3dp-caustics').source.container.slide=18);
  reject(current=>provenance(current,'hc3dp-caustics').source.container.byteExactExtractedMember=false);
  reject(current=>provenance(current,'special-assemblies').source.intrinsicGIFLoopExtension=0);
});

test('the full native sequence forbids crop, trim, retime, enlargement and deformation',()=>{
  for(const [key,value] of [['crop',[0,0,100,100]],['trim',[0,1]],['retime',2],['resize',[640,360]],['upscaled',true],['geometryDeformation',true]]){
    reject(current=>provenance(current).processing[key]=value);
  }
  reject(current=>provenance(current,'hc3dp-caustics').processing.pad.rightPixels=2);
  reject(current=>provenance(current,'special-assemblies').processing.pad.sourcePixelBounds.height++);
});

test('native frame, end and final-delay proofs cannot be removed or weakened',()=>{
  for(const key of ['frameCountExact','allFramePTSExact','allFrameDurationsExact','finalFrameDurationExact','absolutePTSOriginUnchanged','faststartVerified','noChapterAdvanceOnEnded']){
    reject(current=>provenance(current,'dot-based-3d-printing').processing[key]=false);
  }
  reject(current=>provenance(current,'dot-based-3d-printing').processing.finalFrameDurationTicks=16);
  reject(current=>provenance(current,'special-assemblies').processing.loopPolicy='Automatically restart at the first frame.');
  reject(current=>{
    const src=motion(current,'special-assemblies').poster.src;
    current.assets.assets.find(asset=>asset.src===src).processing.selectedFrame=107;
  });
});

test('native remux proofs preserve encoded packets, range, identity matrix and silent private-data boundary',()=>{
  for(const key of ['encodedVideoPacketsByteExact','avcCExtradataByteExact','allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved']){
    reject(current=>provenance(current).processing[key]=false);
  }
  reject(current=>provenance(current).processing.trackMatrix[0]=0);
  reject(current=>provenance(current).processing.colorRange='pc/full');
  reject(current=>provenance(current).processing.pixelFormat='yuvj420p');
  reject(current=>provenance(current,'entrance-installation-art').processing.colorRange='tv/limited');
  reject(current=>provenance(current,'entrance-installation-art').processing.pixelFormat='yuv420p');
  reject(current=>provenance(current).processing.audio='Source audio retained.');
  reject(current=>provenance(current).source.privatePath='D:\\private\\source.mp4');
  reject(current=>provenance(current).source.privatePath='d:\\private\\source.mp4');
});
