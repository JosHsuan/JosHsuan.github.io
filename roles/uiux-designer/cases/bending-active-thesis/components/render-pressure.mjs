// Observe delivered frames; this policy neither schedules frames nor owns story
// time. Only sustained autonomous pressure reduces density, monotonically.
const SCALES = Object.freeze([1, .8, .65, .5]);
export function createRenderPressure() {
  let stage=0, previous=null, warmUntil=null, elapsed=0, count=0, slow=0, reason='initial-warmup', decisions=0;
  const clear=()=>{previous=null;warmUntil=null;elapsed=0;count=0;slow=0;};
  return {
    suspend(why='inactive') {clear();reason=why;},
    observe(now, {eligible=true, reason:ineligibleReason='inactive'}={}) {
      if(!Number.isFinite(now))throw new RangeError('Finite frame timestamp required');
      if(!eligible){clear();reason=ineligibleReason;return false;}
      if(previous===null || now<=previous){previous=now;warmUntil=now+2000;reason='warming';return false;}
      const delta=now-previous;previous=now;
      if(now<warmUntil)return false;
      // A background/tab gap must never count as measured rendering pressure.
      if(delta>5000){clear();previous=now;warmUntil=now+2000;reason='delivery-gap';return false;}
      elapsed+=delta;count++;if(delta>50)slow++;
      if(elapsed<4000 || count<8)return false;
      const pressured=elapsed/count>42 && slow/count>.65;
      elapsed=0;count=0;slow=0;
      if(pressured && stage<SCALES.length-1){stage++;decisions++;reason='sustained-slow-delivery';warmUntil=now+2000;return true;}
      reason=pressured?'density-floor':'stable-delivery';return false;
    },
    inspect(){return {stage,scale:SCALES[stage],reason,sampleCount:count,windowMs:elapsed,decisions};},
  };
}
