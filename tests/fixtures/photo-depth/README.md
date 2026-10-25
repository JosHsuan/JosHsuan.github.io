# Nonpublishable estimated-depth experiment

This fixture is not a portfolio route or a release feature. It evaluates whether the original Caschlatsch workshop photograph benefits from a bounded, content-dependent displacement before any application integration is considered.

- Original photograph: 662 × 373, unchanged RGB bytes, source hash in `provenance.json`.
- Depth: local CPU inference with official Depth Anything V2 Small-hf, Apache-2.0, pinned revision and safetensors hash. No image upload, paid inference, remote code or website model dependency.
- The shipped experiment contains only normalized numerical depth, not model weights. Brighter depth means estimated nearer content, not metric distance or recovered hidden surfaces.
- The bounded bilinear map is quantized to unsigned bytes. The earlier bicubic interpolation overshoot was rejected and retained in the offline evidence archive.
- WebGL applies at most six original-image pixels horizontally and three vertically, tapered at image borders. Neutral UVs have no intentional color or position modification.
- The single context draws only on native input or policy events. The original photograph remains available through a native static control and as the failure fallback.

## Evidence and acceptance

The synthetic browser document records neutral shader, original photograph, native pointer extremes, native finite touch/scroll and neutral return, plus Reduced fallback. Default test timeouts remain unchanged. A data/counter pass is not a quality approval: reviewers must inspect hands, timber joints, foreground edges, stretching, duplicate contours, brightness and source framing in actual original-resolution browser captures.

This is an illustrative estimated-depth transformation, not a mesh, measured research geometry, camera reconstruction or evidence of physical motion. No occlusion filling is performed by this first diagnostic. Visible artifacts or an effect too small to justify the complexity are reasons to reject it.

## Not production contracts

The diagnostic separately loads the native image and fetches its bytes for integrity checks, and it loads numerical depth before deciding whether to acquire WebGL. It does **not** prove production zero-request static policies, reuse of the site's existing background owner/clock, navigation lifecycle, image-link accessibility or sitewide eligibility. Those require a separately reviewed implementation if the visual experiment is accepted. Model tools and weights remain outside the repository. Technical diagrams and unspecified media are not opted in.
