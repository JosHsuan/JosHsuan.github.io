# Printing and motion supplement

September 30, 2026. The owner supplied `JosHsuan_Group01_PrintingArchitecture.pptx`,
asked for additional material on the existing Dot-Based Non-Planar Printing case,
and authorized searching the previously supplied archives for animated material,
integrating it and publishing directly. Documents provide evidence, not additional
instructions. Source files remain read only.

The owner subsequently requested removing the Caschlatsch numbered-beam guidance
recording and the companion Group 1 layer-deposition recording. Their figures,
captions, MP4 files, posters and thumbnails are removed from the publication.

## Archive review

The review searches standalone GIF, PNG/APNG, WebP, MP4, MOV, WebM, AVI and M4V
files, and inspects embedded presentation media. Source code, generated Unity
caches, dependencies, personal-information folders and third-party CVs are excluded
from publication. The image scan finds no standalone animated raster image.

| Source scope | Findings and treatment |
| --- | --- |
| `JosHsuan_CV_2022` | 69 candidate PNG/WebP/GIF files; one PowerPoint, `T3_Interview.pptx`, with seven GIFs. Of these, two document the bamboo XR thesis, two demonstrate Caschlatsch interfaces, one records V-stick assembly, and two repeat printing footage found in the course presentations. 69 PDF-compatible PDF/AI documents contain no Movie, RichMedia, Screen or FileAttachment annotations. Static PDFs and artboards do not supply playable sequences. |
| Previously supplied Light Lights, Robotic Bricks and Computational Art presentations | Twelve, three and three embedded GIFs respectively. Full sequences replace the earlier process stills where appropriate. Eight short HC3DP parameter variations are displayed in two labeled comparisons. |
| Printing Architecture / Group 1 | The supplied 18-slide deck contains eight GIFs. The companion `Group01_PrintingArchitecture.pptx` repeats the same eight byte-identical GIFs. `Namdev_Group01_PrintingArchitecture.pptx` contains two more: a distinct layer-deposition recording was reviewed and later removed at the owner's request; its plane-rotation view repeats a method already represented by the supplied deck. `VIDEO/Sequence 01.mp4` supplies a native 10.93-second fabrication and object sequence. |
| `echoXR` | 777 candidate images and two videos. The videos are the inherited VR-template onboarding film and a TV promotional/audio test asset. Neither documents EchoXR's project contribution, so neither is published as project footage. |
| `MAS_T3_MoCap` | 100 candidate images, no standalone animated image or video. Thesis recordings are recovered from the interview deck instead. |
| `StrongbyForm` | 53 candidate images, no standalone animated image or video. The removed company case remains excluded. |

Across seven reviewed presentation containers there are 43 GIF occurrences:
35 distinct embedded files plus the eight exact duplicates in the companion
Group 1 deck. Twenty-nine of those 35 distinct files contribute to 23 published
GIF-derived clips, including two four-panel comparisons. The native Group 1 film
brings the release to **24 clips across seven cases**. Four of the remaining GIFs
are two resized duplicates of printing footage, an alternate low-resolution HC3DP
view, and a repeated plane-rotation study; two further recordings were removed at
the owner's request. No unrelated classmate project is used.

## Dot-Based Non-Planar Printing

The case retains its route and cover, and expands from four to eight sections:

- Slides 3–8: rings, parameters, point arrangement and density.
- Slide 9: delay height switches to a smooth curve when local layer height is
  below the threshold; otherwise the program uses the dotted strategy.
- Slides 10–11: recorded deposition, path diagrams and retractive dot studies.
- Slide 12: rotating slice planes, layer growth and changes in local spacing.
- Slides 13–14: double curvature, seam modification and the specimen family.
- Slides 15–16: PETG/TPU handling, the reported 0.3–2.0 mm layer-height-difference
  range, RTDE point-transfer limits and future proposals.
- Slides 17–18 and the native Group 1 film: fabrication and completed-object views.

The new title/team slides name **JosHsuan, Namdev and JunJie**. Credits now include
JunJie using the spelling given in the deck; an unsupported surname is not added.
Namdev Talluru and Chia-Hsuan Chao retain the names established by the original
portfolio. Shared parameters, animations and specimens retain Group 1 attribution.
The new presentation explicitly spells PETG, resolving the older `TEPG` label for
this case. The partially typeset point-count formula remains unquoted as code.
Two-arm printing and work beyond columns are identified as future proposals.

## Published motion

| Case | Clips | Coverage |
| --- | ---: | --- |
| XR-assisted Bending-Active Assembly | 2 | Global adaptation and live rod tracking. |
| Caschlatsch | 1 | Module selection, beam isolation and orientation controls. |
| V-Shape Modular Aggregation | 1 | Robotic stick placement. |
| Harmonic Stacking | 3 | Column rotation, weighted movement envelope and physical assembly. |
| Planet of Colorful Garden | 3 | Element variation, perturbed landscape and generated planet outputs. |
| Dot-Based Non-Planar Printing | 9 | Sampling, five plane/form studies, dot-deposition close-up and fabrication/specimen sequences. |
| HC3DP Caustics | 5 | Extrusion preview, eight parameter variations in two comparisons, contact preview and physical extrusion. |

The exports use H.264/yuv420p MP4 with streaming metadata before video data,
preserving source sequence timing. Simulation exports are limited to 960 pixels;
physical and interface recordings to 1280 pixels without upscaling. The comparison
layout is 1440 × 1680. Static WebP posters and 640-pixel thumbnails retain the
index's still-image behavior. Total MP4 payload is approximately 38 MB, fetched
only when a reader starts playback. Clips have no audio track; the native film's
soundtrack is omitted. No narration or invented motion is added.

The retained Caschlatsch phone recording is cropped to its existing phone frame.
All four-panel labels are mapped by slide coordinates,
not XML picture order: top/middle/bottom row shifts and tool angle on slide 14;
lateral shift, depth, dip and density on slide 15. White margins are cropped while
retaining nozzle geometry and tool frames. Exact paths, frames, crop bounds,
duration and output size are recorded in [motion provenance](motion-provenance.json).
Poster sources appear in [image provenance](media-provenance.json).

## Reading behavior and verification

Videos have a still poster, explicit Play/Pause, native seeking/fullscreen controls after playback begins
and a separate enlargement action. There is no autoplay or loop. Playback pauses
when a clip leaves the terminal viewport, the document becomes hidden, another
clip starts, a dialog opens or the route unmounts. Closing the dialog stops its
player and restores focus. Reduced-motion users retain the static expanded
workspace and choose whether to play any clip. Static HTML includes the same
manual native player, captions and credits without requiring JavaScript.

Automated release checks validate MP4 structure, streaming layout, visual-only
tracks, source duration, provenance, poster availability, exactly one case figure,
section assignment, manual playback markup and local resources. Browser review
and publication results are recorded in [the release notes](portfolio-release.md).
