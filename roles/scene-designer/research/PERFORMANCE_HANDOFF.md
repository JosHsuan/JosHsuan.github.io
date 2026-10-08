# Full-source scene transport handoff

Date: 2026-10-08 (Europe/Berlin).

The local case's `scripts/serve.mjs` now negotiates gzip for GLB, HDR and text-like static files. It uses Node's asynchronous gzip at level 6, generated per response so rebuilding the static artifact cannot leave a stale compressed cache. Raw assets are neither rewritten nor decimated. The CLI still binds only `127.0.0.1:4184` and accepts exactly that Host with GET/HEAD.

Negotiation follows [RFC 9110 section 12.5.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.3): explicit gzip exclusion overrides a wildcard; an empty field selects identity; explicit identity preferences are respected; no acceptable available representation returns 406. Missing Accept-Encoding selects identity as a server choice. JPEG/PNG/WebP/AVIF/GIF and compressed font/archive types are not gzip candidates. `Vary: Accept-Encoding`, representation-specific `Content-Length` and HEAD semantics are maintained alongside no-store, noindex and nosniff. Both lexical and resolved paths remain within the static root.

## Actual body-byte measurement

Measured through the changed HTTP handler on a separate ephemeral loopback port, using exact source bytes and `gzip;q=0` identity requests for comparison. The existing 4184 process was not restarted by this role.

| Prepared asset | Raw bytes | gzip bytes | Reduction |
| --- | ---: | ---: | ---: |
| Full shell + 50 source base solids, source-layers.glb | 6,879,848 | 3,530,198 | 48.69% |
| Existing local studio-small.hdr | 1,615,248 | 1,187,556 | 26.48% |
| Total | 8,495,096 | 4,717,754 | 44.46% |

The total is 8.102 MiB raw / 4.499 MiB encoded. The encoded two-asset body is below 5 MiB, but this does **not** turn the raw scene-budget audit into a pass. The raw scene exceeds both 5 MiB desktop and 2 MiB mobile targets; encoded delivery still exceeds the 2 MiB mobile target. The full derivative remains 227,521 triangles against the 150,000 target. Decoded memory/GPU geometry costs are unchanged. JavaScript, CSS, HTML, images and protocol overhead are additional.

The measured gzip HTTP requests took approximately 138 ms for GLB and 56 ms for HDR on this desktop, including request/read/compression/response overhead. These timings are a single local observation, not a mobile-performance guarantee or a renderer benchmark.

Every gzip body decompressed exactly to its original bytes, identity responses were byte-identical, HEAD matched encoded GET length without a body, and source hashes remained unchanged. The private replay script and report are under `D:/JosHsuan_Website/_work/bending-active-thesis/round-02/performance/measure-gzip-transfer.mjs` and `gzip-transfer-report.private.json`.

## Integration and verification

Run `node --test roles/uiux-designer/cases/bending-active-thesis/tests/preview-server.test.mjs` for actual ephemeral-port HTTP checks. They cover negotiation, exact decompression and source preservation, Content-Length/Vary, HEAD, compressed-image exclusion, unavailable encodings, Host/method/lexical containment, resolved directory-link containment, and fresh rebuilt bytes. The fixture port is temporary and loopback-only; the canonical Host check is unchanged.

The parent integrator subsequently restarted the actual local preview (PID 180480) and verified running 4184 HEAD responses: index, GLB and HDR all return 200 with gzip, Vary and noindex; encoded GLB length is 3,530,198 bytes and HDR length is 1,187,556 bytes. This closes the runtime activation step; the separate ephemeral-port tests above remain the original exact-round-trip evidence. This work does not alter public deployment or demonstrate compression on a future hosting provider. No running preview process was stopped or replaced by this role.
