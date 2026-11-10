# Live reflection geometry

Music reports now start with an editable room plan. The first-order image-source model computes separate paths for each speaker and each of six rectangular room planes. It uses the confirmed horizontal coordinates, room dimensions, a common speaker-center height and seated ear height. Initial speaker/ear heights are explicit 1.2 m references. The user must confirm real dimensions, their plan and heights before photo projection becomes available. Approximate plans show schematic paths but omit metric path/delay values and cannot project onto photos.

## Meaning of the model

Mirror each source in a plane and intersect the line from that image source to the receiver with the plane. The reflection path equals the image-to-receiver distance. Excess arrival time is `(reflected distance - direct distance) / 343` seconds, assuming 20 °C air. Independent analytic examples, mirrored configurations and path-length invariants are tested.

These are calculated geometrical sites, not measured defects. The model does not infer levels, directivity, surface absorption, occlusion, diffraction, isolation, nonrectangular geometry or low-frequency sound pressure. The user can check wall sites with a mirror. RT60 and room-mode calculations remain separate; this feature does not claim moving a speaker changes room dimensions or measured reverberation. Legacy fixed side-wall dots and their midpoint update are replaced by the same image-source geometry. Automatic fixed corner-trap and rear-diffuser marks are removed from generated treatment diagrams.

A small-move trial searches single-object 10/20/30 cm offsets and chooses a candidate that reduces the stated stereo direct-distance mismatch. It respects fixed speaker/seat controls, approximate furniture footprints and minimum separations. It is not a global optimizer, an audible improvement prediction or a bass correction. Equal-distance layouts may have no such trial; they still expose reflection checks. Dragging can specify an observed layout even if an object cannot physically be moved.

## Photo alignment and privacy

Photos use the existing browser-local evidence adapter. Four user-selected corners define a planar homography: top A, top B, bottom B, bottom A. For side walls, A is the front of the plan and B the back; for front/back walls, A is plan-left and B plan-right. This allows mirrored views without guessing camera orientation. Incomplete, self-crossing, tiny and degenerate outlines are rejected. A full rectangular wall must be visible; hidden corners and lens distortion limit accuracy. Markers are projected from current 3D reflection coordinates and update with plan/height/trial changes. There is no image recognition or acoustic measurement from the photo.

Photo bytes and calibration stay in IndexedDB. The adapter remains compatible with prior records. No photo, corner, observation or image-derived datum is sent to APIs, PDF exports or analytics. Geometry and bounded categorical feedback (20 recent comparisons) save locally per report; baseline/proposal geometry also uses the existing report-personalization path for PDF compatibility. Photos and the new feedback do not travel with it. Browser site-data removal clears these records.

Structured outcomes alter guidance, not calculated physics: positive absorption trials can reveal a conditional freestanding-panel suggestion at that site; same/worse withdraws that purchase suggestion and offers another surface. Failed move trials restore the baseline before another check. Outcomes are keyed to the exact layout, heights, selected surface and trial view, so changing geometry never reuses an old result as proof. Free-text notes retain their existing personal-record role.

## References

- Allen & Berkley (1979), *Image method for efficiently simulating small-room acoustics*: https://users.umiacs.umd.edu/~ramanid/cmsc828d_audio/AllenBerkley79.pdf
- Genelec, *Improving Room Acoustics*: https://www.genelec.com/improving-room-acoustics
