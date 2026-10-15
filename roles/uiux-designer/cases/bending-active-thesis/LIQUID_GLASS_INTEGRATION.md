# Liquid Glass integration for Bending-Active

Owner request, 15 October 2026: research Apple Liquid Glass more deeply, select useful design skills / CLI / MCP tooling, implement the result within Bending-Active's architecture, then commit, push and publish through the existing gate. The subsequent owner review asks the whole team to make the material more visible, update the 2D information presentation as well, include the local catalog changes, and publish the revised case. This extends the [Apple-inspired material and event contract](APPLE_GLASS_EVENT_INTEGRATION.md). Its loading, source-reading and event-lifecycle requirements remain in force. The reusable portfolio framework, approved story/assets, model geometry, camera ownership and public-content inputs remain unchanged.

The verified starting release is `39636b763ee8760b7112abdc1e802cf957acf4ee`. Its darker material, optical/browser evidence and completed publication remain the release baseline. The owner rejected the subsequent pale silver/reading proposal as too white and revoked the earlier commit, push and deployment approval on 15 October 2026. That proposal was never committed, pushed or deployed; its local functional checks do not establish visual acceptance. Actual Apple image comparison informs a local neutral-dark revision for three floating functional groups, all seven information-window kinds and the catalog's 2D specimen. Its 48 local browser checks and nineteen captures remain the preceding background baseline. After the subsequent scene/focus review, the owner agreed to continue and then explicitly renewed authorization for commit/push and same-SHA CI-gated deployment of the reviewed neutral glass, 2D/catalog, background and existing keyboard-focus behavior. Execution remains pending; this record does not claim a completed commit or deployment.

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

## Rejected bright proposal and prior team review

The dark background contributes to the reported appearance, but it is not the only cause. The released functional material adds 78% deep graphite over that background, while the larger standard reading panels add 86%. Controls often sit above nearly featureless dark space, where even correct refraction has little visible detail to bend. Reducing the dark alpha alone would reveal more darkness and weaken white-label contrast over bright source content. The large dark reading rectangle is standard material; it must not be mistaken for a failed Liquid Glass shader.

The rejected proposal paired a light neutral silver functional material with deep graphite labels, and a slightly warmer, brighter standard reading material with deep body text and copper emphasis. It made surfaces visible on the dark stage, but its `.74` / `.82` pale fills dominated the actual background and read as near-solid light panels. The owner rejected that visual result. Regular material describes its functional/legibility role; neither pale paint nor a black fill alone establishes Liquid Glass. The 2D reading surfaces remain standard materials, without optical distortion of their text or source data.

Three collaborating agents reviewed the twelve existing project responsibilities and exchanged the prior recommendations below. They explain the rejected implementation's rationale; they are not current owner acceptance or twelve separate human approvals. The replacement decision is recorded separately below.

| Role | Decision and cross-role acceptance |
| --- | --- |
| Interactive Experience Director | Make both the controls and the whole reading surface lighter, retaining the seven-chapter hierarchy and model visibility. Reject a global light veil or another scene implementation. |
| UI/UX Designer | Use silver/deep-ink functional groups, one vessel each and visible selection. Change foregrounds with the fill; do not retain pale text simply to preserve the old theme. |
| Information Designer | Apply the lighter standard family to all seven information kinds, their captions and disclosures. Preserve opaque source paper and original source pixels; inspect small labels as well as body copy. |
| Software Architect / Runtime Engineer | Share a case-owned static token stylesheet between production and catalog, with foregrounds scoped to the relevant material groups. Preserve the Director and single property ownership. |
| Browser / GPU Performance Engineer | Adjust existing fills and shadows without adding backdrop layers, maps, live contexts or frame work. Revalidate the built artifact with the existing resource limits. |
| Motion Designer | Preserve pointer/press/cancel/focus behavior, lifecycle resets, Reduced Motion and slow-foreground pointer intent. Brightness does not introduce a new motion owner. |
| 3D Animation Designer | Keep source shell/base geometry, scene animation and camera bindings intact. Inspect the brighter reading surfaces through chapter holds and native scrolling. |
| 3D Artist | Retain the silver edge lens and neutral center, with standard reading material from the same family. Do not tint the model or documentary artwork to match the interface. |
| Lighting Designer | Use the light membrane and deep text to separate controls from the near-black environment. Restrict subtle cool/warm variation to DOM material; retain the lighting rig, exposure and ASCII density. |
| Animation Cinematographer | Lighten the complete large card and reduce heavy shadows, not merely its border. Preserve framing, camera, depth of field and narrative timing; inspect desktop/mobile captures. |
| Scene Designer | Prefer UI-only changes. The local catalog may use a static low-frequency backdrop for material visibility; do not veil the approved poster or add animated decoration. |
| Geometry Engineer | Preserve geometry, IDs, units, bounds, source-image pixels and opaque diagram paper. Keep the catalog's 2D specimen free of a model Canvas and its 3D camera unchanged. |

