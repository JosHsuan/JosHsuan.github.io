# Liquid Glass integration for Bending-Active

Owner request, 15 October 2026: research Apple Liquid Glass more deeply, select useful design skills / CLI / MCP tooling, implement the result within Bending-Active's architecture, then commit, push and publish through the existing gate. This extends the [Apple-inspired material and event contract](APPLE_GLASS_EVENT_INTEGRATION.md). Its loading, source-reading and event-lifecycle requirements remain in force. The reusable portfolio framework, approved story/assets, model geometry, camera ownership and public-content inputs remain unchanged.

## Design translation and primary references

Apple distinguishes standard content materials from Liquid Glass for floating navigation and controls. Standard frost primarily diffuses the backdrop; Liquid Glass also communicates shape through lensing, directional reflections, edge depth and interaction. The implementation below is an original web interpretation, not Apple's native material, private shader or SwiftUI framework.

| Reference | Applied decision |
| --- | --- |
| [Materials HIG](https://developer.apple.com/design/human-interface-guidelines/materials) | Keep Liquid Glass in the functional layer. Use the regular treatment for control legibility; seven reading-window kinds retain standard materials. Do not layer another glass background on nested buttons. |
| [Meet Liquid Glass, WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/) | Real backdrop lensing distinguishes the new treatment from a renamed blur. Light and restrained deformation respond together to interaction; resting controls remain quiet. |
| [Get to know the new design system, WWDC25](https://developer.apple.com/videos/play/wwdc2025/356/) | Related controls share a single vessel. Preserve rounded geometry, spacing, clear selection and crisp foreground labels. |
| [Platforms State of the Union, WWDC26](https://developer.apple.com/videos/play/wwdc2026/102/) | The design update at 21:35 strengthens diffusion over complex content, darkened edges and brighter specular highlights. Greater transparency alone is not the target. |
| [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer) | Native grouped rendering informs common material ownership. This native API is a reference, not a website dependency. |

These sources were inspected on 15 October 2026. Numeric blur, opacity, spring and refraction parameters are project choices; Apple does not prescribe these web constants. Reference prose and assets are not imported into the published site.

## Surface hierarchy

| Surface | Material ownership |
| --- | --- |
| `identity` | Existing masthead identity receives one decorative Liquid Glass skin. Its text and separator retain their layout and semantics. |
| `chapter-navigation` | One floating navigation vessel surrounds the existing seven chapter links. Selected/hovered links use thin fills, not independent backdrop filters. |
| `reading-controls` | One floating vessel surrounds status, Enable 3D or fallback text as applicable. Hydration invalidates layout so the mounted group registers. |
| `editorial`, `model-label`, `evidence-caption` | Standard reading material; labels and body text are never refracted. |
| `source-diagram`, `evidence-image` | Standard outer material; original vector drawings and photographic evidence remain documentary pixels. |
| `source-details`, `source-portal` | Standard disclosure material. Nested evidence adds no second backdrop or tint. |

`LiquidGlassSkin.jsx` renders the decorative span and its zero-size SVG definitions. Before registration, the parent has one readable native backdrop. Once ready, the parent clears its material and the skin becomes the sole backdrop owner. Foreground content, focus outlines and hit areas remain outside the optical skin. The original graphite/orange palette and IBM Plex typography continue throughout.

The regular navigation fill uses graphite `rgb(13 23 24 / .78)` with a restrained reflection gradient. Native diffusion is 6 px / 145% saturation, reduced to 5 px / 140% on narrow viewports. A dark lower edge, directional rim and small local glint establish thickness. The skin can contract slightly during press while its foreground remains stationary; keyboard-visible focus and Reduced Motion suppress that deformation. Pointer-created focus does not erase the press response.

## Original rim optics and runtime ownership

`runtime/motion/liquid-glass.mjs` implements a rounded-rectangle signed-distance field. A circular meniscus supplies the rim normal; an air-to-material Snell calculation with a project-selected index of 1.45 supplies a bounded ray offset. The center has no intended ray bend. Red and green channels encode the two displacement directions for `feDisplacementMap`. This is an intentionally bounded optical approximation, not a full physical light simulation.

Maps are generated on geometry changes, limited to 65,536 pixels and a maximum dimension of 384 pixels, then reused while dimensions/radius remain stable. One reusable offscreen Canvas2D encodes map pixels as an in-memory PNG. It is an encoder, not a visible scene or animation surface; disposal releases its store. No live scene readback, screenshot loop, duplicated DOM/content or copied model pixels supplies the effect.

The presenter supplies explicit local pixel dimensions to `feImage`: percentage dimensions against the zero-size definition SVG produced an empty displacement input and a whole-surface offset in the first built experiment. The optical regression keeps the actual URL, map, diffusion, fill and highlights identical, changing only displacement scale from 12 to zero. It requires a changed rim and a neutral center, rather than accepting any screenshot difference as refraction.

`LiquidGlassPresenter` alone owns map attributes, displacement scale and `--liquid-*` response properties. The existing Director supplies active dt, pointer intent, keyboard modality, layout invalidation and lifecycle resets through its existing scoped subscriptions. Response values stay outside React state. Maps do not regenerate on pointer movement, and the presenter adds no RAF, timer or event listener of its own. SceneRuntime remains the sole final scene/camera writer; information-window elasticity retains its existing owner.

Pointer exit/cancel, window blur, hidden/resume, preference changes, removal and disposal release the transient response. Springs settle to a stable rest and do not create a permanent animation workload. No new production dependency, live WebGL context or renderer is introduced. The temporary Canvas2D encoder is explicitly accounted for rather than described as zero new contexts of every kind.

## Measured browser capability and fallback

An isolated capability probe executed 17 baseline/control/optical configurations in each of three fresh browser instances: 51 executions with no recorded crashes. These are capability experiments, not 51 passing application acceptance tests. The committed [capability record](../../verification/liquid-optics-capability.json) preserves measurements and controls. Local raw evidence is `animation-review/.local/liquid-optical-probe-final/{summary,results}.json`, recorded at `2026-10-15T11:22:10.771Z`, Windows, Node 24.19.0, Playwright 1.63.0.

The fixture uses a detailed RGB stripe backdrop and a separate foreground label. A 200 CSS-pixel screenshot scanline is compared with the actual baseline over candidate offsets. The displacement control expects a 20 CSS-pixel shift; merely parsing a `url()` filter is not evidence of refraction.

| Browser / configuration | Observed result | Production policy |
| --- | --- | --- |
| Chromium 153.0.8010.12, `backdrop-url` | Measured shift 20 px; shifted mean channel error 0 versus 100.73 unshifted. | Bounded SVG URL-backed backdrop refraction, plus shared diffusion/reflection. |
| Mobile Chromium 153.0.8010.12, `backdrop-url` | Measured shift 20 px; shifted mean channel error 0.40 versus 100.66 unshifted. | Same refraction with bounded map size and narrow-screen diffusion. |
| Windows WebKit 26.6, `backdrop-url` | No measured backdrop displacement. Native blur/invert controls were also pixel-inert in this environment. | Reflective fallback: shared tint, directional rim, glint and interaction; no URL-backed backdrop map. |

SVG-source / foreignObject positive controls established that the tested WebKit could filter those explicit sources. They do not establish arbitrary HTML backdrop capture and are not used to duplicate this page. The engine policy therefore enables refraction only for the tested Chromium family; iOS-branded browsers are excluded from that family. Unknown engines retain the readable reflective treatment, and unsupported filtering selects the opaque fallback.

The probe establishes this pinned environment's result, not a universal claim about every Safari release or platform. CSS filter parsing does not prove compositing. Windows WebKit cannot establish native macOS/iOS blur quality; separate physical-device measurements remain necessary. [Filter Effects specification](https://drafts.csswg.org/filter-effects-2/), [WebKit backdrop-filter issue](https://bugs.webkit.org/show_bug.cgi?id=245510).

## Accessibility and acceptance

Reduced Transparency and increased contrast immediately replace the optical skin with a solid, clearer boundary. Forced colors use system Canvas / CanvasText / LinkText without blur, refraction or glint. Reduced Motion preserves the readable static lens where supported but removes decorative movement/light travel. Keyboard-visible focus freezes the skin while preserving the focus ring. No-JavaScript controls retain their parent material and original navigation. Printing removes decorative glass.

Built-artifact acceptance must prove actual background displacement in the refractive mode, separate crisp foregrounds, background changes during scrolling, one material owner per group, stable map reuse, pointer/keyboard/touch cleanup and preference changes. Reflective fallback must be reported as reflective. Existing seven-kind reading-material, original source-paper, contrast, entry, model, ASCII and lifecycle checks remain required. A screenshot over a flat background or a filter declaration alone cannot satisfy the optical acceptance.

## Development tools and reproducibility

The project-original [liquid-glass-web skill](../../skills/liquid-glass-web/SKILL.md) translates the research into this web architecture. It is available through the UI/UX role's isolated discovery workflow; it does not modify global/root agent configuration. Existing pinned frontend-design / Playwright references remain scoped to the role.

The zero-dependency `roles/uiux-designer/tools/apple-design.mjs` CLI connects explicitly to the independent Sosumi documentation MCP at `https://sosumi.ai/mcp`. It discovers tool schemas before fetching Apple documentation or video transcripts, bounds responses, returns metadata by default and treats fetched text as untrusted reference data. It neither uploads project files nor writes reference text into public assets. Sosumi is an independent service, not an Apple-owned MCP or native rendering engine.

```sh
node roles/uiux-designer/tools/apple-design.mjs list --json
node roles/uiux-designer/tools/apple-design.mjs fetch /design/human-interface-guidelines/materials --json
node roles/uiux-designer/tools/apple-design.mjs fetch /videos/play/wwdc2025/219/ --content
```

[Tooling verification](../../verification/liquid-glass-tooling.json) records successful real MCP initialize/list/fetch responses, source response hashes, inspected licenses/revisions, CLI tests and role discovery. The remote service reports name/version rather than its deployed source commit; the inspected upstream commit is not an attestation of that deployment. The external `@nshipster/sosumi` CLI and a native-platform Liquid Glass skill were evaluated, not installed/copied. Apple SwiftUI/Xcode capabilities are useful native references but do not implement this Next.js website's material. Existing pinned Playwright CLI/MCP remains the browser inspection path; neither research MCP nor design skill is a website runtime dependency.

## Validation and release checkpoint

Local checks on 15 October 2026 passed `pnpm check` (9 framework tests, 14 gate tests and the empty 63-file framework audit), case TypeScript, 306 of 308 case/tooling portable tests with two existing conditional skips, and the public build audit (80 output files, 36 approved assets). The role skill and isolated copy validate with identical hashes, and the CLI completed a real Apple Materials fetch through Sosumi MCP. No new production dependency or lockfile change is required.

The built Liquid Glass acceptance covers three scenarios in Chromium, WebKit and mobile Chromium: actual optical rim/neutral-center pixels, shared-clock interaction/lifecycle closure, and native preference/no-JavaScript readability. The measured Chromium production material retains its diffusion and paint while changing only displacement scale: rim mean channel difference 0.897, center 0, with opposite top/bottom displacement. These measurements distinguish an actual rim lens from a whole-surface offset. Actual page/control screenshots were reviewed against the existing presentation.

Required before publication: the final source commit must pass all selected CI checks and its tested-output digest must be verified. Deployment must reuse that same-commit CI artifact without rebuilding, as specified by [CI/CD operations](../../../../docs/CI_CD.md); public `release.json` and HTML bytes must then match the validated artifact. The local capability experiments do not replace this gate.

Physical iOS/Android devices, native Safari backdrop quality, sustained mobile GPU cost and production field performance are not established by desktop emulation. Record any additional test or emulation gaps in the final checkpoint.
