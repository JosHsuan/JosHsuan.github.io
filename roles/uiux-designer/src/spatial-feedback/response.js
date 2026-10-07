/** One interruptible response owner per specimen; no persistent idle RAF. */
export function createResponse({ initial, render, reduced = false, onActivity = () => {} }) {
  const values = { ...initial }, targets = { ...initial }, velocity = Object.fromEntries(Object.keys(initial).map(key => [key, 0]));
  let frame = 0, last = 0, disposed = false, stiffness = 260, damping = 27;
  function draw() { render(values); }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; onActivity(false); }
  function tick(time) {
    frame = 0;
    const dt = Math.min(last ? (time - last) / 1000 : 1 / 60, .064); last = time;
    const steps = Math.max(1, Math.ceil(dt / .008)); const h = dt / steps;
    let moving = false;
    for (const key of Object.keys(values)) {
      for (let step = 0; step < steps; step++) {
        velocity[key] += ((targets[key] - values[key]) * stiffness - velocity[key] * damping) * h;
        values[key] += velocity[key] * h;
      }
      if (Math.abs(targets[key] - values[key]) < .0005 && Math.abs(velocity[key]) < .002) { values[key] = targets[key]; velocity[key] = 0; }
      else moving = true;
    }
    draw();
    if (moving && !disposed) frame = requestAnimationFrame(tick); else stop();
  }
  const api = {
    to(next) {
      if (disposed) return;
      Object.assign(targets, next);
      if (reduced) { Object.assign(values, targets); stop(); draw(); return; }
      if (!frame) { onActivity(true); frame = requestAnimationFrame(tick); }
    },
    snap(next = targets) { Object.assign(targets, next); Object.assign(values, targets); Object.keys(velocity).forEach(key => { velocity[key] = 0; }); stop(); draw(); },
    feel(name) { stiffness = name === 'elastic' ? 190 : 260; damping = name === 'elastic' ? 17 : 27; },
    destroy() { disposed = true; stop(); },
  };
  const visibility = () => { if (document.hidden) api.snap(); };
  document.addEventListener('visibilitychange', visibility);
  const destroy = api.destroy;
  api.destroy = () => { destroy(); document.removeEventListener('visibilitychange', visibility); };
  draw(); return api;
}