The shared source is `app/glass-materials.css`, a pure CSS token file used by the public case and concatenated into the local catalog build. It defines semantic fills, foregrounds, muted text, emphasis, borders and shadows; it does not add runtime state or a scheduler. Local opacity/forced-color alternatives keep the fill and foreground together. The page-level dark atmosphere and source-renderer colors are not rethemed through global `--paper` or `--accent` replacement.

Large reading cards require a foreground audit beyond the root tokens: earlier small notes, model positions/descriptions, fallback labels and heading variants contain pale literal colors. These must use the scoped reading semantics. The entry loader's signature sits outside its panel on a dark poster, so it retains an appropriate foreground rather than inheriting deep reading ink. Source SVG paths, authored colors, photographic presentation and the approved originals remain separate from this UI adaptation.

Initial desktop/mobile silver-reading prototypes were visually reviewed: the full title card becomes legible and lighter while the real model remains exposed; the mobile control rail has a clear boundary. A measured weak active accent in the first mobile prototype led to a deeper local accent rather than darkening every surface. These exploratory captures do not establish final seven-kind, catalog, preference or publication acceptance.

The rejected local implementation defines the following values in the shared stylesheet. They are retained as experimental history, not approved targets or a new deployed release:

| Token family | Local implementation |
| --- | --- |
| Standard reading fill | `rgb(232 239 232 / .82)` beneath a white gradient of `.13` to `.015`; opaque fallback `#dce5dc`. |
| Standard reading text | Ink `#17271d`, muted `#304236`, copper `#713116`. |
| Standard reading depth | 24 px blur / 145% saturation, 18 px blur on narrow screens; `0 12px 30px rgb(0 0 0 / .12)` and a restrained inset highlight. |
| Functional fill | `rgb(208 221 214 / .74)` beneath a white gradient of `.10` to `.025`; opaque fallback `#b6c5bb`. |
| Functional text | Ink `#16271e`, muted `#26342c`, deep copper `#51230f`. |
| Functional depth | 6 px blur / 145% saturation, 5 px / 140% on narrow screens; `0 10px 28px rgb(0 0 0 / .2)`, thin light/dark inset edges and the existing bounded lens. |
| Nested controls | Thin deep-ink fills at `.045` / `.08`, with no additional backdrop owner. |

The built desktop/mobile captures establish the rejected pale appearance and preserve the dark model atmosphere. Separate label corrections remain useful evidence: the model-label has a rounded, contained boundary, the earlier narrow-screen bright sliver is absent, and the affected nine-case regression passed at 320 × 700. Passing those layout checks did not validate the pale material's visual fidelity.

## Actual visual references and revised material direction

The renewed research inspects actual Apple image pixels, rather than treating transcript summaries or contrast passes as visual equivalence. Apple's [Materials dark-background illustration](https://developer.apple.com/tutorials/images/com.apple.HIG/materials-ios-liquid-glass-over-dark@2x.png) shows a deep violet/neutral regular surface with a thin light edge. The [light-background illustration](https://developer.apple.com/tutorials/images/com.apple.HIG/materials-ios-liquid-glass-over-light@2x.png) retains blue sky above and warm sand below as diffuse color through the same surface. The material follows its backdrop instead of imposing a uniform pale silver tone.

