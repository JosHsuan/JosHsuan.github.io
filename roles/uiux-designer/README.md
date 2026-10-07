# UI/UX designer — material studies

An opt-in role workspace for sourced assets and original working specimens. It is a local proposal/inspection desk, separate from the empty portfolio. No professional content, private materials or production routes are populated.

The maintained [UIUX design plan](UIUX_DESIGN_PLAN.md) consolidates the four exploration rounds and records the owner's decision: **Saved is the preference source**. It distinguishes the live browser record from an as-yet uncaptured owner snapshot, curator recommendations and verification fixtures, and carries the boundary into the separate [3D Artist session brief](../3d-artist/SESSION_BRIEF.md).

## The quickest review

Open **http://127.0.0.1:4175/** while the preview is running. To reopen later from any directory on this Windows host:

```powershell
& 'C:/Users/JosHsuan/Documents/GitHub/JosHsuan.github.io/roles/uiux-designer/open-gallery.ps1'
```

`-Rebuild` refreshes the local artifact. The launcher uses Node 24.19.0, starts its loopback service in a hidden window, and opens the review URL. A portable terminal alternative from the repository root is:

```sh
node roles/uiux-designer/scripts/build.mjs
node roles/uiux-designer/scripts/serve.mjs
```

## How to inspect and decide

- Browse the seven categories or use search. `/` focuses search outside editable controls.
- **Open specimen** shows the actual local asset/effect, its parameters, proposed use, tradeoff, license/notice, source link and reusable code. A specimen's URL can be shared locally or reloaded directly.
- **Compare** displays two or three still specimens side by side. Individual live stages are opened separately so multiple canvases do not compete. The stage height follows its content to keep a single main review scrollbar.
- **Save** and discussion notes persist in this browser origin. **Export discussion choices** downloads real JSON. They record preference, not publication approval or a write to portfolio content.
- **Print review sheet** provides a contact sheet of the current filtered set. Motion controls honor the system preference or explicit Reduce setting; controls and descriptions remain usable.

The inspection interface uses English. Traditional Chinese proposal notes address the owner. Visual content is anonymous specimen text, public licensed assets or explicitly original demonstrations.

## First collection

| Group | Working proposals | Current direction |
|---|---|---|
| Typography | IBM Plex Sans, Inter, Space Grotesk, IBM Plex Mono, JetBrains Mono | Start with Plex Sans + Plex Mono; compare the neutral Inter option and short-title Space Grotesk option. |
| Icons | 12 SVGs each from Lucide, Phosphor regular and Tabler outline | Prefer one consistent family. Lucide is the first navigation/control candidate. |
| Identity | Original FORM / SYSTEM / MAKE marks; supplied palette specimen | Keep glyph labels readable; reserve orange for selected/control/focus cues. |
| Interface | Focus rail; bounded secondary command panel | Ordinary controls are primary. Commands share representation state and never execute arbitrary input. |
| Motion | Native aperture reveal; SVG trace; GSAP reflow; actual Theatre section sequence | Use motion to explain a relationship, with explicit ownership and deliberate playback. |
| Spatial | Parametric wire field; original GLSL hatch; actual ASCII height field | Compare rendering approaches without claiming structural or fabrication analysis. |

There are now **26 proposals**, **5 font files**, **36 external SVGs**, **3 original SVGs**, **26 actual rendered previews** and **8 original license files**. All 78 asset files are fingerprinted in [the asset manifest](catalog/assets.manifest.json). The [material catalog](catalog/materials.json) is the single source used by both the browser and catalog MCP. External source revisions are pinned; normal build/preview does not fetch the web.

## Round 02 — spatial feedback

