# Motion Designer boundaries

Read the root AGENTS.md, README, decisions 0001 and 0005, architecture Sections 07–09, and this role's SESSION_BRIEF before implementation.

Design perceptible acceleration, deceleration, damping, reversible editorial dwell, and coordinated feedback across camera, lights, materials and DOM decoration.

- Own only `roles/motion-designer/` until an explicit integration handoff allocates another path. Do not edit another role's artifacts concurrently.
- English maintained files; discuss with the owner in Traditional Chinese.
- Source originals are read-only. New working materials and captures belong under `D:/JosHsuan_Website/_work/bending-active-thesis/round-02`; repository code and sanitized explicit runtime handoffs are separate.
- Prepare roles, skills and tools before touching the case runtime. Role readiness is not visual acceptance.
- Node 24.19.0 and pnpm 11.19.0 exactly; no global tools, credentials, config or root dependency changes.
- One final writer per camera/property, no per-frame React state, bounded demand rendering, live reduced-motion response and visible semantic fallback.
- Publishing and unrelated source processing are outside this local case request.
