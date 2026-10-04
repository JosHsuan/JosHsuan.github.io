# Local 3D inspection

The Mesh Subdivision project has one interactive method illustration. Its spherical geometry is newly generated explanatory code, separate from the original coursework geometry. The coursework credits Mola and Benjamin Dillenburger. This scene makes no fabrication or simulation claim.

The DOM holds all text and controls. Fiber loads when the scene is visible and 3D is enabled, renders on demand, and unmounts outside the viewport. Reduced motion defaults to the SVG diagram. The diagram uses the same refinement state and remains usable when WebGL fails.

## Start an opt-in development session

Install the repository's locked dependencies with `pnpm install --frozen-lockfile`. The validated stack uses React 19.3.0, Fiber 9.8.1, Three.js 0.186.1 and r3f-mcp/client-server 0.5.2. The lockfile is the version authority.

In a PowerShell terminal at the repository root:

```powershell
$env:VITE_R3F_INSPECT = 'true'
pnpm dev --port 4181
```

Vite binds to `127.0.0.1`. Open `/projects/mesh-subdivision-stare-at-the-silence/` and scroll to the method study. Under reduced motion, choose **Enable 3D** explicitly.

The bridge requires both Vite development mode and `VITE_R3F_INSPECT=true`. `DevMcp.tsx` dynamically imports the provider only under those conditions and sets `readOnly`. Screenshot buffer preservation is also enabled only for that inspection session. Production builds remove the MCP import and bridge.

## Run the actual MCP/browser workflow

In a second terminal, set `INSPECTION_OUTPUT_DIR` to an existing absolute private directory named `website-development` inside `_private`, outside this repository. Do not use a deployment or public asset directory. The script resolves the physical path and rejects repository-local output.

```powershell
node scripts/inspect-r3f.mjs --url http://127.0.0.1:4181/projects/mesh-subdivision-stare-at-the-silence/ --out "$env:INSPECTION_OUTPUT_DIR"
```

Installed Chrome is the default browser. `--channel` can select another installed Playwright browser channel. The URL must be local. Each run creates its own timestamped directory and exits unsuccessfully if a required check fails.

The script starts the installed `r3f-mcp-server` through the MCP SDK's stdio transport. Upstream 0.5.2 has no host argument and normally binds its WebSocket server to all interfaces. A process-local constructor wrapper limits this inspection's listener to `127.0.0.1:3333`, without editing the dependency. The provider's scene bridge is read-only; the script invokes only inspection tools, with no code injection, scene mutations or file-generation tools.

Upstream MCP screenshots also write a temporary file. The child process's `TMP`, `TEMP` and `TMPDIR` point into the private run's `server-temp` directory, so those files stay private as well. Browser and stdio transport close in `finally`, including on failure. Stop the separate Vite terminal after inspection and unset `VITE_R3F_INSPECT` before ordinary development.

## What is checked

Actual MCP responses are archived for:

- `scene_graph`: mounted scene and parent/child relationships.
- `get_object`: `MethodSurface`, `MethodEdges`, `MethodCamera`, `KeyLight`, `FillLight`, material properties and refined mesh metadata.
- `query_bounds`: the method group in overview and detail views.
- `get_performance`: raw render/resource counters at coarse and refined states.
- `screenshot`: coarse surface, refined surface and detail edge views.

Playwright drives the visible DOM controls and checks seven behaviours:

1. Keyboard refinement changes the triangle count from 20 to 80 to 1,280, with the live refined mesh reporting 642 vertices.
2. Surface/Edges and View controls change the actual scene state.
3. One second of idle demand rendering adds zero WebGL draw calls.
4. Leaving the viewport unmounts the Canvas; returning mounts it again.
5. Diagram controls work with no Canvas mounted.
6. Reduced motion starts with the diagram and an explicit 3D entrance.
7. Losing an initialized WebGL context switches to working diagram controls.

Before the last test, a real MCP scene/object response confirms renderer readiness. Canvas DOM visibility alone can precede asynchronous renderer initialization and is insufficient for inducing a live context loss.

`inspection.json` records checks, raw tool response paths, console errors and warnings, page errors, failed requests and the idle measurement. PNG files include actual MCP Canvas captures and full-page desktop/reduced-motion captures. A transient no-client response during bridge startup or remount is retained and retried up to four times. Review screenshots visually; a successful tool response alone does not establish visual correctness. Full-page captures can contain unloaded lazy images outside visited areas, so image loading and site-wide screenshots also require the separate browser suite.

## Interpret performance accurately

This is a demand scene, not a continuously animated benchmark. MCP's FPS includes the idle intervals between requested frames. A low reported FPS therefore does not measure sustained rendering throughput.

In 0.5.2, the provider samples renderer counters in `useFrame` before that frame renders. A raw sample may describe the preceding frame. The script preserves it and takes another sample after real view-control interactions; it does not silently replace it or run fabricated animation for a faster FPS number.

The validated refined state reported 2 draw calls, 1,280 triangles, 1,920 edge segments, 2 geometries, 1 texture and 2 programs. The measured idle interval added zero WebGL draw calls. These are observations on the tested Chrome session, not a mobile/device benchmark or a physical performance result.

The private record preserves the observed Three.js Clock deprecation, development socket cleanup warnings and the warning produced during intentional context-loss disposal. These warnings are distinct from console errors; the completed run had no console errors, page errors or failed requests.

## Production boundary

Run the production build and public-output scan:

```powershell
pnpm build
node scripts/check-public-safety.mjs
```

The scan rejects development bridge/control markers and private paths in deployable output. The production browser suite also checks for unexpected WebSocket connections. The public site works without the MCP server, Codex or an AI account.

Official references: [r3f-mcp](https://github.com/r3f-mcp/r3f-mcp), [Fiber Canvas](https://r3f.docs.pmnd.rs/api/canvas), and [Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
