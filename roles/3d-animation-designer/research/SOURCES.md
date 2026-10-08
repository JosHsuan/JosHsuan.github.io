# Primary source animation research

Inspected 2026-10-08. These references inform the original source-animation skill; no third-party model or geometry is introduced.

| Source | Pin and license | Application and limit |
|---|---|---|
| [rhino3dm](https://github.com/mcneel/rhino3dm/tree/068baee9e853929139af486fc22a6da7c730fb2f) | MIT; source 068baee9e853929139af486fc22a6da7c730fb2f; existing converter uses Python 8.17.0 | OpenNURBS-style access supports source-object inspection. The pinned research source is not a claim that it matches the old installed Python wheel byte for byte. Reuse Geometry Engineer's verified converter rather than adding a remote arbitrary Python MCP. |
| [glTF Transform](https://github.com/donmccurdy/glTF-Transform/tree/e3b4db4c61a9b84162b8ab41ce5bd93ea343ad54) | MIT; v4.2.1, e3b4db4c61a9b84162b8ab41ce5bd93ea343ad54 | Candidate CLI/SDK for reproducible inspection and optimization. Transforming primitive data does not recover undocumented fabrication groups. No install yet: exact source inspection and rest-pose fidelity come first. |
| [Three.js](https://github.com/mrdoob/three.js/tree/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8) | MIT; r186, 9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8 | Existing runtime supports transform hierarchies and mesh inspection. Original geometry may be displayed with editorial rigid offsets; it is not evidence of bending mechanics. |

The integrated tool is a closed read-only element MCP: it exposes known source/status/limits and the representation contract, accepts no file paths or shell input, and cannot convert, upload or mutate a model. A role-scoped skill routes actual processing to the authorized source workflow. Blender or other artistic tools can be evaluated for a concrete preparation need later; installing an unrestricted bridge is unnecessary for this source-derived case.
