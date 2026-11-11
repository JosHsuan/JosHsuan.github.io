import {createDocumentStageRegistry} from '../core/DocumentStageRegistry.mjs';

const stages=createDocumentStageRegistry('Home research stage');
export const registerHomeResearchStage=stages.register;
export const observeHomeResearchStage=stages.observe;
