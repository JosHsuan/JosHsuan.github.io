# Geometry Engineer — CAD handoff

This role fills the CAD inspection/conversion gap identified by UIUX, 3D Artist and Animation Cinematographer during the owner-authorized local thesis-page work. The local result is at [Bending-Active review](http://127.0.0.1:4184/). Geometry Engineer owns source revision, units, axis conversion, coverage, topology and derivative verification; it does not choose professional claims or declare publication rights.

## Verified handoff

The supplied 67,871,461-byte Rhino file contains 10,457 objects: mesh studies, flat layouts, curves, annotations, markers and human scale figures. The selected visible detailed assembly is one original mesh with **84,626 vertices / 131,881 triangles**. Its stable object ID and source revision are pinned by the converter. The separate duplicate assembly, hidden studies, flat layouts, marker spheres and scale figures are explicitly excluded. No inferred part labels are generated.

The resulting `assembly.glb` is 3,614,676 bytes. Coordinates translate to the assembly's horizontal centre and minimum height, scale millimetres to metres, then rotate `(x, y, z)` to `(x, z, -y)`. All indices and normals are preserved; maximum float32 position rounding error is 5.913e-8 metres. No decimation, deformation, fabrication-thickness reconstruction or remeshing occurs. Browser bounds are **2.376 × 0.725 × 3.100 m (X/Y/Z)**; these are CAD measurements, not the author's reported built dimensions.

Full source paths and audit remain in ignored `.runtime`. Sanitized metadata and the derivative live in the case's ignored `public/assets/`. Source files are not copied into the repository or modified. The ordinary build never opens the external drive.

For the subsequent cinematic revision, the owner designated `D:\JosHsuan_Website` for all new working material storage and processing. The preceding conversion records are historical; do not treat their old output locations as the next processing destination. `scripts/prepare_cinematic_materials.py` creates source copies and faithful lossless crops under `D:\JosHsuan_Website\_work\bending-active-thesis\cinematic-integration`, verifies originals before/after, writes provenance there and performs an explicit sanitized handoff to the local case only. New rendered captures and narrative preparation follow the same D-drive boundary. The existing model was not reconverted or modified during this revision.

## Tools and setup

The upstream engine is [McNeel rhino3dm](https://github.com/mcneel/rhino3dm), MIT. The tested version is [8.17.0](https://pypi.org/project/rhino3dm/8.17.0/) with CPython 3.11 x64. The official 8.35.0 wheel failed DLL initialization on this host, so it is not the runtime used for this handoff. `requirements.txt` pins the exact tested wheel hash; the license is retained. This reads existing geometry without starting or modifying a Rhino session.

```powershell
python -m pip install --target roles/geometry-engineer/.runtime/python817 --only-binary=:all: --no-deps --require-hashes -r roles/geometry-engineer/requirements.txt
python -X utf8 roles/geometry-engineer/scripts/inspect_model.py '<owner-selected source.3dm>'
python -X utf8 roles/geometry-engineer/scripts/convert_model.py '<same source.3dm>' roles/uiux-designer/cases/bending-active-thesis/public/assets
node roles/geometry-engineer/scripts/verify_model.mjs
python -X utf8 roles/geometry-engineer/scripts/verify_source.py '<same source.3dm>' roles/uiux-designer/cases/bending-active-thesis/public/assets/assembly.glb
```

The converter deliberately rejects a new hash until a fresh inspection justifies the selection. These commands are a documented workflow, not permission to access a different model.

## Isolated skill and MCP

```powershell
.\roles\geometry-engineer\codex-role.ps1 -PrepareOnly
.\roles\geometry-engineer\codex-role.ps1 mcp list --json
node roles/geometry-engineer/scripts/verify-mcp.mjs
```

The opt-in launcher installs only `geometry-review` and `geometry_review` in its own `.runtime/codex-home`. The server supplies two exercised read-only tools: `geometry_model_record` and `geometry_conversion_limits`. It reads a fixed sanitized handoff and rejects arbitrary paths or code. No credentials or global settings are copied; this configuration does not hot-load tools into the desktop chat.

The GitHub MCP survey included [McNeel's RhinoMCP/RhinoAI entry](https://github.com/mcneel/RhinoMCP), [reer-ide/rhino_mcp](https://github.com/reer-ide/rhino_mcp) and [firstofthekind/rhino-mcp](https://github.com/firstofthekind/rhino-mcp). Those concern a live Rhino session and include execution or file/scene mutation capabilities. The current handoff already has an authored mesh, so no live CAD bridge is needed. None was installed or presented as tested. The smaller closed MCP makes the verified conversion available to the role without introducing a new Rhino plugin or background CAD service.

The GLB writer follows the [Khronos glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html). It is a project-original exporter with one inspected mesh, not a general Rhino exporter. `verification/model.json`, `source-fidelity.json` and `mcp.json` record actual checks. The cinematographer separately measured and rendered the GLB; the final page verifies its actual shader/camera integration.
