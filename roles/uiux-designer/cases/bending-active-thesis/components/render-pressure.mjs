// Observe delivered frames; this policy neither schedules frames nor owns story
// time. Only sustained autonomous pressure reduces density, monotonically.
const SCALES = Object.freeze([1, .8, .65, .5]);
export function createRenderPressure({severeDelivery=false}={}) {
  let stage=0, previous=null, warmUntil=null, elapsed=0, count=0, slow=0, reason='initial-warmup', decisions=0, severeStreak=0;
  const decisionHistory=[];
  const record=now=>{decisionHistory.push(Object.freeze({timestampMs:now,stage,scale:SCALES[stage],reason}));};
  const clear=()=>{previous=null;warmUntil=null;elapsed=0;count=0;slow=0;severeStreak=0;};
  return {
    suspend(why='inactive') {clear();reason=why;},
    observe(now, {eligible=true, reason:ineligibleReason='inactive'}={}) {
      if(!Number.isFinite(now))throw new RangeError('Finite frame timestamp required');
      if(!eligible){clear();reason=ineligibleReason;return false;}
      if(previous===null || now<=previous){severeStreak=0;previous=now;warmUntil=now+2000;reason='warming';return false;}
      const delta=now-previous;previous=now;
      if(now<warmUntil)return false;
      // A background/tab gap must never count as measured rendering pressure.
      if(delta>5000){clear();previous=now;warmUntil=now+2000;reason='delivery-gap';return false;}
      // Opt-in STANDARD experiment: repeated eligible severe delivery can
      // reduce one existing density step sooner, never on an unknown >5s gap.
      // Short frames clear only this streak; the legacy window is untouched.
      if(severeDelivery){
        severeStreak=delta>=500?Math.min(3,severeStreak+1):0;
        if(severeStreak===3 && stage<SCALES.length-1){
          stage++;decisions++;reason='sustained-severe-delivery';record(now);
          elapsed=0;count=0;slow=0;severeStreak=0;warmUntil=now+2000;
          return true;
        }
      }
      elapsed+=delta;count++;if(delta>50)slow++;
      if(elapsed<4000 || count<8)return false;
      const pressured=elapsed/count>42 && slow/count>.65;
      elapsed=0;count=0;slow=0;severeStreak=0;
      if(pressured && stage<SCALES.length-1){stage++;decisions++;reason='sustained-slow-delivery';record(now);warmUntil=now+2000;return true;}
      reason=pressured?'density-floor':'stable-delivery';return false;
    },
    inspectDecisions(){return decisionHistory.slice();},
    inspect(){return {stage,scale:SCALES[stage],reason,sampleCount:count,windowMs:elapsed,decisions};},
  };
}
