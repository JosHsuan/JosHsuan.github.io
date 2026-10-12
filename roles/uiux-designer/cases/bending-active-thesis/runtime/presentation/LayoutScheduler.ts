/** Coalesces explicit invalidations while keeping browser event cancellation synchronous. */
export class LayoutScheduler {
  private dirty=false;
  private resumed=false;
  private reasons=new Set<string>();
  private wake:()=>void;
  private measures=0;
  private closed=false;
  constructor(wake:()=>void){this.wake=wake;}
  invalidate(reason:string,resumed=false){if(this.closed)return;this.dirty=true;this.resumed||=resumed;this.reasons.add(reason);this.wake();}
  flush(measure:(resumed:boolean)=>void){
    if(this.closed||!this.dirty)return false;
    const resumed=this.resumed;this.dirty=false;this.resumed=false;this.reasons.clear();
    measure(resumed);this.measures++;return true;
  }
  inspect(){return{dirty:this.dirty,resumed:this.resumed,reasons:[...this.reasons],measures:this.measures};}
  dispose(){this.closed=true;this.dirty=false;this.reasons.clear();}
}
