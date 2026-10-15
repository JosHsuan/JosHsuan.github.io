import type {RuntimeState,SourceSelection} from './state.ts';

export type InteractionPatch = Partial<Pick<RuntimeState,'modelEngaged'|'modelRecovering'|'modelInteractionChapter'|'modelHeldSource'|'sourceSelection'>>;
export type CommandMap = {
  'preferences.apply': Pick<RuntimeState,'systemReduced'|'sceneEnabled'|'sceneFailed'> & {sceneReady?: boolean};
  'model.interact': InteractionPatch;
  'model.select': SourceSelection & {modelRecovering?: boolean};
};
export type RuntimeEvents = {
  stateChanged: {version:number;previous:RuntimeState;current:RuntimeState};
  representationChanged: {selection:SourceSelection|null;version:number};
  representationResolved: {chapterId:string;index:number;representationId:string;label:string;description:string;count:number;pinned:boolean};
  layoutInvalidated: {reason:string;resumed:boolean};
  canvasTransition: {id:number;chapter:string;target:'hold'|'away';status:'requested'|'completed'|'cancelled';reason?:string};
  entryReadiness: {id:number;phase:'preparing'|'ready'|'revealing'|'entered'|'cancelled';reason?:string};
  diagramReveal: {id:number;kind:'library';status:'requested'|'completed'|'cancelled';reason?:string};
};
