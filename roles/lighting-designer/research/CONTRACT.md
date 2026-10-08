# Lighting direction contract

The catalog contains an original editorial rig, not measured site lighting. Coordinates are metres in the same Y-up review frame as the verified shell and source base. Scene direction sets stage bounds; the integrator may scale light distances consistently to those bounds. Directions, contrast and chapter identity matter more than preserving an unreviewed number.

One controller samples the rig from the shared damped visual clock. Interpolate positions, intensities and colours continuously across planned transitions; hold them during designed dwell. Do not animate exposure as a substitute for an intentional rig. Keep one renderer colour-management/output path. Key alone may cast a bounded shadow; fill/rim do not allocate extra shadow maps. Use the existing licensed local HDR, with chapter environment intensity; do not fetch CDN presets at runtime.

The source base and shell receive the same rig and contact logic. Broad grazing highlights reveal metal form; no hue, contour or brightness is described as stress, curvature analysis or measurement. Contact shadow is presentation shading, not physical proof. Verify thin open geometry does not turn black or lose its edge.

Light-to-layer influence: project key direction and actual subject centre for a restrained decorative halo and interface edge response. ASCII samples actual scene luminance/depth before DOF; lighting therefore changes ASCII density. Documentary image pixels remain opaque and unfiltered, and prose remains readable. A hover cue may alter the decorative frame, never source photographs.

Reduced motion selects one stable balanced rig; light changes stop when the visual clock settles or the document is hidden. Re-render shadow/contact only for an actual light/model change. Browser captures and model-derived work go under D:/JosHsuan_Website/_work/bending-active-thesis/round-02/lighting-designer. Source originals remain read-only.

Acceptance: inspect seven dwells and transitions on actual shell+base; preserve folds under highlights, avoid clipped white planes/black base, keep text contrast, verify real luminance-to-ASCII response, and verify no idle light ticking. The catalog and MCP test alone do not prove visual acceptance.

## Runtime handoff — Round 02

The case's `components/scene-direction.mjs` now implements a pure `sampleSceneDirection(stageU, {reducedMotion})` score. Seven anchors are `(chapterIndex + 0.5) / 7`, shared with Motion Designer. It interpolates once between authored chapter rigs because `stageU` already contains the response and unequal dwell mapping. Key/rim/environment/contact values retain the catalog endpoints. A weak opposite directional fill uses the catalog fill intensity, with a hemisphere at 65% of that value to preserve readable back-facing metal; neither adds a shadow map.

All sampled colours are linear RGB arrays for Three.js `Color.fromArray`; do not apply a second sRGB conversion. Key/fill/rim positions are metre offsets from the current combined source centre. The scene binding translates both light positions and targets consistently and remains the sole writer. Reduced motion selects the balanced credits rig and removes the decorative halo.

Six case unit-test groups verify real catalog endpoints, interpolation without a second ease, numeric continuity, finite bounded values, reduced-motion invariance, source-bound placement and explicit invalid-input rejection. The subsequent integrated 28-group browser run and 28-image review verify real metal/base lighting, contact and luminance-to-ASCII influence; see the case's ROUND_02_VERIFICATION.md. The sampled halo/contactOpacity channels remain reserved and unbound; actual contact comes from the key shadow, source base and editorial ground.
