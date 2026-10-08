// One-shot foreground choreography. Caller supplies elapsed active time from a
// once-per-reveal timestamp; looping chapter phase must not restart body text.
const PROFILES = Object.freeze({
  heading: {duration: 1.25, stagger: .075, turn: .16, pop: .55, rest: .79, anticipation: 1.16, overshoot: -.14, echo: .025, x: -18, y: 38, z: -64, rx: -14, ry: 5, rz: -.8, scale: -.045, shadow: 16},
  glyph: {duration: 1.42, stagger: .055, turn: .2, pop: .52, rest: .78, anticipation: 1.2, overshoot: -.21, echo: .055, x: 22, y: 12, z: -48, rx: 10, ry: -16, rz: 18, scale: -.14, shadow: 12},
  prose: {duration: .98, stagger: .065, turn: .14, pop: .65, rest: .84, anticipation: 1.06, overshoot: -.055, echo: .006, x: 0, y: 7, z: -10, rx: 1.1, ry: -.4, rz: 0, scale: 0, shadow: 0},
  diagram: {duration: 1.45, stagger: .095, turn: .18, pop: .58, rest: .81, anticipation: 1.15, overshoot: -.12, echo: .035, x: 24, y: 8, z: -72, rx: 3, ry: -15, rz: 0, scale: -.06, shadow: 22},
  photo: {duration: 1.5, stagger: .08, turn: .18, pop: .62, rest: .84, anticipation: 1.1, overshoot: -.12, echo: .02, x: 0, y: 38, z: -92, rx: 11, ry: -6, rz: -1.2, scale: -.06, shadow: 26},
  caption: {duration: .9, stagger: .07, turn: .12, pop: .6, rest: .83, anticipation: 1.08, overshoot: -.075, echo: .008, x: -16, y: 7, z: -20, rx: 3, ry: 0, rz: 0, scale: 0, shadow: 4},
  metric: {duration: 1.1, stagger: .1, turn: .15, pop: .48, rest: .75, anticipation: 1.18, overshoot: -.18, echo: .04, x: 0, y: 22, z: -36, rx: -7, ry: 0, rz: 0, scale: -.08, shadow: 10},
  credit: {duration: 1.12, stagger: .065, turn: .12, pop: .68, rest: .87, anticipation: 1.04, overshoot: -.04, echo: .005, x: 6, y: 11, z: -22, rx: 3, ry: 2, rz: 0, scale: -.01, shadow: 4},
  nav: {duration: .58, stagger: .035, turn: .15, pop: .53, rest: .78, anticipation: 1.1, overshoot: -.13, echo: .02, x: -10, y: 0, z: -12, rx: 0, ry: -5, rz: 0, scale: -.025, shadow: 5},
});
const ALIASES = Object.freeze({headingLine: 'heading', body: 'prose', method: 'diagram', media: 'photo', image: 'photo', credits: 'credit', navigation: 'nav'});
export const CHOREOGRAPHY_KINDS = Object.freeze(Object.keys(PROFILES));
const clamp = value => Math.min(1, Math.max(0, value));
const smoother = value => {const t = clamp(value); return clamp(t * t * t * (10 + t * (-15 + 6 * t)));};

function factorAt(t, profile) {
  const times = [0, profile.turn, profile.pop, profile.rest, 1];
  const values = [1, profile.anticipation, profile.overshoot, profile.echo, 0];
  for (let i = 1; i < times.length; i += 1) {
    if (t <= times[i]) return values[i - 1] + (values[i] - values[i - 1]) * smoother((t - times[i - 1]) / (times[i] - times[i - 1]));
  }
  return 0;
}

/**
 * CSS pixels/degrees, unitless scale. Apply to inner visual planes, never the
 * stable native link/button/summary hit region. Content stays opaque and present.
 */
export function sampleElementChoreography({kind = 'prose', elapsed = 0, index = 0, reducedMotion = false, light = false} = {}) {
  const name = Object.hasOwn(ALIASES, kind) ? ALIASES[kind] : kind;
  const profile = Object.hasOwn(PROFILES, name) ? PROFILES[name] : null;
  if (!profile) throw new RangeError(`Unknown choreography kind: ${kind}`);
  if (!Number.isFinite(elapsed) || !Number.isInteger(index) || index < 0) throw new RangeError('Elapsed must be finite seconds; index must be a nonnegative integer.');
  const delay = Math.min(.48, index * profile.stagger);
  const progress = reducedMotion ? 1 : clamp((elapsed - delay) / profile.duration);
  const settled = progress === 1;
  const factor = (settled ? 0 : factorAt(progress, profile)) * (light ? .55 : 1);
  const side = name === 'glyph' || name === 'diagram' ? (index % 2 ? -1 : 1) : 1;
  const phase = settled ? 'settled' : elapsed < delay ? 'waiting' : progress < profile.turn ? 'anticipation' : progress < profile.pop ? 'arrival' : 'settle';
  // Avoid negative zero in the stable representation and diagnostics.
  const scaleBy = value => factor === 0 || value === 0 ? 0 : value * factor;
  return {
    kind: name, phase, progress, delay, duration: profile.duration, settled,
    x: scaleBy(profile.x * side), y: scaleBy(profile.y), z: scaleBy(profile.z),
    rotateX: scaleBy(profile.rx), rotateY: scaleBy(profile.ry * side), rotateZ: scaleBy(profile.rz * side),
    scale: 1 + scaleBy(profile.scale), shadowDepth: Math.max(0, scaleBy(profile.shadow)),
    ruleProgress: reducedMotion ? 1 : smoother((progress - profile.turn) / (1 - profile.turn)),
  };
}
