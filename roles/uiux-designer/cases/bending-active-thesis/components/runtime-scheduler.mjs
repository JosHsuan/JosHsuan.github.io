/** One application RAF. Suspension reasons compose so pageshow cannot restart
 * a still-hidden/frozen document. A request never accumulates more than one frame.
 * The caller owns elapsed time and deliberately discards suspended intervals. */
export function createFrameScheduler({request, cancel, onFrame}) {
  let handle = null, disposed = false, epoch = 0;
  const reasons = new Set();
  const schedule = () => {
    if (disposed || reasons.size || handle !== null) return;
    const ownEpoch = ++epoch;
    handle = request(now => {
      if (ownEpoch !== epoch) return;
      handle = null;
      if (!disposed && !reasons.size) onFrame(now);
    });
  };
  return {
    schedule,
    suspend(reason, suspended) {
      if (disposed) return;
      if (suspended) reasons.add(reason); else reasons.delete(reason);
      if (reasons.size && handle !== null) {epoch++; cancel(handle); handle = null;}
    },
    get suspended() {return reasons.size > 0;},
    inspect() {return {scheduled: handle !== null, suspended: reasons.size > 0, reasons: [...reasons], disposed};},
    dispose() {if (disposed) return; disposed = true; epoch++; if (handle !== null) cancel(handle); handle = null; reasons.clear();},
  };
}
