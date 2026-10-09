// Presentation size and device resource pressure are separate decisions. This
// profile never changes camera composition, authored geometry or material modes.
const STANDARD = Object.freeze({id:'standard',pixelBudgets:Object.freeze({full:1_600_000,light:1_200_000}),maxSamples:2,shadowMapSize:1024});
const TOUCH = Object.freeze({id:'conservative-touch',pixelBudgets:Object.freeze({full:520_000,light:360_000}),maxSamples:0,shadowMapSize:512});

export function resolveRenderProfile({coarsePointer=false,userAgent='',platform='',maxTouchPoints=0}={}) {
  // Include desktop-mode iPad Safari and iOS browsers without depending on a
  // particular Safari version. This is a conservative product policy, not a
  // claim that a UA tells us available GPU memory or diagnoses a crash.
  const ios=/iPad|iPhone|iPod/i.test(userAgent) || (/Mac/i.test(platform) && maxTouchPoints>1);
  return coarsePointer || ios ? TOUCH : STANDARD;
}