The actual [clear-look desktop image](https://www.apple.com/newsroom/images/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/article/Apple-WWDC25-Liquid-Glass-Home-Screen-clear-look-250609_big.jpg.large.jpg) and [dark-tint desktop image](https://www.apple.com/newsroom/images/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/article/Apple-WWDC25-Liquid-Glass-Home-Screen-dark-tint-250609_big.jpg.large.jpg) in [Apple's official announcement](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) were also inspected. Their Dock/widgets retain the wallpaper's local color and value relationships; the dark example does not become a milky light panel. These are visual observations of those examples, not numerical measurements of Apple's private shader or a claim that icon appearance and reading materials are interchangeable.

The rejected `.82` pale reading paint and `.74` pale control paint largely determined output color before their remaining backdrop contribution could appear. The pale catalog chrome/background also reduced separation from its source paper. The owner-supplied [Apple Liquid Glass iOS 26 Control Center UI Kit](https://www.figma.com/community/file/1515608601108987500/apple-liquid-glass-ios-26-control-center-ui-kit), by community author Ramesh Vishwakarma, was inspected through its actual 800 × 450 preview. It shows colored backdrop transmission and bright edges around transparent controls; the saturated blue/pink belongs to that composition, not a color to paint over this case's black scene. The editable Figma file and its numerical properties were not inspected. This third-party community reference is not an Apple publication or a source of native CSS parameters.

The current local revision uses a neutral dark appearance, light labels, a thin light edge and a bounded response to the real backdrop. Large reading cards lose the pale paint while retaining standard diffusion. Original white source paper remains intentionally opaque. Initial desktop/mobile neutral candidate captures show the scene's low-frequency structure through parts of the hero card and preserve source paper. Empty black areas still look quiet and comparatively matte; a flat screenshot cannot prove transmission or lensing. Actual text contrast, black/gray/white backdrop response and rim/core optical comparisons remain independent requirements.

Architecture review keeps this adjustment in the existing material pipeline: no per-frame scene/DOM luminance readback, React theme changes, duplicated content or additional optical owner. The project does not claim automatic native light/dark adaptation. These are project-selected web values, subject to the new built-artifact checks and owner review.

| Current token family | Local neutral implementation |
| --- | --- |
| Standard reading, regular path | `rgb(24 29 30 / .72)` beneath a white gradient of `.025` to `.005`; 18 px blur / 120% saturation, 14 px blur at widths up to 780 px. |
| Functional, regular path | `rgb(25 30 31 / .72)` beneath the same subtle gradient; 5 px blur / 120% saturation. |
| Standard reading, desktop Chromium range path | `rgb(24 29 30 / .14)` and the same gradient; `blur(18px) saturate(125%) contrast(55%) brightness(50%)`, with 14 px blur on narrow screens before the coarse-pointer override below. No spatial displacement of reading content is introduced. |
| Functional, desktop Chromium range path | `rgb(25 30 31 / .10)` and the same gradient; `blur(5px) saturate(125%) contrast(55%) brightness(50%)`, then the existing supported SDF rim optics on its one skin. Coarse-pointer controls retain SDF refraction over regular diffusion. |
| Foregrounds | Reading/control ink `#f0f3f2`; reading muted `#dfe6e3`, control muted `#e2e8e5`; emphasis `#ffeadf`. The corrected artifact passes measured contrast checks below. |
| Opaque / unsupported path | Neutral solid `#202526` with light scoped foregrounds. Reduced Transparency and increased contrast replace both regular and range variants and remove filtering. |
| Edges and depth | Reading/control borders `rgb(237 244 241 / .22)` / `.28`; restrained `.18` shadows and thin inset highlights; nested fills white `.045` / `.05`, with no extra backdrop. |

Production CSS selects the range variants through `:root:has([data-liquid-mode="refractive"])`, reusing the existing presenter's discrete, already tested Chromium capability policy. Regular/NoJS paths retain the stronger readable tint. The catalog evaluates the same pure `liquidGlassMode` function once when mounting a 2D specimen and sets `data-material-capability="range"` or `"regular"`. That marker chooses the shared static tokens; it adds no map, renderer or animation writer. Native media preferences continue to override both variants immediately. A CSS support/parser result alone does not establish optical compositing or extend this policy to WebKit.

Actual visible-padding probes further limit the range path for both reading and functional surfaces. The investigation samples blank interior padding while keeping the original foreground visible; it does not hide labels to obtain a different compositor result. Under the earlier low-tint range treatment, five neutral backdrops produce the following rounded mean RGB values:

| Profile / surface | Black `0` | Gray `64` | Gray `128` | Gray `192` | White `255` |
| --- | --- | --- | --- | --- | --- |
| Desktop Chromium reading | 29 | 44 | 59 | 74 | 89 |
| Desktop Chromium functional identity / reading controls | 29 | 45 | 61 | 76 | 92 |
| Pixel 7 Chromium emulation reading | 5 | 59 | 114 | 169 | 223 |
| Pixel 7 Chromium emulation functional controls | 4 | 61 | 118 | 175 | 232 |

The desktop output is compressed; the emulated mobile output follows the high-transmission tint without the intended color compression. This result persists with foreground content visible and through the earlier clipping, ancestor, stacking and frame-delivery controls. It is evidence from Windows Chromium and Pixel 7 mobile emulation, not a claim about every physical Android/iOS device. The ignored `animation-review/.local/visible-material-probe.json` and its probe script record these investigative samples; they are not final acceptance results.

Therefore `@media (hover:none), (pointer:coarse)` aliases both reading and control range fills/backdrops to the `.72` regular variants. These retain genuine backdrop transmission and a readable light-text pair. Functional controls keep their SDF rim refraction after regular diffusion; this does not claim working mobile range color compression. A medium-width viewport alone does not decide this fallback. Source paper and original pixels remain unchanged.

The twelve responsibilities converge on the following revised direction after rejecting the earlier white proposal:

| Role | Current decision / acceptance |
| --- | --- |
| Interactive Experience Director | Recover backdrop relationships and reading hierarchy across the whole case; require owner comparison of actual desktop/mobile pages. |
| UI/UX Designer | Neutral dark functional vessels with light labels and restrained edges; readable selection and one vessel per command group. |
| Information Designer | Standard material for all seven kinds and catalog 2D chrome; crisp scoped labels, source-paper protection and real small-text contrast. |
| Software Architect / Runtime Engineer | Static shared semantic tokens and one existing capability decision; no frame-time theme sampling or second property owner. |
| Browser / GPU Performance Engineer | Keep existing backdrop/map/context budgets; report regular/reflective fallbacks honestly and verify the rebuilt artifact. |
| Motion Designer | Preserve existing pointer, press, cancellation, keyboard focus, Reduced Motion and lifecycle closure. Material brightness adds no clock. |
| 3D Animation Designer | Preserve animation/camera bindings and check that reading surfaces leave the approved scene legible through native scrolling. |
| 3D Artist | Restrict the adjustment to DOM material; retain source geometry, authored image/model colors and optical center neutrality. |
| Lighting Designer | Use the actual near-black scene as the backdrop, with restrained neutral highlights; do not alter exposure, lighting rig or ASCII density to fake glass. |
| Animation Cinematographer | Reduce large painted-card dominance while preserving composition, source apertures, camera and chapter timing. |
| Scene Designer | Keep the approved poster/environment; any catalog backdrop remains static and local, without a global scene veil. |
| Geometry Engineer | Preserve source IDs, units, bounds, geometry and opaque source pixels; catalog 2D gains no model Canvas. |

## Surface hierarchy

The current neutral mapping preserves the distinction between floating functional glass, standard reading material and documentary source paper.

| Surface | Material ownership |
| --- | --- |
| `identity` | One neutral Liquid Glass skin with light text. The masthead text and separator retain their layout and semantics. |
| `chapter-navigation` | One neutral vessel surrounds the existing seven chapter links. Selected/hovered labels use thin fills, not independent backdrop filters. |
| `reading-controls` | One neutral vessel surrounds status, Enable 3D or fallback text as applicable. Hydration invalidates layout so the mounted group registers. |
| `editorial`, `model-label`, `evidence-caption` | Standard neutral reading material and scoped light foregrounds; labels and body text are never refracted. |
| `source-diagram`, `evidence-image` | Standard neutral outer material; original vector drawings and photographic evidence remain documentary pixels on their own protected surfaces. |
| `source-details`, `source-portal` | Standard neutral disclosure material and readable summary/caption controls. Nested evidence adds no second backdrop or tint. |
| Local catalog 2D information window | The same semantic reading tokens define the window chrome, margin and caption. Source artwork retains local opaque paper; the entire content area is not a second solid fill. |

`LiquidGlassSkin.jsx` renders the decorative span and its zero-size SVG definitions. Before registration, the parent has one readable native backdrop. Once ready, the parent clears its material and the skin becomes the sole backdrop owner. Foreground content, focus outlines and hit areas remain outside the optical skin. The scene retains its dark atmosphere and approved source palette; UI surfaces use neutral dark material with light scoped text and restrained warm emphasis. IBM Plex typography is unchanged.

The released dark baseline used graphite `rgb(13 23 24 / .78)`. The neutral revision changes the fill/backdrop response while retaining its optical structure. Native diffusion remains bounded, with a dark lower edge, directional rim and small local glint. The traveling glint remains confined to the inner 6 px rim so press does not wash across the text core. The skin can contract slightly while its foreground remains stationary; keyboard-visible focus and Reduced Motion suppress that deformation. Pointer-created focus does not erase the press response.

The catalog keeps its existing native-scroll position, entrance/exit, elastic response and event lifecycle. Its 2D `.vt-window` is the sole backdrop-filter owner and remains transparent; its `::before` overscan is the sole tint owner and has no backdrop filter. Painting the same alpha on both layers would double the material. The earlier pseudo-element filter was pixel-inert in the tested catalog; moving the one filter to the window produces the desktop's bounded backdrop response. Coarse-pointer reading still uses the regular policy above. The 2D content background is transparent around its protected source paper. This updates the local specimen; it does not add a catalog route to the published case.

## Original rim optics and runtime ownership

`runtime/motion/liquid-glass.mjs` implements a rounded-rectangle signed-distance field. A circular meniscus supplies the rim normal; an air-to-material Snell calculation with a project-selected index of 1.45 supplies a bounded ray offset. The center has no intended ray bend. Red and green channels encode the two displacement directions for `feDisplacementMap`. This is an intentionally bounded optical approximation, not a full physical light simulation.

Maps are generated on geometry changes, limited to 65,536 pixels and a maximum dimension of 384 pixels, then reused while dimensions/radius remain stable. One reusable offscreen Canvas2D encodes map pixels as an in-memory PNG. It is an encoder, not a visible scene or animation surface; disposal releases its store. No live scene readback, screenshot loop, duplicated DOM/content or copied model pixels supplies the effect.

The presenter supplies explicit local pixel dimensions to `feImage`: percentage dimensions against the zero-size definition SVG produced an empty displacement input and a whole-surface offset in the first built experiment. The optical regression keeps the actual URL, map, diffusion, fill and highlights identical, changing only displacement scale from 12 to zero. It requires a changed rim and a neutral center, rather than accepting any screenshot difference as refraction.

The current skin orders its native blur/color functions before the SDF URL filter. In the earlier neutral ordering, blur after displacement erased the measured opposite-direction rim response even though some pixels changed. A targeted same-pattern, scale-12 comparison after reordering observed top/bottom offsets of −1/+1 px on desktop Chromium and −1/+2 px on mobile Chromium, with zero center offset. The corrected complete eighteen-case material/interaction run now passes. Its original optical thresholds remain unchanged: rim mean difference above `.3`, core difference below `max(.8, rimMean × .5)`, negative top shift and positive bottom shift; WebKit retains the separately checked reflective fallback. Pixel changes alone are still insufficient evidence of refraction.

`LiquidGlassPresenter` alone owns map attributes, displacement scale and `--liquid-*` response properties. The existing Director supplies active dt, pointer intent, keyboard modality, layout invalidation and lifecycle resets through its existing scoped subscriptions. Response values stay outside React state. Maps do not regenerate on pointer movement, and the presenter adds no RAF, timer or event listener of its own. SceneRuntime remains the sole final scene/camera writer; information-window elasticity retains its existing owner.

Pointer exit/cancel, window blur, hidden/resume, preference changes, removal and disposal release the transient response. Springs settle to a stable rest and do not create a permanent animation workload. No new production dependency, live WebGL context or renderer is introduced. The temporary Canvas2D encoder is explicitly accounted for rather than described as zero new contexts of every kind.

A long foreground frame snaps the response to the latest pointer target and discards spring velocity; it does not cancel that target. Clearing intent on a slow frame lost the only pointer move on software-GPU CI while the pointer remained stationary. Explicit cancellation and lifecycle suspension still clear intent immediately.

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

Reduced Transparency and increased contrast immediately replace the optical skin with a solid, clearer boundary. Both neutral material variants retain a dark opaque fill paired with light scoped foregrounds. Forced colors use system Canvas / CanvasText / LinkText without blur, refraction or glint. Reduced Motion preserves the readable static lens where supported but removes decorative movement/light travel. Keyboard-visible focus freezes the skin while preserving the focus ring. No-JavaScript controls retain their parent regular material and original navigation. Printing removes decorative glass.

Built-artifact acceptance must prove actual background displacement in the refractive mode, separate crisp foregrounds, background changes during scrolling, one material owner per group, stable map reuse, pointer/keyboard/touch cleanup and preference changes. Reflective fallback must be reported as reflective. Existing seven-kind reading-material, original source-paper, contrast, entry, model, ASCII and lifecycle checks remain required. A screenshot over a flat background or a filter declaration alone cannot satisfy the optical acceptance.

Each material revision additionally measures rendered text against black, gray, white and representative source backgrounds, including maximum reflection/press, muted text and active emphasis. Keep the existing 4.5:1 small-text and 3:1 large-text thresholds; do not lower them for the new palette. A minimum pale-background brightness or mandatory deep-text color would force the rejected white result and is not an Apple fidelity test. Evaluate mode-specific transmission, neutral color, crisp foregrounds and anti-whitewash behavior alongside contrast and the unchanged optical rim/core requirements. Preserve the real theme/capability ancestors in fixtures. Inspect all seven information kinds and the built 2D catalog rather than extrapolating from the hero card. Confirm opaque preferences, live changes, NoJS, loading, focus and nested material ownership on the final artifact.

## Development tools and reproducibility

The project-original [liquid-glass-web skill](../../skills/liquid-glass-web/SKILL.md) translates the research into this web architecture. It is available through the UI/UX role's isolated discovery workflow; it does not modify global/root agent configuration. Existing pinned frontend-design / Playwright references remain scoped to the role.

The zero-dependency `roles/uiux-designer/tools/apple-design.mjs` CLI connects explicitly to the independent Sosumi documentation MCP at `https://sosumi.ai/mcp`. It discovers tool schemas before fetching Apple documentation or video transcripts, bounds responses, returns metadata by default and treats fetched text as untrusted reference data. It neither uploads project files nor writes reference text into public assets. Sosumi is an independent service, not an Apple-owned MCP or native rendering engine.

```sh
node roles/uiux-designer/tools/apple-design.mjs list --json
node roles/uiux-designer/tools/apple-design.mjs fetch /design/human-interface-guidelines/materials --json
node roles/uiux-designer/tools/apple-design.mjs fetch /videos/play/wwdc2025/219/ --content
```

[Tooling verification](../../verification/liquid-glass-tooling.json) records successful real MCP initialize/list/fetch responses, source response hashes, inspected licenses/revisions, CLI tests and role discovery. The remote service reports name/version rather than its deployed source commit; the inspected upstream commit is not an attestation of that deployment. The external `@nshipster/sosumi` CLI and a native-platform Liquid Glass skill were evaluated, not installed/copied. Apple SwiftUI/Xcode capabilities are useful native references but do not implement this Next.js website's material. Existing pinned Playwright CLI/MCP remains the browser inspection path; neither research MCP nor design skill is a website runtime dependency.

## Verified dark release checkpoint

Local checks on 15 October 2026 passed `pnpm check` (9 framework tests, 14 gate tests and the empty 63-file framework audit), case TypeScript, 307 of 309 case/tooling portable tests with two existing conditional skips, and the public build audit (80 output files, 36 approved assets). The role skill and isolated copy validate with identical hashes, and the CLI completed a real Apple Materials fetch through Sosumi MCP. No new production dependency or lockfile change is required.

The built Liquid Glass acceptance covers three scenarios in Chromium, WebKit and mobile Chromium: actual optical rim/neutral-center pixels, shared-clock interaction/lifecycle closure, and native preference/no-JavaScript readability. The optical comparison retains production diffusion and paint while changing only displacement scale; it requires a changed rim, neutral center and opposite top/bottom displacement. The control contrast check also exercises the maximum authored hover/press reflection over white and black backdrops, preserving original text and filters. Actual page/control screenshots are reviewed against the existing presentation.

Release `39636b763ee8760b7112abdc1e802cf957acf4ee` passed [CI 38734570558](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38734570558): 156 public browser scenarios, 24 root/subpath framework scenarios and the required gate. [Deployment 38738397785](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38738397785) reused its tested output without rebuilding. Its tested-output digest is `54abbed21e27c5555fb3f80a9f7bc81c8a488fd303376eb0e581e64e9189ad82`; public HTML SHA-256 is `8405c92286d7c8ee0e73eec616e8f0ad1792b88d8c50bcb6169d2b88432b96f6`. The completion audit records exact public HTML/release identity and 12 live browser passes, with no unexpected or flaky outcomes. These facts establish the darker baseline, not the brighter follow-up.

## Rejected bright proposal: local functional evidence

The owner revoked the earlier approval on 15 October 2026 after rejecting the pale appearance and requested an official Apple visual comparison before release. This checkpoint describes local, uncommitted experimental implementation; the already deployed `39636b7` release remains the publication baseline. No commit, push, CI gate or deployment of this proposal is authorized by the superseded approval. The following functional evidence is preserved without claiming visual acceptance.

| Local check | Observed status |
| --- | --- |
| `pnpm check` | Final rerun passed, including the reusable empty framework audit. |
| Case/tooling portable tests | 309 total: 307 passed, two existing conditional skips, no failures. |
| Public material browser checks | 18 passed across Chromium, WebKit and mobile Chromium: shared information material, source paper, preferences/NoJS, actual optical rim/core, interaction and lifecycle closure. After the final label/figure-metadata corrections, all nine affected reading-material cases passed again on the rebuilt artifact in 42.3 seconds. The independent nine Liquid Glass cases were unchanged by those corrections. |
| Catalog behavior checks | 24 passed: four specimen checks, eight scroll-control checks and twelve native-scroll scenarios. |
| Model-label / information-window regression | All nine passed in 3.6 minutes, including the corrected permanent side information at 320 × 700, displayed-Canvas tracking and native-reading/focus/Reduced window behavior. |
| New six-case catalog material verifier | All six passed on the built catalog: two 2D specimens in Chromium, WebKit and mobile Chromium, with shared tokens, rendered contrast, single tint ownership, native contrast preferences and protected source paper. |

These rows preserve 57 distinct local browser/check outcomes: 18 public material, 24 catalog behavior, nine model/window and six catalog material checks. The final nine reading checks repeat an affected subset rather than adding nine distinct scenarios. Logs are local `.local-bright-{check,portable,material-browser,reading-final,information-regression,catalog-registry,catalog-controls,catalog-scroll,captures}.log`. The white catalog material run passed at `2026-10-15T14:12:52.315Z`; its former `animation-review/.local/bright-catalog-materials/results.json` path has since been overwritten by the neutral run. Historical logs and the white artifact hashes recorded in [catalog verification](animation-review/VERIFICATION.md) identify that earlier evidence; the current file must not be presented as its receipt.

The catalog verifier preserves the approved source-file SHA and opaque alpha. Paper pixels remain exact across black/white backgrounds within the same rendering mode. When switching the browser's native contrast mode, it permits only bounded raster quantization: maximum RGB channel difference one, no alpha difference, at most 1% changed pixels and mean channel difference at most .01. This accounts for browser rasterization at an unchanged source/clip; it does not allow recoloring, transparency, resampling geometry or altered artwork.

Nineteen fresh captures in `animation-review/.local/bright-built/` identify final local HTML SHA-256 `ee14375dd0bf4bdff9a8fedcbb730ecabcc9fac2a27b7da7e3e41cb8cdc6fd6f`. They include all seven chapters on desktop/mobile plus expanded source details and comparison portals. Actual functional-text minima are 5.319 / 5.374 / 5.969 on desktop and 6.381 / 5.137 / 5.935 on mobile for identity / chapter navigation / reading controls respectively. The capture run reports no horizontal overflow or page errors. These are rendered artifact observations, not a CI release digest.

The local review inspected card/deep-text hierarchy, copper labels, rounded model information, mobile reading boundaries and original-paper disclosures. Desktop source details and the desktop/mobile original-image portal retain opaque white paper, intact source colors and readable close/source controls. The mobile PATTERN capture has no exposed bright strip beside its reading card. Those successful functional/layout observations did not resolve the owner's subsequent rejection of the overall white appearance.

The approval for this white proposal was withdrawn. It was never committed, pushed or deployed. Its successful local checks do not approve the current neutral candidate, and the darker release's deployment evidence must not be reused as proof for either follow-up.

## Current neutral revision: local checkpoint

The corrected neutral public build audits 80 files and 36 approved assets; the catalog manifest includes 16 inputs. Both regular fills are `.72`, emphasis is `#ffeadf`, nested hover fill is `.05`, and native diffusion precedes SDF refraction. Coarse-pointer reading and control substrates use the regular variant; supported control rim refraction remains. Neither the 4.5:1 / 3:1 text thresholds nor the original optical thresholds were lowered.

| Corrected local check | Final evidence |
| --- | --- |
| Public material / interaction | All 18 passed in 3.8 minutes across Chromium, WebKit and mobile Chromium; `.local-neutral-material-browser.log`. Covers all seven reading kinds, protected source paper, contrast/preferences/NoJS, actual rim/core optics, shared-clock interaction and lifecycle cleanup. |
| Catalog behavior | All 24 passed: 12 scroll, eight focused controls and four registry checks; `.local-neutral-catalog-{scroll,controls,registry}.log`. All identify the same `app.js` hash below. |
| Catalog material | All six passed at `2026-10-15T15:10:53.389Z`; `.local-neutral-catalog-materials.log` and the now-current `animation-review/.local/bright-catalog-materials/results.json`. Both recipes pass in Chromium, WebKit and mobile Chromium. |
| Architecture / portable | The earlier neutral `pnpm check` passed; portable tests recorded 307 passes and two existing conditional skips. Final changes were CSS-only, so these results are retained without claiming an additional rerun. |
| Final page captures | Nineteen outputs at `2026-10-15T15:15:19.452Z`, recorded in `animation-review/.local/neutral-built/results.json`; desktop plus actual Pixel 7 device emulation with coarse-pointer media, not merely a narrow desktop viewport. No horizontal overflow or page errors were recorded. |

These are **48 distinct current browser checks** (`18 + 24 + 6`). The older nine geometry/model-window cases are historical regression evidence and are not counted as new neutral checks. Final public HTML SHA-256 is `15d333e95b3105f5e5015ce6e3c33d3da813f6ee631b377805842af1c8786e6b`. Actual functional-text minima for identity / chapter navigation / reading controls are **12.997 / 10.586 / 12.544** on desktop and **15.127 / 11.831 / 13.729** in Pixel 7 emulation.

Catalog SHA-256 identities: `app.js` = `291564c2d9d3bbe843d2dfdeba0f7106207b31ab44804b4201a02103fdf62a9a`; `style.css` = `78c83053faa162ef7ef5ca2739edabfd58ff2e19a2a32fca6756e62a250cabfd`; `source-manifest.json` = `56c4467a32c95a96c4b64f885ad77fcb8c797139aaff44611434273607045d32`. These identify local validated artifacts, not a commit or CI release digest.

The integration and architecture reviewers inspected desktop/mobile overview, model, source-details, original-image portal, pattern and catalog captures. They found no new layout blocker and preserved opaque source paper. This is not a claim of no occlusion: the existing mobile overlay can cover small text in an original-image thumbnail or cross a paper edge while scrolling. It is also not a one-to-one reproduction of the Figma preview. The subsequent scene/focus review and renewed explicit publication authorization are recorded below.

The work remains uncommitted at this checkpoint. The later renewed explicit owner authorization is recorded in the scene-background follow-up below; commit/push and same-SHA CI-gated deployment await execution. The rejected white proposal and its withdrawn approval remain historical. Release `39636b7` remains the deployed baseline.

Publication must reuse the successful same-commit CI artifact without rebuilding, as specified by [CI/CD operations](../../../../docs/CI_CD.md); public `release.json` and HTML bytes must match the validated artifact. The historical capability experiments do not replace this gate.

Physical iOS/Android devices, native Safari backdrop quality, sustained mobile GPU cost and production field performance are not established by desktop emulation. Record any additional test or emulation gaps in the final checkpoint.

## Subsequent local scene-background work

The owner subsequently authorized a richer 3D/background light field and local screenshots. [Scene background and lighting](SCENE_BACKGROUND_LIGHTING.md) records the seven-role decision, common chapter score, quantized Director CSS values and bounded wash on the existing cyclorama. The neutral glass, source key/materials, camera, exposure and approved asset bytes are unchanged. The 48 browser passes and nineteen captures above remain the **previous-background baseline**. This new work passes `pnpm check`, 361 of 363 portable tests (two existing skips), 27 focused checks, the 80-file / 36-asset public audit and **30 V2 browser checks**: eighteen material/interaction and twelve public/resource/readability regressions, with original thresholds unchanged. The completed 22-view set includes 21 visible control crops; two portal-only supplemental captures correct the measurement scope without changing production. Six designated views have no valid visible-HTML-text contrast failure, with observed minimum **5.628768:1**; this excludes source artwork and skipped occluded ranges. The design record preserves the base receipt's thirteen false positives and one HDR abort, the corrected helper identity and existing mobile occlusion limits. The unchanged catalog's prior thirty checks are not counted as new scene passes. The opaque approved static poster retains its earlier color/lighting and does not show the new Full background. After visual review and the model-focus clarification, the owner agreed to continue and then explicitly renewed commit/push/CI-gated deployment authorization for the reviewed changes. The prior withdrawal is historical; deployment must consume the successful same-SHA CI artifact, and execution remains pending.

The six-state native-input boundary audit on the same frozen `dc16040…` artifact finds border width zero throughout: browsing, hover and mouse comparison have no outline; keyboard Arrow focus shows the existing 2 px orange ring and engages the model; Escape clears engagement/selection but retains keyboard focus; an outside pointer click removes the ring. The [scene record](SCENE_BACKGROUND_LIGHTING.md#model-boundary-clarification-and-owner-continuation) links the audit receipt and comparison image. No production CSS or runtime changed for the audit. The owner separately renewed explicit publication authorization afterward; commit/push and same-SHA CI-gated deployment remain pending execution.
