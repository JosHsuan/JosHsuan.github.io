# UIUX design plan

Recorded: 7 October 2026. Role: **UI/UX Designer**. Status: maintained exploration and preference plan; production adoption remains pending.

## Owner decision and preference authority

The owner confirmed that **items marked Saved are their preferences**, and requested that the current exploration be recorded as the UIUX design plan before a separate 3D Artist session. This decision supersedes any curator shortlist when interpreting preferences. Saving an item does not authorize professional publication, make every proposed treatment mandatory, or approve an entire font/icon family by association.

| Record | Authority and current state |
|---|---|
| Owner preference | The owner's Saved IDs and accompanying notes in the original review browser |
| Live source | `http://127.0.0.1:4175/`, local-storage key `uiux-material-review-v1` |
| Existing live interpretation | [Connected feature review](http://127.0.0.1:4175/features/) reads the same key without replacing it |
| Durable transfer | Gallery **Export discussion choices** produces `uiux-discussion-choices.json`, including IDs, names, notes, sources and export time |
| Captured owner snapshot | **Not captured.** The browser connector failed to initialize during this handoff; no matching export was found in Downloads or Desktop. This means unknown selections, not an empty shortlist. |
| Verification data | Browser-test Saved fixtures are synthetic and must never be represented as the owner's selections |

Keep stable material IDs. The current Saved record identifies a material, not the precise slider values, Baseline/Spatial mode or date at which its effect was reviewed. In particular, Round 04 retained the original IDs: an earlier Save is not evidence that the owner reviewed its newer treatment. Preserve notes verbatim and record an export's capture time when a real snapshot becomes available. Validate IDs against [the catalog](catalog/materials.json), retaining unknown IDs as unresolved rather than silently discarding them.

Browser origin and profile matter. A second port, `localhost` instead of `127.0.0.1`, or an isolated test browser does not inherit this storage. A subsequent role must use an actual owner export or a deliberately implemented, read-only browser handoff to consume the choices. It must not overwrite the UIUX storage or ask the owner to reconstruct the list from memory. Until the choices are observable, use the explicit visual brief and label candidate relationships as proposals.

## Design direction

Follow [the supplied design guidelines](../../docs/WEBSITE_DESIGN_GUIDELINES.md) and [the maintained architecture](../../docs/architecture.md): cinematic engineering editorial, spatial ambition, an experimental Lab, and an original **FORM / SYSTEM / MAKE** anthology identity. Reference sites inform ambition and interaction principles; their layouts and assets are not reusable templates.

The owner requested Spatial feedback to extend across icons, interfaces, motion and spatial features. The explored vocabulary is **advance to select, separate to inspect, align to compare, return to undo**. The object can move while the reading plane, labels and hit regions stay stable. This is a working design hypothesis; individual choices continue to follow Saved.

Graphite, paper tones and interaction orange provide the existing proposal baseline. Locally supplied Plex Sans/Plex Mono are a curator starting point; Inter, Space Grotesk and JetBrains Mono remain comparison options. Lucide, Phosphor and Tabler are alternatives to compare, not three families to mix indiscriminately. None of these candidates is asserted to be the owner's selection without the actual Saved evidence.

## Recorded exploration

| Round | Available proposal | Review and evidence |
|---|---|---|
| 01 — material library | 19 working typography, icon, identity, interface, motion and spatial specimens | [Catalog](catalog/materials.json); [review desk](http://127.0.0.1:4175/) |
| 02 — spatial feedback | Seven object studies: words, glyphs, key, card, navigation, disclosure and a real curved-rib assembly | [Research](research/spatial-feedback.md); [collection](http://127.0.0.1:4175/?collection=spatial-feedback) |
| 03 — connected features | Study index, method reader, media inspection, comparison, geometry workbench and shared actions | [Integration proposal](research/spatial-editorial-system.md); [live features](http://127.0.0.1:4175/features/) |
| 04 — applied feedback | Material-specific Baseline/Spatial comparison on all 19 original materials, keeping their IDs and controls | [Mappings and recommendations](research/applied-feedback.md); [collection](http://127.0.0.1:4175/?collection=applied-feedback#materials) |

The inventory contains **26 materials**, **19 applied treatments**, **six connected features**, **26 actual rendered stills** and **78 fingerprinted asset files**. These counts overlap by design; they are not 51 separate materials. See the [asset](catalog/assets.manifest.json), [preview](catalog/previews.manifest.json), [feature](catalog/features.manifest.json) and [applied-feedback](catalog/applied-feedback.manifest.json) manifests.

The connected page demonstrates real local studies rather than fictional professional projects. Its parameter controls change generated geometry; undo/redo restores state; SVG/JSON downloads contain current results. Optional commands invoke the same visible actions. Theatre playback is deliberate and has a separate property owner.

## Review and adoption plan

1. Keep the original review desk and Saved history available. Use the Saved filter for the owner's shortlist; use the connected feature page to inspect its application to a reading sequence.
2. Compare captured stills first, then open one live specimen. Inspect its controls, source/license, proposed use and tradeoff. Use Baseline/Spatial and reduced motion before deciding where the treatment belongs.
3. Capture a real preference export when available, preserving its provenance and notes. Do not turn a missing snapshot into an inferred shortlist. Keep UIUX choices separate from future 3D Artist choices.
4. Map selected items to a specific function and an ordinary accessible alternative. Curator recommendation: begin with icon feedback and navigation state, then linework and part inspection; reserve authored 3D sequences for meaningful geometric relationships. This sequence is a proposal, not owner approval.
5. Consider production adoption only in a separately authorized portfolio implementation step, with approved professional content, actual contribution/credit evidence, static fallbacks and a measured performance budget.

## Implementation contracts

- Preserve Next.js static export, the committed package versions and lockfile, Node 24.19.0 and pnpm 11.19.0. Role experiments remain outside the production artifact.
- Theatre.js stays the authored-motion core through the application-owned adapter. Keep real versioned Studio exports and provenance; Studio is local authoring only. No invented timeline JSON or claim of authoring.
- Give each camera/property one writer. Direct inspection can own a separate nested transform or take explicit ownership after playback stops. Keep per-frame values outside React state; stop/dispose inactive stages.
- Navigation, reading, selection, comparison, downloads and reset remain usable without animation, WebGL or commands. Provide visible focus, keyboard/touch controls, reduced-motion states and useful failure explanations.
- Keep asset revisions, original licenses/notices, checksums and retrieval evidence. Identify approximation and prototype limitations; public research examples do not establish professional credentials or engineering validation.
- UIUX skills, MCP settings, runtime, assets and tests remain in `roles/uiux-designer/`. Future roles use sibling directories, distinct configuration/runtime homes and review-state keys. Root/global registration is not implied.

## Verification record and limits

This plan consolidates existing results; it does not claim the suites were rerun merely to write this document. The [verification record](verification/README.md) and its structured JSON files retain the actual checks:

- Round 04: 114 material/motion/browser checks plus six final focused ASCII rechecks; Chromium, WebKit and Pixel 7 Chromium emulation. Gallery regression records 78 specimen visits; connected-feature regression records 31 grouped flows.
- Existing role build, lint, asset validation and actual Studio-export replay checks passed. Previous root `pnpm check` and nine existing browser flows passed against the empty `out/` artifact.
- Physical phones, Firefox for this role collection, comprehensive screen-reader/WCAG review, field INP, measured GPU memory/power and production optimization remain unverified. Emulation is not device testing. Existing test fixtures do not verify the owner's Saved selections.

The portfolio remains empty. Private preparation material, CV, contact information and professional case-study content have not been imported or published by this exploration. Earlier approval of three identity strings does not override the subsequent withdrawal of portfolio implementation.

## Handoff to 3D Artist

The next session owns public-source research and local proposals for materials, light/shadow, refraction/diffusion, physics, particles and cameras. [Its session brief](../3d-artist/SESSION_BRIEF.md) carries the shared constraints and review format. UIUX contributes stable reading/navigation and the preference authority above; the 3D role develops independent visual specimens and records its own decisions. Neither role is automatically activated by the other's configuration.
