# 0008 — Viewport scene holds and an independent page field

Date: 9 October 2026. Supersedes decision 0007's visible card, local aperture and information-anchor docking. Scope remains the owner-authorized public Bending-Active presentation.

The owner rejected Round 09's visual result and selected Round 08 as the presentation target. The requested scene should retain its cinematic scale, remain still in screen space through a chapter interval and transition at the boundary. Information may move independently; ASCII need not share the 3D Canvas. The owner also supplied Safari repeated-page-failure screenshots and identified an iPhone 14 Pro Max that fails after sustained use.

## Decision

One retained WebGL scene has a borderless viewport-sized CSS presentation. Its backing storage remains subject to a physical pixel budget. Opening and ending use the earlier authored viewport camera; source comparisons fit exact verified support inside fixed authored screen regions. Those regions follow the 780px stacked-layout breakpoint, so a tall two-column tablet does not center its source behind text. Compact split layouts reserve clearance from the chapter rail, and short landscape viewports expose all seven 44px navigation targets in a horizontal rail. Information rectangles do not crop or resize that camera. No geometry, source colour, asset or factual content changes are introduced.

The existing controller measures natural chapter boundaries. A scene probe at 62% viewport height defines a separate entry, exact hold and exit; the information reading probe and native navigation keep their own semantics. During a hold the stage is exactly x=0, y=0, scale=1. Entry and exit translate and fade reversibly without changing logical or backing size. MAKE and VALIDATION submit no 3D frames. One shared active clock continues the appropriate information and decorative effects. Explicit source selection can request the corresponding scene while its information chapter is active.

Independent decorative ASCII uses one bounded 2D Canvas above the scene and below readable HTML. It has no timer or RAF: the controller supplies time, pointer and chapter cues. Its existing RAF timestamp caps drawing at 30Hz independently of accelerated animation time. An atlas retains the original analytic glyph shapes; copper display colour and restrained opacity were reviewed against actual earlier captures. The layer does not claim scene-depth attenuation. Genuine scene-radiance/depth glyph response remains in the WebGL compositor. This creates two mounted canvases but only one WebGL context.

Source controls remain in document flow. Delegated pointer routing accepts exact visible source-mesh hits outside those controls while excluding links, protected reading planes and native controls. Keyboard comparison and native touch scrolling remain available.

## Sustained mobile operation

Touch and iOS render profiles cap Full at 520,000 physical pixels and Light at 360,000, disable multisample attachments and use a 512px contact shadow. Full materials, lighting and black-mist optics remain. Desktop budgets remain 1.6M/1.2M pixels. On coarse pointers, available-height changes at fixed width do not resize the drawing surface; width/orientation changes update it. The existing allocation guard checks intermediate native size assignments, and sustained slow frames may reduce density further.

The preflight throwaway WebGL context is removed. A session lease provides best-effort interrupted-session recovery: a recent unfinished active lease suppresses automatic startup, and a known failure remains manual for the session until explicit activation. HTML reading and approved poster/source evidence remain available. A lease is not a browser crash detector; storage can be unavailable or discarded. A failed optional 2D layer cannot stop the reading controller.

## Acceptance and publication

The [twelve-role direction](../../roles/experience-director/research/ROUND_10_DIRECTION.md), [scene review](../../roles/3d-artist/research/ROUND_10_SCENE_DIRECTION.md), [runtime review](../../roles/software-architect/research/ROUND_10_RUNTIME_REVIEW.md) and [verification](../../roles/uiux-designer/cases/bending-active-thesis/ROUND_10_VERIFICATION.md) identify evidence and limits. Rendered comparisons use the exact Round 08 tested artifact. Windows WebKit is not the owner's physical iPhone, and neither resource estimates nor synthetic context loss prove the cause or resolution of whole-process Safari failure.

Categorized commits, push and publication are explicitly authorized. Deployment still requires all same-SHA push CI jobs, then consumes their tested `static-export-pages` artifact without rebuilding. The reusable empty framework and generated entry routes remain separate.
