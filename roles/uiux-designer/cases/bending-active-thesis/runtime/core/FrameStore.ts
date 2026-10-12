/** Latest coherent frame data and passive submission mailbox. No domain event per scalar. */
export class FrameStore {
  private value: Record<string,unknown>={u:0,nativeU:0,visualU:0,stageU:.5/7,energy:0,dwellWeight:1,pointer:{x:0,y:0},hidden:false};
  private presentation={controllerFrame:-1,chapterId:null as string|null};
  private listeners=new Set<()=>void>();
  get(){return this.value;}
  publish(patch:Record<string,unknown>){this.value={...this.value,...patch};}
  notify(){for(const listener of [...this.listeners])if(this.listeners.has(listener))listener();}
  subscribe(listener:()=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  getPresentation(){return this.presentation;}
  markPresented(controllerFrame:number,chapterId:string){this.presentation={controllerFrame,chapterId};}
  inspect(){return{subscriptions:this.listeners.size,controllerFrame:this.value.controllerFrame??0};}
  dispose(){this.listeners.clear();}
}
