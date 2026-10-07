# Website Design Guidelines
## JosHsuan Chao — Computational Design / Design Technology / Digital Fabrication

**Version:** 1.0  
**Audience:** Codex and other implementation agents  
**Purpose:** A build-ready creative direction and design contract for an interactive personal portfolio.  
**Core concept:** **DESIGN → SYSTEM → FABRICATION**

This document translates the portfolio proposal into implementation rules. It is not a request to copy a reference website, build a fictional engineering platform, or maximize visual effects. The result must be a maintainable personal website whose content and working interactions demonstrate the owner's capabilities.

Read this alongside the latest project architecture document and the existing repository. This file governs presentation, content hierarchy, interaction behavior, and visual acceptance. The architecture document governs dependency choices, delivery, and integration. Do not silently replace the agreed stack or rewrite a working foundation to satisfy an aesthetic preference.

---

## 1. Positioning and priorities

### 1.1 Professional narrative

The owner is a **Computational Design Lead** extending an established practice in computational geometry, digital fabrication, and design-to-fabrication workflows toward **Design Technology Development**.

The site should communicate:

> I design systems that connect geometry, computation and fabrication.

The intended impression is not “a designer experimenting with website effects.” It is:

> A computational design professional who understands physical production and can translate that knowledge into useful software and interactive systems.

Retain the current professional title. Demonstrate developer capability through working tools, implementation evidence, and transparent case studies rather than claiming an unconfirmed job title or level of expertise.

### 1.2 Audience and reading paths

Support three equally legitimate visits:

| Visitor | Immediate need | Reading path |
| --- | --- | --- |
| Hiring manager or recruiter | Understand the person, role, selected work, and contact options | Home → selected project → About / CV |
| Technical reviewer | Inspect implementation, computational logic, and actual contribution | Work or Lab → interactive demo → technical notes / approved code |
| Researcher or collaborator | Understand the problem, method, physical evidence, and collaboration potential | Case study → validation → contact |

Visitors must never need to operate a 3D scene, type a command, or complete an animation to access essential information.

### 1.3 Priority order

When requirements compete, preserve this order:

1. Accurate content, attributable contributions, and confidentiality.
2. Readability, accessibility, and direct navigation.
3. Working demonstrations and technical credibility.
4. Visual identity and cinematic presentation.
5. Decorative effects and experimental extras.

A smaller, coherent site with one excellent interactive demonstration is preferable to a large collection of unfinished effects.

---

## 2. Reference translation: borrow principles, not appearances

The references below define complementary roles. Do not mix all their surface aesthetics into every screen. They are creative references from the concept discussion, not templates or evidence of particular software versions.

