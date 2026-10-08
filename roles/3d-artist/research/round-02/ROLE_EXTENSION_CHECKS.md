# Role-extension verification

Date: 8 October 2026, Europe/Berlin.

| Check | Observed result |
|---|---|
| Skill Creator `quick_validate.py` on `cinematic-editing` | Valid |
| Skill Creator `quick_validate.py` on `layer-compositing` | Valid |
| `node roles/3d-artist/research/round-02/verify-sources.mjs --refresh` | Seven public upstream files fetched at the pinned commit; all seven byte-identical to installed Three 0.186.1 files |
| `node roles/3d-artist/research/round-02/verify-sources.mjs` | Seven installed source hashes verified |
| Cinema and Artist `codex-role.ps1 -PrepareOnly` | Both isolated homes prepared successfully using their existing launchers |
| Prepared skill versus repository skill SHA-256 | Both byte-identical |
| Scoped `git diff --check` | Passed; Git reported existing line-ending conversion notices |

Skill hashes at preparation:

- `cinematic-editing/SKILL.md`: `207fbc3338f8b4ee8e0d0e3808f0abd4f335fdb079c73bdba54b8e56dc50a8a3`
- `layer-compositing/SKILL.md`: `525b8c0ba4818cf03860fa9dfffa8eabc4d6d12979e1d27cfc9c5a866bb138dd`

The new skills and contracts are ready for the next integration step. Their role-local configuration and existing MCP implementation were not edited. Preparing the isolated skill copies is not a claim that this chat hot-loaded them or that a new MCP was exercised. No new dependency, source material, case runtime or root application was changed by this extension.

The owner's subsequent commit/push request established the snapshot boundary. Round-02 optical focus, editing and ASCII still require runtime implementation and actual rendered acceptance; previous role studies and source checks do not prove those case requirements complete. The pass-memory figures are calculations, not measured device performance.
