export type StudyId = 'form' | 'system' | 'pattern';
export type SourceSelection = Readonly<{chapterId: StudyId; index: number; selectedAt: number}>;
export type RuntimeState = Readonly<{
  systemReduced: boolean;
  sceneEnabled: boolean; sceneFailed: boolean; sceneReady: boolean;
  sceneStatus: 'disabled' | 'loading' | 'ready' | 'failed'; reduced: boolean;
  modelEngaged: boolean; modelRecovering: boolean; modelInteractionChapter: StudyId | null;
  sourceSelection: SourceSelection | null;
}>;

export const initialState: RuntimeState = Object.freeze({systemReduced:false,
  sceneEnabled:false,sceneFailed:false,sceneReady:false,sceneStatus:'disabled',reduced:true,
  modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,sourceSelection:null});

export function validateState(candidate: RuntimeState): RuntimeState {
  for(const key of Object.keys(candidate))if(!Object.hasOwn(initialState,key))throw Error(`Unknown state field ${key}`);
  for(const key of ['systemReduced','sceneEnabled','sceneFailed','sceneReady','modelEngaged','modelRecovering'] as const){
    if(typeof candidate[key]!=='boolean')throw Error(`Invalid boolean ${key}`);
  }
  const counts={form:4,system:4,pattern:3};
  const chapter=candidate.modelInteractionChapter;
  if(chapter!==null&&!Object.hasOwn(counts,chapter))throw Error('Unknown interaction chapter');
  if(candidate.modelEngaged&&(chapter===null||candidate.modelRecovering))throw Error('Invalid inspection ownership');
  const selection=candidate.sourceSelection;
  if(selection&&(!Object.hasOwn(counts,selection.chapterId)||!Number.isInteger(selection.index)||selection.index<0||selection.index>=counts[selection.chapterId]||!Number.isFinite(selection.selectedAt)||selection.selectedAt<0))throw Error('Invalid source selection');
  return Object.freeze({...candidate,sourceSelection:selection?Object.freeze({...selection}):null,sceneReady:candidate.sceneReady&&!candidate.sceneFailed,
    reduced:candidate.systemReduced||!candidate.sceneEnabled||candidate.sceneFailed,
    sceneStatus:candidate.sceneFailed?'failed':!candidate.sceneEnabled?'disabled':candidate.sceneReady?'ready':'loading'});
}
