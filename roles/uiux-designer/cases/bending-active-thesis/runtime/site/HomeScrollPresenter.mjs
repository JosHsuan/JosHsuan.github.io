import {createInformationWindowPresenter} from '../presentation/InformationWindowPresenter.mjs';

/** Home uses Bending's exact native-flow material response. The site background
 * driver owns layout invalidation, event scope and its existing demand clock;
 * this adapter creates no observer, listener, timer or animation frame.
 */
export function createHomeScrollPresenter({root,publisher}){
  const profile=root.getAttribute?.('data-information-motion-profile')==='velocity-skin'?'velocity-skin':'ink';
  const windows=createInformationWindowPresenter({root,publisher,profile});
  let disposed=false,enabled=false;
  let policy={ready:false,reduced:false,suspended:false,saveData:false,forcedColors:false};
  return{
    measure(input){if(!disposed)windows.measure(input);},
    publish({dt,docY,reduced=false,suspended=false,ready=false,saveData=false,forcedColors=false,seek=false,resumed=false}){
      if(disposed)return false;
      policy={ready:!!ready,reduced:!!reduced,suspended:!!suspended,saveData:!!saveData,forcedColors:!!forcedColors};
      enabled=policy.ready&&!policy.reduced&&!policy.suspended&&!policy.saveData&&!policy.forcedColors;
      // An unprepared page is measured in native flow and remains at rest. Its
      // transforms become eligible only after the destination's entry event.
      publisher.attribute(root,'data-home-scrolling-ready',policy.ready?'':null);
      return windows.publish({dt,docY,reduced:!enabled,seek,resumed});
    },
    inspect:()=>({enabled,policy:{...policy},informationWindows:windows.inspect(),disposed}),
    dispose(){
      if(disposed)return;
      disposed=true;enabled=false;
      windows.dispose();publisher.attribute(root,'data-home-scrolling-ready',null);
    },
  };
}