The owner requested more expressive 3D motion and distinct interactive feedback across object types. [Open the seven new studies](http://127.0.0.1:4175/?collection=spatial-feedback): word planes, identity mechanisms, tactile key, separated card, navigation detents, hinged disclosure and a real 3D curved-rib assembly. The first six use CSS perspective; the seventh uses WebGL. All are original interactive specimens with normal controls. The earlier flat motion studies remain useful comparison baselines.

[Research, object-family mapping, primary sources and recommendations](research/spatial-feedback.md) explain how this direction applies across the whole material catalog. Start with the assembly, card and key. DOM studies compare precise/elastic responses and perspective. The 4.8-second Theatre score has four actual authored tracks, six checkpoints and 24 keyframes. Part selection and inspection have their own nested group owners. Reduced motion uses direct states, playback stays opt-in, and idle/closed specimens stop rendering. No optional library or new external asset was added.

No reference-site images, fonts, models or layouts were copied. Original specimens are project-authored and have no separate redistribution license assigned. Third-party fonts/icons retain their OFL/ISC/MIT notices. Asset rights and saved preference do not authorize portfolio publication.

## Round 03 — connected feature proposals

[Open Spatial editorial](http://127.0.0.1:4175/features/) in the same browser as the material desk. It reads the existing Saved choices and shows the basis before applying spatial treatments; it never overwrites that list. Search real studies, open the method reader, inspect images, compare two studies, and use the parameterized geometry workbench with undo/redo and actual SVG/JSON exports. A shared actions dialog is optional. The existing authored 3D score opens separately and disposes on close.

The [design approach and integration contract](research/spatial-editorial-system.md) explain how selection, inspection, comparison and return transfer to Home, Work, Case and Lab. The six features use the seven original spatial studies as truthful specimen content. [Their separate registry](catalog/features.manifest.json) records the mapping. No professional portfolio content or new dependency was introduced.

## Round 04 — applied feedback on the original materials

[Open the 19 applied studies](http://127.0.0.1:4175/?collection=applied-feedback#materials). Icons, Interface, Motion and Spatial appear first, followed by Identity and Typography. Open any original material and compare **Feedback → Baseline / Spatial**. The individual objects now respond: tactile glyphs, navigation detents, layered representation, hinged reveal, construction planes, nested part inspection, genuine Theatre section extraction, picked geometric bands, responsive hatch and real ASCII height slices. Original controls, IDs, downloads and Saved records are preserved.

[The research and proposal matrix](research/applied-feedback.md) links four recommended starting specimens, all 19 applications, their source vocabulary, exact property owners and adoption tradeoffs. The [applied manifest](catalog/applied-feedback.manifest.json) supplies the machine-readable mapping. These are original working treatments using existing assets and packages; no timeline, professional claim or approval was fabricated.

## Role-only skills and MCP

The three skills and two MCP servers are defined in [toolkit.json](toolkit.json). Skills live here, outside automatic root/global discovery. Display names identify **UIUX designer**. The launcher renders [config.template.toml](config.template.toml), copies role skills into ignored `.runtime/codex-home/skills`, and sets `CODEX_HOME` only for its child Codex invocation. The prior environment value is restored afterwards. No global settings, credentials, repository-root `.agents` or `.codex` registration are written.

```powershell
& roles/uiux-designer/codex-role.ps1 -PrepareOnly
& roles/uiux-designer/codex-role.ps1 mcp list --json
& roles/uiux-designer/codex-role.ps1
```

Use the last command for an actual UI/UX Codex CLI session. Model authentication uses normal Codex login/keyring behavior; no credentials are copied into the role. The existing desktop chat does not hot-load these servers merely because their files exist. Other roles should have sibling directories, their own skills/config/runtime and their own preview port.

`uiux_catalog` exposes only search, detail and catalog status. `uiux_browser` is Microsoft Playwright MCP 0.0.83, with an isolated profile and the existing project headless-shell binary. Its own alpha Playwright dependency is isolated in this role's exact lockfile and was actually tested; the website's stable packages remain unchanged. The origin allowlist guides browser requests; it is not an operating-system security boundary. See [MCP results](verification/mcp-results.json).

The copied upstream browser skill contains portable CLI guidance. On this Windows host its npx/bash wrapper is not the active path; the verified MCP configuration performs inspection. The role workflow honors the project brief over generic aesthetic defaults in the upstream frontend skill.

## Structure and reusable boundaries

```text
roles/uiux-designer/
  AGENTS.md / toolkit.json / config.template.toml / codex-role.ps1
  skills/                  UIUX-only workflows and pinned upstream skills
  assets/ + licenses/      Original or acquired bytes with retained notices
  catalog/                 Material records and source/hash manifest
  src/specimens/           Reusable DOM, SVG, GSAP, geometry and shader modules
  src/spatial-feedback/    Original response kernel, six DOM studies and R3F assembly
  src/feature-system/      Connected review state, real SVG geometry and parameter history
  src/applied-feedback/    Shared comparison and press contract; mappings live in each specimen
  src/motion/theatre/      Isolated authoring entry, genuine export and binding
  research/                Object-to-feedback matrix, primary sources and design rationale
  preview/                 Review shell; individual specimen documents
  mcp/                     Read-only catalog server
  scripts/                 Acquisition, build, preview and verification
  verification/            Actual validation records (screenshots ignored)
  .runtime/                Ignored config, profiles, temporary authoring and logs
  dist/                    Ignored local build; never the Pages out/ artifact
```

Source modules are separate from the catalog and the review UI. Downloads under `samples/src/` retain that module structure; helpers and existing pinned dependencies are part of the contract. They are proposals for later integration, not drop-in production guarantees. Font files are actual specimens, not production subsets. The local bundle is not minified because Next's bundled standalone minimizer is unavailable; public delivery optimization is separate work.

The public application does not import this directory. Root lint excludes all `roles/` as a neutral multi-role boundary; this workspace runs its own lint and validation. Root `pnpm check` still validates the unchanged empty portfolio.

## Repeatable checks and authoring

```sh
pnpm --dir roles/uiux-designer install --ignore-workspace --frozen-lockfile
pnpm --dir roles/uiux-designer lint
node roles/uiux-designer/scripts/build.mjs
node roles/uiux-designer/scripts/validate.mjs
node roles/uiux-designer/scripts/verify-mcp.mjs
node roles/uiux-designer/scripts/verify-gallery.mjs
node --test roles/uiux-designer/scripts/test-response.mjs
node roles/uiux-designer/scripts/verify-spatial-feedback.mjs
node roles/uiux-designer/scripts/verify-feedback-resilience.mjs
node roles/uiux-designer/scripts/verify-features.mjs
node roles/uiux-designer/scripts/verify-applied-feedback.mjs
node roles/uiux-designer/scripts/capture-applied-layouts.mjs
```

MCP/browser checks require the preview at port 4175. The gallery test covers the original collection's controls plus all 26 mounts/sources and review flows. The dedicated spatial checks exercise the seven new studies in normal/reduced motion, including touch emulation, with a separate resilience check. [Verification](verification/README.md) distinguishes actual results from remaining limits.

Theatre authoring is a separate GET-only loopback surface, `node roles/uiux-designer/scripts/author.mjs`, at port 4176. In Studio select **Pose → assemblyProgress → Sequence**, capture the three documented poses and export/download actual state. After deliberately replacing the state, run `node roles/uiux-designer/scripts/version-motion.mjs`, then rebuild/verify. Never fabricate a save file. The runtime uses the existing application adapter; Studio is excluded from the preview and production module graphs.

For the spatial score, use `node roles/uiux-designer/scripts/author-spatial.mjs` on the same port, with the other authoring server stopped. The initial seed is the existing genuine section export. In Studio, right-click **camera → position → Sequence all** if those tracks are not yet sequenced, then use **Capture spatial score** and **Export spatial motion**. Save the downloaded bytes at `src/motion/theatre/spatial/motion.state.json` and run `scripts/version-spatial-motion.mjs` to verify/hash the four actual tracks. Existing versioned exports already contain these tracks; no menu action is needed to re-capture their values.

Acquisition is deliberate, not a build hook: `scripts/acquire-assets.mjs` retrieves pinned public-source bytes, then `scripts/write-catalog.mjs` indexes acquired/original assets. Preserve intentional review edits and re-review any revision changes. Package/source licenses remain with the files.

After changing spatial code, `node roles/uiux-designer/scripts/capture-previews.mjs` captures its actual default rendering from the running build. Then regenerate the catalog and build. Still thumbnails are genuine captures with recorded parameters; they do not simulate live effects in the index.

`scripts/capture-feedback.mjs` captures the seven Round 02 inspection poses. Its preview manifest records the exact selected states. Run it against the current build, then `scripts/write-catalog.mjs` and build again. It preserves the earlier field/hatch captures.

`scripts/verify-applied-feedback.mjs` exercises all 19 applied materials in six normal/reduced browser configurations and captures 19 actual inspection poses. It preserves the seven Round 02 captures. Run `scripts/write-catalog.mjs` and build afterwards to update hashes and the local catalog. `--material=spatial-ascii` (or another exact material ID) performs a focused recheck and writes a separate results file without replacing the full matrix. The layout capture script produces six touch-emulated full-page screenshots for visual review; it does not imply physical-device testing.
