import {WAIT} from './case-helpers.mjs';
import {writeFile} from 'node:fs/promises';

/** A native scroll can begin acquisition of the chapter's real source model.
 * Keep that existing readiness budget separate from the image assertion below;
 * a failed/missing model draw must not masquerade as a settled reading surface. */
export async function settleEvidenceChapter(page,element){
 const chapter=await element.evaluate(node=>node.closest('[data-project-chapter]').dataset.projectChapter);
 const handle=await page.waitForFunction(chapter=>{
  const project=window.__globalBackground?.inspect().driver.projectStudy,stage=project?.backdrop?.stage,scene=project?.scene,resource=scene?.resource;
  if(document.querySelector('[data-project-study]')?.dataset.projectActiveChapter!==chapter||stage?.chapter!==chapter||!stage.settled)return false;
  if(stage.kind==='model'&&(scene?.phase!=='ready'||!resource?.successfulPaint||!resource.firstDraw?.completed||resource.view.chapter!==chapter))return false;
  return{chapter,at:performance.now(),kind:stage.kind,mode:stage.mode,settled:stage.settled,model:stage.kind==='model'?{phase:scene.phase,sourceRevision:resource.sourceRevision,firstDraw:resource.firstDraw,draws:resource.draws,viewChapter:resource.view.chapter}:null};
 },chapter,{timeout:WAIT});
 try{return await handle.jsonValue();}finally{await handle.dispose();}
}

export async function retainEvidenceReadiness(info,readiness){
 const path=info.outputPath('native-evidence-source-readiness.json');
 await writeFile(path,JSON.stringify(readiness,null,2));
 await info.attach('native-evidence-source-readiness',{path,contentType:'application/json'});
}
