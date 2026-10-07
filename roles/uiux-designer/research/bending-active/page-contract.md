# Bending-Active Thesis — local case-study contract

Date: 7 October 2026. Role: **UI/UX Designer**. Scope: the owner's newly requested local Bending-Active Thesis interactive work page. This is implementation guidance for that request, not publication approval and not a change to the existing UIUX review desk.

## Authority and present evidence

The current owner request authorizes a project-specific local page and relevant material preparation. Repository architecture continues to govern software boundaries; the project preparation pack governs claims and attribution. Source records must be read before filling factual fields. Source originals and private preparation indexes do not become browser content.

The owner's Saved choices remain authoritative but have not been captured. Candidate relationships below come from the explicit design brief and the existing role research; they are not claimed to be observed Saved choices. Do not reset or write `uiux-material-review-v1` from this page.

Source access was subsequently authorized explicitly and succeeded. The correct project is the metal-panel thesis, distinct from the later bamboo MoCap/XR work. Reviewed factual copy lives in the ignored local case snapshot, and exact source/media provenance lives in `source-review.private.md`. Do not infer missing dates, physical performance or authorship from visual appearance.

## Page proposition

Let the reader understand the relationship between the final form, the design method and the physical evidence while inspecting the actual supplied model. Lead with a strong view of the complete work and a precise research question. Keep all explanation in HTML. One optional scene follows the reading progress and can change representation without changing its camera framing.

The visual composition should be an editorial case study rather than a review dashboard: large title, quiet project metadata, one large model image, strong section rhythm and substantial source images. Keep technical diagnostics and the research comparison catalog outside the main reading path.

## Information hierarchy

| Order / anchor | Reader's question | Required content and media | Interaction |
| --- | --- | --- | --- |
| Opening / `#overview` | What is this work? | Verified title, project type/status, one concise summary, supported period/institution, real hero poster and descriptive caption. A small local-review status label is sufficient. | Visible `Read the study` and `Explore the model` actions; essential facts are already visible. |
| Contribution / `#contribution` | What did JosHsuan contribute? | Supported personal tasks separated from collaborators' and collective outcomes. Credits have their own fields. | Ordinary anchor navigation. No animated credential claims. |
| FORM / `#form` | What form is being investigated? | Research context, constraints and the actual final geometry. Explain what the viewer is looking at before introducing technical representations. | Optional scene, wide framing. Material representation first. |
| SYSTEM / `#system` | How are inputs and design decisions connected? | A source-grounded workflow diagram; supported tools; a small number of meaningful steps; actual drawings or computational evidence. Distinguish original research tools from the new website viewer. | Same scene and same geometry, side framing. Contours or component focus can clarify geometry; explanatory captions name the exact operation. |
| MAKE / `#make` | What was made or tested? | Approved-for-local-review prototype/fabrication images and captions grounded in the source. If no fabrication evidence is available, use a truthful `Model and evidence` heading rather than inventing a build. | Nearer inspection of identifiable geometry; linked real photograph/drawing remains in HTML. |
| Validation / `#validation` | What does the evidence demonstrate? | Method, units, conditions and provenance for any actual result; uncertainties and limitations. Keep geometric display distinct from structural validation. | A compact comparison only when both compared records actually exist. |
| Credits / `#credits` | Who and what support the work? | Verified team/individual attribution, media credits and usable external links. Public approval status is separate from local display authorization. | Source links and a back-to-top link. No guessed CV/contact destination. |

Omit unsupported metadata rather than showing placeholder claims. Do not pad thin evidence with generic project prose. A missing essential section is a content issue to resolve from the project pack, not an invitation to fabricate it.

## Composition and responsive states

- **Desktop, approximately 1200 px and wider:** a compact top navigation; title over 5 columns and model poster over 7; then a long reading region with 5 columns of narrative and 7 columns of one sticky scene. Give evidence images occasional full-width placement. Keep prose near 60–75 characters per line.
- **Tablet:** reduce title scale and use a roughly even reading/scene split only while it leaves useful prose width. Otherwise use the mobile order.
- **Mobile:** title and summary, metadata, real poster, then normal stacked sections and images. The model opens inline only after activation. Keep its height bounded, with no full-screen takeover or vertical touch capture. The document remains scrollable beside and over the visual region.
- **No JavaScript / unavailable WebGL / failed scene:** all headings, text, captions, stills and anchors remain. Replace only the scene region with a real poster and concise state explanation.
- **Reduced motion:** use a stable pose for the current chapter and immediate representation changes. Remove camera interpolation, parallax and diffusion transitions. Keep the same content and actions.

Use graphite, off-white, restrained grays and industrial orange for interaction state. The object's natural material colors are separate from the interface accent. Reuse an already licensed font or system fallback. Preserve readable focus rings, 44 px practical targets and non-color selection cues.

## Single continuous input

The case-study page defaults to **native document scroll** as its only continuous parameter. It does not register wheel interception, artificial momentum, forced snapping or scroll lock. Pointer movement does not change the model simultaneously. A pointer-driven material comparison belongs in the separate 3D Artist research desk, where its input mode is explicit.

