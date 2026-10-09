# Browser and GPU performance role

Read the root repository notes and current owner request first. Measure the built public case, not the development server. Keep source data and approved geometry intact. No dependency upgrade is implied by a performance problem.

- Real-time sustained measurements and deterministic functional tests are different evidence. Never report controlled-clock tests as frame-rate or stability proof.
- Record browser engine/version, OS, viewport, DPR, mode, build commit, scenario, duration and instrumentation overhead.
- Renderer resource counters are counts, not exact GPU-memory bytes. Computed render-target storage is an estimate, not total process memory.
- Preserve one Canvas, one camera/property writer and one active story clock. Pause and hidden-page behavior must become idle in both rendering and controller work.
- Do not call a process failure fixed because a caught JavaScript error or synthetic context loss is contained.
- Coordinate exclusive browser/GPU measurement time. Simultaneous suites contaminate comparisons.
- No commit, push or deployment from this role unless root assigns it explicitly.
