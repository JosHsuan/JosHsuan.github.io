# Primary motion research

Inspected 2026-10-08. These sources inform original role instructions; no upstream algorithm code is copied into the case.

| Source | Pin and license | Decision |
|---|---|---|
| [pmndrs maath / math](https://github.com/pmndrs/math/tree/56e1c4d3855dedc436bdc18a011fcad001c4f237) | MIT; 56e1c4d3855dedc436bdc18a011fcad001c4f237 | The former maath repository currently redirects to math. Its data-oriented time/spring API supports evaluating a caller-owned response state. Do not pretend current math APIs are the old maath 0.10.8 package. |
| [maath 0.10.8 metadata](https://registry.npmjs.org/maath/0.10.8) | MIT; exact registry integrity in toolkit | Prior damping candidate; no new runtime install or migration is required for an analytical scalar response. |
| [Lenis](https://github.com/darkroomengineering/lenis/tree/bc152f90d7c9b04ef372718350e2f616f3c706b2) | MIT; bc152f90d7c9b04ef372718350e2f616f3c706b2 | Offers coordinated smooth scrolling and framework adapters. Its own loop/input integration would introduce another ownership choice. Keep native input and smooth only visual channels for this case; do not install by habit. |
| [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Existing project GSAP 3.15.0; GSAP Standard License, not MIT | Useful for measuring native progress and DOM orchestration. Numeric scrub also smooths animation, so it must not be stacked onto the same spring-controlled properties. No global dependency change. |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp/tree/f183dad4a52965583e3cc1d59b88cdc279e2e57d) | Apache-2.0; package 0.0.83 | Install role-locally for real keyboard, snapshot and browser validation. Existing root-pinned Chromium must be tested with this alpha package. |

The selected integration is a project-original scoped skill, closed read-only score MCP, and role-local pinned browser MCP. Algorithm suitability, observed kinetic quality and source truth are separate acceptance questions.