| Reference | Principle to translate | Application here | Avoid |
| --- | --- | --- | --- |
| [Lusion](https://lusion.co/) | Realtime 3D as an integrated experience | A computational object that helps explain design-to-fabrication logic | Copying its compositions, assets, transitions, or unrelated abstract effects |
| [Lusion Labs](https://labs.lusion.co/) | Experimentation as a visible part of a practice | A dedicated Lab containing small, functional technical experiments | Presenting decorative sketches as production software |
| [Love, Death & Robots](https://www.netflix.com/tudum/love-death-robots) | Anthology structure: different episodes within a recognizable identity | Distinct project openings within a consistent case-study framework | Copying its logo, title sequence, symbols, characters, or defaulting to neon cyberpunk |
| [Bruno Simon](https://bruno-simon.com/) | The portfolio itself as evidence of development ability | Real interaction, robust state, considered performance, and implementation notes | Making game-like exploration the only navigation |
| [Active Theory](https://activetheory.net/) | Connect technical exploration with meaningful experiences | Explain how tools and workflows produce an outcome | Showing spectacle without explaining the system or contribution |
| [FutureDeluxe](https://futuredeluxe.com/) | Deliberate material, lighting, and motion direction | Treat geometry and fabrication artifacts as carefully staged subjects | Generic science-fiction imagery unrelated to the work |
| ManvsMachine | Precision in the presentation of engineered objects and materials | Reveal laminations, joints, assembly, and manufacturing logic | Treating technical objects as interchangeable product advertisements |
| [Aristide Benoist](https://aristidebenoist.com/) | Strong typographic hierarchy and clear project attribution | Legible indexes, roles, metadata, and project credits | Concealing information behind excessive transitions |

**Synthesis:** Lusion supplies spatial ambition; Labs supplies the experimental section; the anthology concept supplies project identity; terminal and ASCII supply a secondary technical language; the owner's real fabrication work supplies the substance.

---

## 3. Brand and content identity

### 3.1 Primary identity

Use **JosHsuan Chao** as the primary name unless supplied brand assets specify another approved presentation.

Suggested homepage copy:

```text
JOSHSUAN CHAO
Computational Design Lead

I design systems that connect
geometry, computation and fabrication.

Design Technology / Computational Systems / Digital Fabrication
```

Keep “View selected work” and “Explore the lab” visible as conventional links. Make CV and contact reachable without opening the command interface.

This copy is a proposed presentation, not permission to invent accomplishments, clients, employment details, availability, or qualifications.

### 3.2 Shared identity: FORM / SYSTEM / MAKE

Develop three original, simple glyphs for:

- **FORM:** geometry, spatial intent, material expression.
- **SYSTEM:** computation, logic, automation, interfaces.
- **MAKE:** manufacturing, assembly, physical validation.

Use them consistently in project headers and transitions. Include readable labels; glyphs must not be the only means of identification. Do not reuse the Love, Death & Robots symbols.

These are thematic categories, not numerical skill ratings. Avoid arbitrary dots, percentages, or scores that imply measured proficiency.

### 3.3 Editorial voice

Use specific, direct English. Prefer “Developed a geometry-processing pipeline for…” over “Pushing the boundaries of innovation.” Explain what was built, why it mattered, and what the owner actually did.

Distinguish clearly between **professional work**, **research**, **independent experiments**, and **proposed concepts**. Do not present an experiment as a deployed product.

---

## 4. Information architecture

Keep the top-level navigation small and explicit:

```text
Home    Work    Lab    About

Secondary links: CV / GitHub / LinkedIn / Contact
```

Use **Work** for navigation clarity. The editorial section heading may be **Selected Systems**.

Logical routes:

```text
/
/work/
/work/[slug]/
/lab/
/lab/[slug]/
/about/
```

The exact routing implementation must respect the existing framework and deployment configuration. Each published project and experiment needs a direct, shareable URL that works on a fresh load, not only after client-side navigation.

### Section responsibilities

| Section | Purpose | Required content |
| --- | --- | --- |
| Home | Establish identity and introduce the work | Positioning, one meaningful visual, selected work, Lab preview, contact path |
| Work | Present substantial professional and research projects | Clear titles, category, role, status, concise descriptions |
| Case study | Explain the problem, system, contribution, and evidence | Context, constraints, method, implementation, validation, credits |
| Lab | Prove technical curiosity through working prototypes | Small interactive experiments with limitations and implementation notes |
| About | Connect experience, skills, and career direction | Verified biography, capabilities, selected experience, CV, contact |

Do not add a blog, CMS, user accounts, store, or complex filtering system without a demonstrated content requirement.

---

## 5. Visual design system

### 5.1 Overall character

Aim for **cinematic engineering editorial**: carefully staged technical objects, confident typography, quiet surfaces, and precise information.

The site should feel closer to an interactive design-technology publication and working instrument than a game, hacker terminal, conventional architecture gallery, or generic SaaS landing page.

Avoid default dashboard card grids, decorative gradient blobs, endless marquees, skill progress bars, excessive rounded containers, and unmotivated particles.

### 5.2 Proposed default palette

Implement colors through centralized semantic tokens. The following is the proposed starting theme, not a claim that every pairing meets accessibility requirements:

```css
:root {
  --color-bg: #0b0d10;
  --color-surface: #14181d;
  --color-text: #f2f0ea;
  --color-text-muted: #a7adb5;
  --color-border: #2b3036;
  --color-accent: #ff7a45;
}
```

Use graphite, off-white, and restrained gray as the foundation. Use **industrial orange as the single interface accent** for selected states, focus, or emphasis. Validate actual text, control, and focus-indicator contrast before release.

Natural material colors and necessary data-visualization palettes are exceptions, not additional brand accents. Analysis colors require a legend and an explanation of the underlying data.

Avoid simultaneous neon cyan, purple, green, and red; Matrix-style green text; and constant glitch effects.

### 5.3 Typography

Use two roles:

| Role | Treatment |
| --- | --- |
| Editorial headings and body | A clean grotesk or system sans-serif |
| Metadata, commands, coordinates, technical labels | A legible monospace |

Use licensed fonts already available to the project or system fallbacks. Do not acquire, redistribute, or assume rights to reference-site fonts.

Start with 16–18 px body text, 13–14 px secondary metadata, and responsive display headings. Avoid compressing or stretching text to fit. Keep prose near 60–75 characters per line and maintain a consistent hierarchy across projects.

Do not set the entire site in monospace. Uppercase is suitable for short labels, not long paragraphs.

### 5.4 Layout and responsive behavior

Use a shared spacing scale, aligned columns, and generous negative space. A practical starting point is a 12-column desktop grid, a simplified tablet grid, and a single primary reading column on mobile. Keep overall content around a 1440 px maximum width, with narrower prose.

On desktop, the hero can pair an editorial text block with a large spatial object. On mobile, prioritize identity and links before the visual. Do not force desktop composition into a smaller viewport.

Full-bleed media may punctuate a case study, but surrounding headings, captions, and metadata must retain alignment. Do not make every section occupy a full screen.

---

## 6. Home: composition and behavior

### 6.1 Opening state

Render real text and navigation immediately. A boot-style status line may appear inside the visual region during genuine initialization, but it must not gate the page or impose an artificial delay.

Do not add a mandatory black loading screen, fake progress percentages, or a theatrical “GPU READY” message before readiness has been established.

### 6.2 Hero object

Use **one coherent computational object**, not a collection of unrelated 3D decorations.

Preferred subject: an original procedural shell or segmented assembly that expresses material layers, geometric rules, and fabrication logic. Approved real project geometry may replace it when publication rights and asset suitability are confirmed.

The object should support a small number of intelligible representations:

```text
Surface → Structure / Wireframe → Components → Toolpath
```

Only expose modes that actually exist. These views should derive from the same source geometry or explicitly associated datasets; they must not be unrelated models masquerading as a continuous process.

A useful default interaction:

- A clearly labeled selector changes representation.
- A bounded control changes one real geometric parameter.
- A caption explains what the parameter changes.
- Reset restores a predictable initial state.

These are explicit controls, not hidden cursor tricks. Pointer movement may add subtle parallax, but must not unpredictably switch modes, alter parameters, or interfere with reading.

**Important:** “Structure” must not imply live structural analysis. Label a wireframe as a wireframe, illustrative stress colors as illustrative, and imported engineering results as precomputed results with their provenance.

### 6.3 Below the hero

Recommended sequence:

```text
Identity + computational object
↓
Selected Systems: a small number of strong projects
↓
Lab: preview of functional experiments
↓
Brief professional introduction
↓
CV / contact / external profiles
```

Use project titles and one-sentence descriptions that remain visible without hover. Rich previews may enhance the index, but static thumbnails must work for keyboard, touch, and reduced-motion use.

---

## 7. Work: case studies as technical narratives

### 7.1 Project selection and publication boundaries

Candidate topics from the proposal include the BMW seat work, Woodflow-related systems, XR design review, and robotic fabrication workflows. These are **candidates, not automatically approved public content**.

Do not publish employer-owned geometry, internal screenshots, customer logos, manufacturing settings, commercial information, unpublished research, or code without explicit approval. Do not assume that a recognizable project name grants permission to disclose its details.

Use an independently created demonstrator when real data cannot be shared, and label that demonstrator accurately.

### 7.2 Shared case-study structure

Each project may have its own opening composition, material treatment, and motion sequence. Its reading structure must remain familiar:

| Section | Question to answer |
| --- | --- |
| Overview | What is the project, its context, and current status? |
| My role | What did the owner personally lead, develop, design, or coordinate? |
| Problem and constraints | What made the task difficult or meaningful? |
| System / workflow | How do inputs, rules, tools, and outputs connect? |
| Design logic | What computational decisions or geometry rules matter? |
| Implementation | What was built, and where does automation or software enter? |
| Fabrication / deployment | How did the system reach physical production or practical use? |
| Validation | What testing, comparison, prototype, or user evidence exists? |
| Results and limitations | What is demonstrated, and what remains unresolved? |
| Credits and links | Who contributed, and which materials can be inspected publicly? |

Adapt headings to the project. Do not invent a fabrication section for a software-only experiment or imply that every project used every tool.

### 7.3 Anthology treatment

An optional header may use:

```text
PROJECT 01
FORM / SYSTEM / MAKE

PROJECT TITLE
A concise statement of the system or problem.
```

Use an original title treatment rather than recreating a television title sequence. Shared navigation, metadata, typography, focus behavior, and content order must survive the change in project atmosphere.

Keep introductions brief and skippable. No mandatory soundtrack, autoplay narration, or scroll-locked opening.

### 7.4 Technical evidence

Where available, show an actual workflow diagram, annotated prototype, model interaction, relevant code excerpt, measured result, or test comparison.

For numerical results, identify the source, units, test conditions, and limitations. Never invent efficiency improvements or project outcomes.

Keep **individual contribution** separate from **team outcome**. List technologies used in that project, not the owner's entire skill inventory. Label website reconstructions separately from tools used in the original work.

---

## 8. Lab: small tools that actually work

The Lab is the clearest bridge from computational design toward design technology development. Its purpose is to let a visitor use a small system, not merely watch a visual effect.

### 8.1 First-release experiment

Start with **one polished procedural panelization or assembly explorer**. It can share the hero's geometry core while providing a deeper interface on its own route.

Suggested input/output contract:

```text
Input: bounded panel count, curvature, or spacing
Process: deterministic geometry generation
Output: updated components and actual component count
Views: surface / wireframe / components
Actions: reset; optional export only when a real exporter exists
```

Choose a simple model whose relationships are valid. Do not claim manufacturing readiness, structural adequacy, or a full CAD kernel unless those capabilities have actually been implemented and validated.

### 8.2 Experiment backlog

Possible later experiments include a toolpath visualizer, robot-path sequencer, assembly viewer, mesh-to-ASCII renderer, material-aware geometry generator, or model viewer using an appropriate supported format.

These are a backlog, not a requirement to install every corresponding library or build every experiment in the first release.

### 8.3 Experiment page contract

Every published experiment must include:

- A one-sentence purpose and a clearly labeled working interaction.
- A small, discoverable control surface and a reset action.
- An explanation of inputs, outputs, and limitations.
- Status and relevant implementation details; a repository link only when real and public.
- Loading, error, unsupported-device, and non-WebGL presentation states.

Separate **Prototype**, **Research**, and **Production** status. Explain which computation runs in the browser, which data is precomputed, and which visualizations are illustrative.

A hidden or disabled feature is preferable to a fake export button, fictional analysis result, or broken repository link.

---

## 9. Terminal, ASCII, and system status

### 9.1 Command interface: a secondary control surface

Provide ordinary navigation first. A compact “Commands” button may open a command palette or terminal-inspired overlay. Support `/` as an optional shortcut and `Escape` to close.

Do not intercept `/` while the user is typing in an input, textarea, editable element, or an active text-composition session. Keyboard focus must enter the dialog, remain appropriately contained, and return to the opener when it closes.

Suggested allowlisted commands:

```text
help
work
lab
about
cv
contact
view surface
view wireframe
view components
view toolpath
inspect
reset
```

Navigation commands invoke the same routes as standard links. View commands manipulate the same scene state as visible controls. Context-dependent commands must report unavailability clearly rather than pretending to succeed.

Display discoverable command suggestions. Do not require visitors to memorize syntax. This is a website interface, **not an executable shell**: never evaluate arbitrary input, expose environment variables, or execute system commands.

### 9.2 ASCII: a limited representation

Use ASCII for a real rendering experiment, an optional representation change, or a small loading/status motif. It should relate to the object's geometry or the action being performed.

Do not turn body copy, navigation, or essential controls into ASCII. Disable decorative transitions in reduced-motion mode. Decorative ASCII should be hidden from assistive technologies; meaningful visualizations need an equivalent description.

### 9.3 Status overlay

A quiet status label may show the current asset, representation, and data type:

```text
ASSET  Procedural demonstrator
VIEW   Components
DATA   Generated geometry
```

FPS and renderer details belong in an optional diagnostics view and must come from runtime measurements. Never display fabricated “60 FPS,” “WebGPU,” or “simulation complete” labels.

Do not let diagnostics dominate the composition or distract from the work.

---

## 10. Interaction and motion rules

### 10.1 Motion must explain something

Use animation to reveal assembly, relate representations, guide attention, or establish a project opening. Prefer a few authored sequences over continuous movement everywhere.

Starting ranges for design tuning:

| Motion type | Proposed range / behavior |
| --- | --- |
| Button and focus-related feedback | Immediate state response; subtle visual transition around 120–180 ms |
| Panels and small UI transitions | Approximately 180–300 ms |
| A meaningful scene transformation | Approximately 400–900 ms, interruptible where practical |
| Longer assembly demonstration | Explicitly initiated, with pause / replay / reset controls |

These are design targets, not reasons to delay interaction or content rendering.

### 10.2 One owner per animated property

Do not let Theatre.js, GSAP, React Spring, pointer handlers, and scene controls write to the same transform independently.

Define property ownership. For example:

```text
story group       ← Theatre-authored sequence
  interaction group ← user orbit / inspection
    model             ← geometry state
```

Equivalent structures are acceptable when ownership remains explicit. Reset must restore both scene state and the relevant timeline state.

### 10.3 Scrolling and input

Preserve normal document scrolling. Avoid scroll hijacking, forced snap sequences, custom cursor dependence, and drag-only functionality.

Scroll-linked storytelling is optional enhancement. It must not trap the reader, consume the page's vertical touch gestures unexpectedly, or hide content when animation fails.

Provide visible controls for important camera or representation actions. Do not assume hover exists on mobile.

---

## 11. Technical alignment with the agreed architecture

These are project requirements carried forward from the architecture direction, not assertions that arbitrary package versions are compatible.

| Area | Direction |
| --- | --- |
| Application | Preserve the agreed Next.js / React / TypeScript foundation or the repository's explicitly approved equivalent |
| Realtime 3D | React Three Fiber with Three.js; use Drei selectively |
| Shared state | Zustand where multiple controls, routes, or scene components need coordinated state |
| Motion-design core | Keep Theatre.js Core for authored sequences through a thin, application-owned adapter |
| Motion authoring | Theatre Studio is development-only; export versioned motion state for runtime use |
| Integration | Do not make `@theatre/r3f` mandatory; isolate any integration selected by the architecture |
| DOM / scroll motion | GSAP only where the architecture calls for it; do not duplicate ownership of Theatre-controlled properties |
| Optional packages | Rapier, React Postprocessing, React Spring, UIKit, and WebGPU work require a specific demonstrated need |
| Validation | Use Playwright and available project test tools for routing, interactions, responsive behavior, and regressions |
| Delivery | Preserve static-export / GitHub Pages compatibility where specified by the existing architecture |

### 11.1 Architectural boundaries

Keep geometry logic, content, presentation, scene state, and motion integration separate. A conceptual separation is:

```text
content        project records, experiment records, approved copy
geometry       deterministic functions and domain data
scenes         rendering, cameras, lights, representation components
state          shared interaction state
motion         adapter, authored state, sequence contracts
ui             DOM navigation, controls, dialogs, metadata
```

Adapt this to the repository; do not reorganize it purely to match these names.

The same source of truth must drive visible controls, command actions, and scene representation. Avoid synchronizing multiple independent copies of a parameter.

### 11.2 Motion versioning

Commit authored motion exports and the dependency lockfile. Follow the architecture's exact-version policy and test upgrades on a branch. Keep stable object/property identifiers for authored sequences, and validate the runtime adapter against the exported state.

Do not ship the authoring editor, depend on an editor session or external authoring service at runtime, or select package versions solely from this document.

### 11.3 Browser and delivery limits

Do not assume Rhino, Grasshopper, a CAD kernel, or a structural solver exists in the browser. Use small browser-native geometry functions, approved precomputed data, or a separately scoped integration.

For static delivery, generate known detail routes, honor the deployment base path, use deployable assets, and avoid unplanned server-only features. Do not create a contact form that appears to send messages without a real approved service; a verified contact link is sufficient.

Use available Codex skills, MCP tools, or browser tools when useful. Inspect what is actually installed; do not claim an integration ran when it did not, or make the website runtime depend on development-only tooling.

---

## 12. Content and asset contract

Use structured content rather than scattering copy through scene components. Reuse the existing content system; adopt a minimal typed format when none exists.

### Case-study fields

```text
slug, title, summary, projectType, status
period, role, contribution, teamCredits
context, constraints, system, implementation
validation, outcomes, limitations
technologies
heroMedia, gallery, captions, altText
interactiveDemoReference
publicLinks
publicationApproval
```

Fields may be optional when inapplicable. Do not render empty sections or invent values to complete a schema. Dates, client names, project status, and links must come from verified supplied material.

### Asset requirements

Track attribution and publication permission. Each major visual needs a descriptive caption or alternative presentation. Prefer optimized, purpose-made web assets rather than raw production CAD exports.

Keep originals separate from web derivatives. Do not embed confidential metadata, internal URLs, credentials, or proprietary data in public asset files.

During development, clearly mark missing content. Before publication, replace it, remove the corresponding section, or keep the item unpublished. Placeholder client claims, dummy CV files, and fabricated project metrics are release blockers.

---

## 13. Accessibility, resilience, and performance

### 13.1 Accessible foundation

Target WCAG 2.2 AA and verify the relevant behavior rather than treating the label as proof of compliance.

Use semantic HTML, meaningful headings, visible keyboard focus, labeled controls, a skip link, adequate contrast, and touch targets designed around at least 44 × 44 CSS pixels where practical.

Respect `prefers-reduced-motion`. Remove nonessential autoplay, parallax, and representation transitions in that mode. Preserve meaningful final states and allow deliberate interaction without forced animation.

Canvas content must have a useful text explanation and DOM-based controls. Critical information must not exist solely in a shader, hover state, color, or 3D label.

### 13.2 Progressive enhancement

The hierarchy is:

```text
Readable HTML + links
        ↓
Poster / static media
        ↓
Interactive scene when supported and ready
        ↓
Optional visual enhancements
```

A scene failure must not blank the page. Provide a static poster, explanation, and access to the same case-study content after initialization errors, unsupported rendering, or context loss.

### 13.3 Performance strategy

Lazy-load heavy scene code and project assets. Do not load all Lab experiments on the homepage. Keep one active primary canvas as the default; pause or unmount offscreen experiences.

Use a capped device-pixel ratio, appropriate texture sizes, economical geometry, instancing where beneficial, and lower-cost quality modes. Render on demand when a scene is static and the selected scene architecture supports it.

Prefer lighting and material clarity over expensive postprocessing. Avoid per-frame React state updates for diagnostics. Dispose of route-specific GPU resources and prevent duplicated listeners or animation loops.

**Initial measurement targets, not guaranteed outcomes:**

| Measure | Target |
| --- | --- |
| Largest Contentful Paint | Aim for ≤ 2.5 s under a documented representative test profile |
| Interaction to Next Paint | Aim for ≤ 200 ms when field measurement is available |
| Cumulative Layout Shift | Aim for ≤ 0.1 |
| Desktop scene | Aim for a stable 60 FPS on the documented test device |
| Mobile / constrained device | Reduce quality; aim for stable interaction around 30 FPS or use the static experience |
| Idle scene | Avoid continuous rendering without a visual reason |

Record the test device, viewport, conditions, and observed results. Do not present a desktop lab run as proof of mobile behavior or production field performance.

---

## 14. Implementation sequence

Build in vertical slices so that visual ambition never outruns functioning content.

### Phase 0 — Inspect and establish the baseline

Read the repository instructions and architecture. Identify the current framework, deployment target, content, licensed assets, and available tooling. Record missing inputs and publication restrictions. Verify a minimal R3F scene and Theatre runtime integration before investing in complex choreography.

**Exit condition:** A working build, documented constraints, and a confirmed technical foundation.

### Phase 1 — Readable portfolio foundation

Implement the design tokens, responsive shell, navigation, Home, Work index, case-study template, Lab index, and About. Use static visual fallbacks first. Populate only approved supplied content; do not pad the site with fictional projects.

**Exit condition:** Essential information, routing, CV/contact behavior, and mobile reading work without WebGL.

### Phase 2 — One meaningful interactive system

Build the procedural hero and one deeper Lab page using shared geometry logic. Add representation switching, one genuine parameter control, reset, and failure handling. Integrate a restrained Theatre-authored sequence.

**Exit condition:** The visitor can change an input and observe a truthful, understandable output.

### Phase 3 — Identity and polish

Apply the FORM / SYSTEM / MAKE identity, project-specific openings, refined materials, and carefully owned motion. Add the command interface and a limited ASCII treatment only after standard controls are complete.

**Exit condition:** These additions improve character or understanding without becoming navigation requirements.

### Phase 4 — Release verification

Test responsive behavior, keyboard use, reduced motion, direct URLs, static deployment, asset loading, runtime errors, and performance. Remove placeholders and unsupported claims. Document remaining limitations.

**Exit condition:** All release-blocking items below pass.

---

## 15. Acceptance criteria

### Release-blocking checks

- [ ] The initial view identifies the owner, current role, and design-to-fabrication positioning.
- [ ] Work, Lab, About, CV, and contact are accessible through normal links; unavailable items are not presented as functioning links.
- [ ] Published content and assets have confirmed provenance and publication approval.
- [ ] Each published case study separates the owner's contribution from team results.
- [ ] No fabricated metrics, unsupported analysis claims, fake loading progress, or dummy functionality remains.
- [ ] At least one published Lab interaction performs the operation it claims to perform.
- [ ] Representation selectors, scene controls, and implemented commands share consistent state.
- [ ] Important information and navigation remain usable without an active WebGL scene.
- [ ] Keyboard navigation, focus return, contrast, control labels, and reduced-motion behavior have been checked.
- [ ] Mobile users can read and navigate without hover, drag-only actions, or scroll trapping.
- [ ] Direct loads and reloads of all published routes work on the actual deployment configuration.
- [ ] CV, profile, code, and contact links point to real approved destinations.
- [ ] No unhandled runtime errors, missing public assets, or accidental Studio/editor bundles remain.
- [ ] Build and relevant tests have actually been run; untested items are reported explicitly.

### Visual acceptance

- [ ] The computational object has an intelligible relationship to geometry, systems, or fabrication.
- [ ] Hierarchy and spacing remain coherent when the canvas is replaced by its poster.
- [ ] The interface uses the shared dark neutral palette and one controlled accent.
- [ ] Sans-serif editorial text and monospace technical metadata have distinct, consistent roles.
- [ ] Projects have individual character without becoming unrelated microsites.
- [ ] Terminal and ASCII elements remain secondary to the work.
- [ ] Motion is restrained, interruptible where relevant, and connected to a meaningful action.
- [ ] The result does not resemble a copied Lusion layout, a terminal-only portfolio, or a generic template with a 3D background.

### Suggested browser test matrix

Test representative mobile, tablet, and desktop widths, including a narrow mobile layout. Exercise:

```text
Home → Work → project → About
Home → Lab → experiment → parameter change → reset
Direct load and refresh of a project and experiment URL
Keyboard-only navigation and command-dialog focus return
Reduced-motion mode
Scene initialization failure and static fallback
Route changes without duplicated canvases or animation loops
```

Use the supported browser test tooling and inspect representative screenshots manually. Browser emulation does not replace a real-device check; report that distinction when relevant.

---

## 16. Codex execution brief

When this document is used for implementation:

1. Read this file, repository instructions, and the latest architecture document before editing.
2. Summarize the relevant existing foundation and select the smallest coherent implementation slice.
3. Build the accessible content and navigation before expensive visual effects.
4. Implement real behavior rather than mock controls or unsubstantiated technical claims.
5. Keep geometry, state, motion, content, and UI boundaries maintainable.
6. Validate the actual build and interactions with the tools available; report what was and was not tested.
7. Finish with changed files, completed behavior, verification results, and concrete remaining limitations. Do not describe planned features as delivered.

### Ready-to-use implementation prompt

```text
Implement my interactive portfolio using WEBSITE_DESIGN_GUIDELINES.md
and the latest architecture document in this repository.

First inspect the repository, its instructions, the available content and
assets, and the deployment configuration. Preserve the agreed stack.

Build a coherent vertical slice: accessible portfolio navigation, the
homepage, a reusable case-study presentation, and one functional
procedural geometry experiment. Use only approved supplied professional
content; keep missing or unapproved material unpublished.

The visual direction is cinematic engineering editorial: Lusion-inspired
spatial ambition, a Lusion Labs-style experimental section, an original
FORM / SYSTEM / MAKE anthology identity, and terminal / ASCII elements
as optional secondary interfaces. Do not copy reference-site assets or
layouts. Do not make 3D, animation, or commands necessary for navigation.

Keep Theatre.js as the authored motion core through the agreed runtime
adapter, with development-only Studio and versioned motion exports.
Do not add optional libraries without a concrete implemented need.

Prioritize truthful behavior, clear contributions, responsive reading,
accessibility, and static-deployment compatibility. Test the build and
critical user flows. Report actual results, missing approved inputs,
and remaining limitations without claiming unperformed verification.
```

---

## Final design test

A visitor should leave thinking:

> This person understands computational geometry and physical fabrication,
> and can turn that understanding into clear, useful interactive systems.

Every visual effect, interaction, and content decision should support that impression.
