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

At this role-extension checkpoint, the new skills and contracts were ready for the next integration step. Their role-local configuration and existing MCP implementation were not edited. Preparing the isolated skill copies is not a claim that this chat hot-loaded them or that a new MCP was exercised. No new dependency, source material, case runtime or root application was changed by this extension itself.

The owner's subsequent commit/push request established this historical snapshot boundary. Optical focus, editing and ASCII had not been integrated at that checkpoint. Later on 8 October, the parent unlocked the authorized case implementation: it now includes the optical score, real-depth compositor, actual source shell/base, shared lights and protected DOM. See [adapter checks](RUNTIME_ADAPTER_CHECKS.md) and [actual image review](VISUAL_REVIEW.md) for that separate evidence. The pass-memory figures remain calculations, not measured physical-device performance.

## Prepared-reference recheck after integration

Both existing launchers were run again with `-PrepareOnly` on 8 October. Their new prepared skills remain byte-identical to the hashes above. Both skills explicitly resolve research from the role workspace root (and provide repository-root alternatives), while the launchers start Codex with `--cd $roleRoot`. They do not contain a broken skill-relative `../../research` link. The referenced role-root research contract and each role's `catalog/studies.json` exist. Research therefore stays in its authoritative workspace; no duplicate research tree or launcher mutation was necessary. The global Codex config hash and the calling process's `CODEX_HOME` value were unchanged before/after both preparations. This validates local preparation and references, not hot loading into this desktop chat.
