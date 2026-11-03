# XR bamboo presentation review

Date: 3 November 2026. Status: source and ownership checks pass; five serial
Chromium checks pass against the integrated Pages artifact `ab5d1d…`. Final
same-artifact CI, other browser engines and publication verification remain pending.

The owner requests materials informed by real project photographs. The XR
assembly previously used the unchanged CAD layer material: diffuse 225/196/153,
metalness 0, roughness 1, with no UVs or texture. Its warm colour was appropriate,
but the uniformly matte response omitted the visible bamboo fibre and sheen.

| Published reference | Observed material evidence | XR presentation response |
| --- | --- | --- |
| [Physical capture](release/public/assets/xr/physical-capture.webp) | Pale honey-coloured strips, dense fibres along each strip, soft highlights rather than a painted metallic finish | Keep the source hue; add longitudinal low-contrast fibre and dry-satin PBR roughness |
| [Physical assembly](release/public/assets/xr/physical-assembly.webp) | Curved strips retain their grain direction and differ slightly in tone | Derive grain from each original curved sweep; stable ±6% strip-to-strip diffuse variation |
| [Physical result](release/public/assets/xr/physical-result.webp) | The complete woven structure reads as light bamboo; grain becomes subtle at the overall scale | Filter subpixel fibre with screen derivatives; retain the full source silhouette and existing camera fit |

The photographs also contain metal fasteners, tracking equipment and workshop
fixtures. Those objects are not added to the selected bamboo-only CAD model.
Phone recordings and their casing/screen materials are outside this adjustment.

`xr-bamboo-appearance.mjs` derives 384 connected four-corner sweeps, including 96
closed loops, from the existing 96,312 vertices. These are connected components
of the 352 authored source meshes, not newly invented strips. A 1,540,992-byte
runtime attribute follows the original cross sections and arc lengths. Fibre
uses the continuous cross-section coordinate, so a closed loop has no length
texture seam. Original position, normal, index, transforms and public GLB bytes
remain unchanged. The source attributes and original material are restored when
the owned presentation is released.

One `MeshStandardMaterial` clone retains the source colour, opaque double-sided
participation and existing light/tone-mapping pipeline. Roughness starts at 0.61
with bounded local variation; metalness remains zero. Fine colour modulation and
a 25-micrometre shading-only relief suggest the observed fibres. These are visual
presentation parameters inferred from the photographs, **not measured material
properties or a scanned texture**. The relief does not displace geometry, change
source normals or affect hit rays. No bitmap, extra draw, shadow map, animation
clock or per-frame geometry work is added. The existing source-fixed broad lights
and Bending-derived editorial stage remain in place.

Portable checks verify all connected sweeps and closed-loop adjacency, arc
lengths, unchanged source buffer hashes, preserved PBR shader chunks and exact
material restoration/disposal. Existing XR environment, camera renderer and
retained native-media lifecycle tests pass. The integrated Chromium run passed
5/5 in 2.2 minutes with unchanged test deadlines. It confirmed actual GPU shader
compilation, the 384-sweep material receipt, source geometry and hit ownership,
resize/keyboard input, all three native HD recordings, retained frame reversal,
continuous preference policy and the 38° → 34° → 32° scroll camera. No page errors
were reported. Evidence is retained under `pages-test-results/media-quality-final`.

The 1440- and 320-pixel-wide captures retain the full bamboo silhouette. At the
whole-model framing, individual strips can be only one to three pixels wide;
fine grain is correctly filtered rather than visibly resolved. The observed
change is subtle tone and roughness variation, not a claim of clearly readable
wood fibres at that scale. Physical-device and other-engine acceptance remain
unmeasured. Bending's material recipe is unchanged.