Compute one normalized `u` from the live reading anchors, clamp it to `[0, 1]` and share it with the camera and material adapters. A resize recomputes anchor positions. Anchor links, keyboard scrolling and touch scrolling therefore reach the same state without a second parameter model.

| Reading beat | Suggested `u` range | Camera purpose | Representation purpose |
| --- | --- | --- | --- |
| FORM | 0.00–0.30 | Establish the complete bounding volume and silhouette. | Restrained material, legible overall shape. |
| SYSTEM | 0.30–0.70 | Side/grazing view that exposes curvature and spacing. | Contours or component focus, explicitly geometric. |
| MAKE | 0.70–1.00 | Inspect a verified target or a closer whole-form composition. | Material/part detail compared with actual source evidence. |

These ranges are an initial implementation contract, not a prescribed reading duration. Real section lengths and converted geometry should determine final pacing. A final-state model alone does not prove an assembly sequence, undeformed state, toolpath or physically correct bending animation.

Discrete actions are `Explore model`, `Material`, `Contours`, `Edges`, `Static view` and `Reset view`. The inspected conversion has no established semantic panel grouping, so do not expose a `Parts` or assembly-sequence claim. These are ordinary reading/view actions, not additional continuous parameter controls. Reset returns to the current chapter's prescribed view and material. If inspection controls take ownership, explicitly suspend the story camera; returning to story restores its current scroll pose.

## Integration with previous UIUX work

| Candidate basis | Application | Stable element |
| --- | --- | --- |
| `feedback-navigation`, method reader | Reading progress and section links | Hit regions, labels and the text plane |
| `feedback-panel`, `feedback-type` | Reveal technical explanation adjacent to evidence | Body-copy position and native document flow |
| `feedback-card`, media inspection | Open actual drawings/photos in a native dialog with caption and focus return | Image credit and keyboard close action |
| `feedback-assembly`, geometry workbench | Focus a verified component group in the actual model | Source identity and honest geometry description |
| `feedback-key`, shared actions | Clear representation and reset actions | Visible action text and same state contract |

Use the vocabulary **advance to select, separate to inspect, align to compare, return to undo** only where the operation is real. In this case, a visual separation must be labelled an inspection arrangement unless an actual assembly sequence is supplied. Avoid adding a command palette merely to demonstrate a past specimen.

## Data and implementation handoff

The local page should consume an explicit reviewed snapshot with a narrow typed shape: title, summary, status, supported metadata, contributions, narrative sections, media descriptors, credits, limitations and scene reference. Each selected image has a caption, alt text and a private provenance record outside browser payloads. Each scene derivative has a revision/hash, units/scale convention, coordinate conversion, bounds, meaningful part IDs where recoverable, and a conversion report.

The scene loads only after user activation, uses one active canvas and a bounded DPR, and stops rendering when unchanged or offscreen. Per-frame values stay outside React state. Camera ownership remains singular. Theatre imports remain under the role/application motion boundary; deterministic scroll camera math must not be described as a newly authored Theatre export.

Do not deliver the raw `.3dm`, original directory paths, SQL, draft documents, review records or the full private asset manifest to the browser. A local development conversion step can produce selected sanitized derivatives; ordinary builds must remain independent of private-drive availability.

## Review checks

1. At a fresh URL and with JavaScript disabled, the study communicates its purpose, contribution, evidence and limitations.
2. At desktop, tablet and narrow mobile widths, text remains readable, no control falls outside the viewport, and the model is not required for navigation.
3. Wheel, touch and keyboard use native scrolling and produce equivalent chapter/scene progress; moving the pointer does not introduce an additional camera input.
4. Material/contour/part changes preserve camera framing and current progress. Same-state screenshots can compare representations honestly.
5. The actual supplied model derivative matches its conversion report and poster. Rendered geometry is not a substitute model.
6. Scene activation, failure, context loss, reset, rapid scrolling and reduced motion retain readable content and recover predictably.
7. Source-backed claims and media credits are checked individually. Numerical analysis appears only with actual result data and units.
8. Local review, public approval and deployment remain distinct. This page has no publication action.

## Role discussion and missing capabilities

UIUX owns reading hierarchy, controls and accessibility; 3D Artist owns material/texture/shader readability; Animation Cinematographer owns shot purpose and the sole camera adapter; implementation owns the reviewed snapshot and lifecycle integration.

A **Geometry / CAD Pipeline** specialist is justified if conversion must interpret Rhino object types, units, tessellation, part hierarchy and web geometry budgets. This is a concrete gap beyond visual materials or camera design. That role should have isolated local tools, read-only source access, sanitized derivative output, numerical conversion checks and no implied structural-engineering authority. It does not need global MCP registration or a live browser CAD solver.

An additional generic art-director role is not currently justified: the supplied design brief and the three existing roles cover visual review. A structural-analysis role is needed only if the chosen interaction actually claims physical prediction, which this page does not require.
