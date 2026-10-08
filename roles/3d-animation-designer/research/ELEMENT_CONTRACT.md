# Source element animation contract — Round 02

Status: the parent Geometry Engineer handoff now identifies the actual shell and two source base layers. The pure display-pose sampler and six focused checks are implemented; rendered integration remains separate. See [the current source handoff](ELEMENT_HANDOFF.md). This role did not author or replace the source geometry.

The [closed element catalog](../catalog/elements.json) now records the current source revision, exact layer IDs, permitted offsets and evidence limits. The earlier pending state remains a dated [establishment checkpoint](ESTABLISHMENT_CHECKPOINT.md). Read and verify the current asset before relying on the previous round's evidence. A procedural floor cannot fulfill the requested source-base requirement.

## Preparation and handoff

Original CAD is read-only. Inspect only the authorized source. Record object IDs, visible layers, groups, connected components, bounding boxes, units and conversion transform in the private D-drive audit. Processing and derived geometry live under `D:/JosHsuan_Website/_work/bending-active-thesis/round-02`; only an explicit sanitized local-review handoff may enter the case's ignored assets.

The current whole shell has no named fabrication groups. Connected components can be rendering seams or duplicates and are insufficient to label physical panels. Select source-authored groups when defensible; otherwise reveal the intact shell with the verified source base and real contours. Never turn this limitation into a fabricated engineering animation.

Each handoff should contain the model revision, source-relative element origins, animation pivots, allowed offsets, rest transforms, affected bounds and display-only caption. An element manifest must describe the relationship to the source, not merely assert that it was verified.

## Proposed animation API

The implemented `sampleElementPose(stageU, { reducedMotion })` returns offsets for the known `shell`, `base-lower` and `base-upper` IDs, the required model revision, separation weight, bounds padding and a representation caption. The parent must match the returned model revision before binding these offsets. Source panel splitting remains unsupported. The parent scene binding remains the final mesh-transform writer.

Initial narrative: overview complete source silhouette; form source shell/base relationship; system defensible rigid separation or intact contour reveal; pattern real opening detail; make exact rejoin beside photographic evidence; validation stable geometry with clear limits; credits complete source object. Coordinate the displacement envelope with Cinema before camera framing and with Scene Designer before stage dimensions.

## Validation after geometry work

Hash originals before and after. Compare every rest-pose vertex against the expected unit/axis transform and preserve topology/normals where unchanged. Prove requested source base inclusion by IDs and placement. Ensure exploded views recover exactly, bounds include moved parts, captions identify editorial separation, and no simulated stress or construction order is implied. Reduced motion presents the complete truthful source configuration. Test actual rendered silhouettes; counts alone cannot prove correct object selection.
