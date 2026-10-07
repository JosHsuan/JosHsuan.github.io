---
name: cinema-interaction-review
description: Validate single-input cinematography reviews, role-local Saved exports and UIUX evidence mappings in the Animation Cinematographer workspace. Use for this desk's browser review and evidence handoff.
---

# One-input review and evidence

Use pointer X or native scroll as the sole parameter source in the current proposal round. Keyboard and touch are equivalent access paths to the same scalar. Navigation, Save and import/export are review actions; they must not start an independent timeline.

Use the cinema_catalog MCP for the closed local catalog and cinema_browser for actual local preview operations. Run scripts/verify-interactions.mjs for exhaustive explicit browser validation when requested. The pinned vendor Playwright skill provides browser guidance; its Bash/npx launcher is not available on this Windows toolchain, so use the exercised MCP configuration and Node scripts.

Verify that input in the inactive mode does not change u, resting input stops rendering, backward scrubbing reproduces a pose, and both views report the same semantic progress. Inspect the generated contact sheet, narrow view and reduced-motion fallback.

Keep Saved choices under the role's own origin and key. Import the owner's original UIUX Export discussion choices file with a SHA-256 digest. Match only known IDs; preserve unresolved history and do not imply that earlier selections approve later treatments.

Use a fresh ephemeral browser profile for tests. Label synthetic fixtures in verification reports. Never treat a clean test browser or a researcher shortlist as the owner's preferences. Keep production and other roles unchanged.
