import {acquireProjectModelScene} from '../../components/project-model-scene.mjs';
import {HOME_RESEARCH_PIXEL_BUDGET,HOME_RESEARCH_TOUCH_PIXEL_BUDGET,prepareHomeResearchScore,sampleHomeResearchScore} from './home-research-score.mjs';

/** Home has one original-source resource. Its owner supplies native scroll
 * progress on the existing ordinary-page clock; this adapter never schedules. */
export function acquireHomeResearchScene(options){
 if(options.signal.aborted)return Promise.reject(new DOMException('Preview aborted','AbortError'));
 const touch=options.host.ownerDocument.defaultView.matchMedia?.('(pointer: coarse)').matches===true;
 return acquireProjectModelScene({...options,presentation:{
  id:'home-research',canvasAttribute:'data-home-research-canvas',
  pixelBudget:touch?HOME_RESEARCH_TOUCH_PIXEL_BUDGET:HOME_RESEARCH_PIXEL_BUDGET,
  prepare:prepareHomeResearchScore,sample:sampleHomeResearchScore,
 }});
}
