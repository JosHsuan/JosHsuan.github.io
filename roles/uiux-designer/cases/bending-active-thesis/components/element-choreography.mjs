// One-shot foreground choreography. Caller supplies elapsed active time from a
// once-per-reveal timestamp; looping chapter phase must not restart body text.
const PROFILES = Object.freeze({
  heading: {duration: 1.05, stagger: .065, turn: .08, pop: .68, rest: .9, anticipation: 1.02, overshoot: -.025, echo: .002, x: 0, y: 26, z: -44, rx: -6, ry: 0, rz: 0, scale: -.025, shadow: 12},
  glyph: {duration: 1.1, stagger: .055, turn: .08, pop: .65, rest: .9, anticipation: 1.025, overshoot: -.04, echo: .004, x: 9, y: 18, z: -40, rx: -5, ry: -5, rz: 2, scale: -.07, shadow: 9},
  prose: {duration: .82, stagger: .045, turn: .06, pop: .72, rest: .92, anticipation: 1, overshoot: -.008, echo: 0, x: 0, y: 6, z: -8, rx: -.6, ry: 0, rz: 0, scale: 0, shadow: 0},
  diagram: {duration: 1.18, stagger: .07, turn: .08, pop: .68, rest: .9, anticipation: 1.02, overshoot: -.025, echo: .003, x: 12, y: 24, z: -68, rx: -7, ry: -4, rz: 0, scale: -.035, shadow: 16},
  photo: {duration: 1.2, stagger: .065, turn: .08, pop: .7, rest: .91, anticipation: 1.015, overshoot: -.025, echo: .002, x: 0, y: 30, z: -72, rx: -8, ry: 0, rz: 0, scale: -.04, shadow: 18},
  caption: {duration: .78, stagger: .045, turn: .06, pop: .74, rest: .92, anticipation: 1, overshoot: -.008, echo: 0, x: 0, y: 9, z: -14, rx: -2, ry: 0, rz: 0, scale: 0, shadow: 2},
  metric: {duration: .94, stagger: .08, turn: .07, pop: .65, rest: .9, anticipation: 1.02, overshoot: -.03, echo: .002, x: 0, y: 20, z: -40, rx: -5, ry: 0, rz: 0, scale: -.04, shadow: 8},
  credit: {duration: .9, stagger: .045, turn: .06, pop: .76, rest: .93, anticipation: 1, overshoot: -.006, echo: 0, x: 0, y: 10, z: -16, rx: -2, ry: 0, rz: 0, scale: -.005, shadow: 2},
  nav: {duration: .48, stagger: .025, turn: .06, pop: .7, rest: .91, anticipation: 1, overshoot: -.012, echo: 0, x: 0, y: 6, z: -10, rx: -2, ry: 0, rz: 0, scale: -.012, shadow: 3},
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
export function sampleElementChoreography({kind = 'prose', elapsed = 0, index = 0, reducedMotion = false} = {}) {
  const name = Object.hasOwn(ALIASES, kind) ? ALIASES[kind] : kind;
  const profile = Object.hasOwn(PROFILES, name) ? PROFILES[name] : null;
  if (!profile) throw new RangeError(`Unknown choreography kind: ${kind}`);
  if (!Number.isFinite(elapsed) || !Number.isInteger(index) || index < 0) throw new RangeError('Elapsed must be finite seconds; index must be a nonnegative integer.');
  const delay = Math.min(.48, index * profile.stagger);
  const progress = reducedMotion ? 1 : clamp((elapsed - delay) / profile.duration);
  const settled = progress === 1;
  const factor = settled ? 0 : factorAt(progress, profile);
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
