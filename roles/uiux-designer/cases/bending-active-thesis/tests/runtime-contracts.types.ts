import type {EventManager} from '../runtime/core/EventManager.ts';
import type {DisposableScope} from '../runtime/core/DisposableScope.ts';
import type {CommandRouter} from '../runtime/core/CommandRouter.ts';
import type {CommandMap} from '../runtime/contracts/commands.ts';

type Events = {selected: {chapter: string; index: number}; paused: boolean};

/** Checked by pnpm typecheck. These invalid contracts must remain compile errors. */
export function checkEventContract(events: EventManager<Events>,scope: DisposableScope) {
  events.emit('selected',{chapter:'form',index:0});
  events.on(scope,'paused',value=>value.valueOf());
  // @ts-expect-error Event name must be declared.
  events.emit('unknown',true);
  // @ts-expect-error A selected payload needs an integer-compatible number.
  events.emit('selected',{chapter:'form',index:'0'});
  // @ts-expect-error Boolean events cannot deliver model payloads.
  events.emit('paused',{chapter:'form',index:0});
}

export function checkCommandContract(commands:CommandRouter<CommandMap>){
  commands.execute('model.select',{chapterId:'form',index:0,selectedAt:0});
  // @ts-expect-error Chapter identities are a closed contract.
  commands.execute('model.select',{chapterId:'credits',index:0,selectedAt:0});
  // @ts-expect-error Visual quality has a closed set of supported values.
  commands.execute('quality.set',{detail:'ultra'});
  // @ts-expect-error Model state cannot own a visual preference.
  commands.execute('model.interact',{detail:'light'});
}
