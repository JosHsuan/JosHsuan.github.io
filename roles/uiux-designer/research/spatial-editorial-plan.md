# Round 03 — a spatial editorial system

## Brief and scope

The owner likes Spatial feedback, has saved preferences, and asks to extend its concepts into a website design approach and further feature proposals. Build a connected local feature prototype inside this role. Use existing original studies as honest demonstration content; do not create fictional professional projects or publish the portfolio.

The current browser connector could not initialize, and no `uiux-discussion-choices*.json` export was found in Downloads or Desktop. The owner clarified that the items marked Saved are the preferences. Do not ask the owner to transcribe them or guess individual selections: the feature prototype reads the existing `uiux-material-review-v1` key at the same loopback origin and shows its exact basis. Automated verification uses a clearly labeled synthetic fixture, not the owner's browser. A saved preference is neither publication approval nor a universal requirement to animate everything.

## Design hypothesis

Depth encodes a relationship, not importance by spectacle. **Approach** means available; **advance** means selected; **separate** means inspect; **align** means compare; **return** means undo or close. The reading plane stays still. Functional outcomes happen immediately. This vocabulary should survive across navigation, media, filters, annotations and parameter tools.

Use the site's proposed FORM / SYSTEM / MAKE vocabulary as three perspectives on an actual original study: shape, rule and making logic. Professional role, claims, attribution and results remain absent until supplied and approved. The prototype's reader explicitly explains the generated study and its limitations.

## Compact system

- Color: graphite `#0b0d10`, raised surface `#14181d`, drawing surface `#23313c`, paper `#f2f0ea`, secondary text `#a7adb5`, interaction orange `#ff7a45`.
- Type: existing local Plex Sans for reading and display; Plex Mono for parameters and source labels. Body 16–18 px, captions 13–14 px, prose around 66ch.
- Layout: an editorial table of contents leads to a broad visual index, a two-column method reader, an aligned comparison table and a working geometry instrument. Navigation, headings and captions align to one shared content edge. On phones the visual follows the heading and all controls wrap into the normal flow.
- Motion: stable hit regions; local pivots; precise settle for navigation/controls; bounded depth for inspectable media; explicit Theatre playback for the main geometric score. No per-frame React state, no global page tilt or scroll hijacking.
- Preference: show saved choices, allow Flat/System/Reduce, and reuse local storage only in this role. Never silently convert a discussion preference into publication approval.

## Planned feature proposals

| Feature | Useful outcome | Spatial interpretation | Ordinary alternative |
|---|---|---|---|
| Study index | Search/filter real local studies, choose one, preserve selection | Selected cover advances; other covers remain in the index plane | Labeled links, native search and buttons |
| Method reader | Read the chosen study's purpose, mechanism and limitations | Stable text plus a selectable figure and depth-aware chapter location | Native section anchors; all chapters remain readable |
| Media inspection | Inspect a real captured image, zoom/reset and see its source | Image leaves the index plane for an inspection plane; caption stays attached | Native dialog, keyboard controls, Escape and focus return |
| Comparison tray | Select two studies and compare the same criteria | Items align in one plane; no competing animated canvases | Semantic table; narrow-layout horizontal region |
| Geometry workbench | Alter an actual rib arrangement, select parts, undo/redo, export current geometry | Geometry responds to the parameter; selected part separates locally | Numbered controls, native range, SVG diagram and real SVG/JSON download |
| Shared command surface | Perform the same actions as visible controls | A secondary overlay with explicit action outcomes | Every action remains available without commands |

## Pre-build critique

The first impulse was another grid of animated samples. That would repeat Round 02 and fail to show transfer across tasks. Use a connected feature page with a reading sequence, an index that opens the reader, a tray that follows selection, and a workbench that shares the same generated object. The materials are real UI studies, so call the browse feature **Study index** rather than pretending it is a populated Work portfolio. Keep the drawing as the expressive focal point; suppress repetitive entrance animations and decorative status text.

## Verification intent

Check saved-basis reading without modifying the original choices; selection/search/filter and empty state; direct anchors/reload/back; dialog focus and zoom; two-item comparison; actual parameter/part effects and undo/redo; downloaded SVG/JSON contents; command outcomes; keyboard/touch/reduced motion; widths 320/390/768/1440; failed WebGL fallback and single-canvas disposal if enabled. Distinguish browser emulation from real hardware. Reuse the pinned stack and source/Studio records.
