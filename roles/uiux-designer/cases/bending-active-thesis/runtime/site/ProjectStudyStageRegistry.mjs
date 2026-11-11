import {createDocumentStageRegistry} from '../core/DocumentStageRegistry.mjs';

const stages=createDocumentStageRegistry('project study stage');
export const registerProjectStudyStage=stages.register;
export const observeProjectStudyStage=stages.observe;
