# Instrument and reverberation extension

Instrument reports now require a use case before confirming a one-source plan: acoustic playing/voice, microphone recording, amplification without an open mic, or open-microphone reinforcement. The source is an approximate instrument/voice point for acoustic playing and recording, and a loudspeaker/monitor for amplified cases. The receiver is a listening point or microphone. Source and receiver heights must still be confirmed before photo projection. Stereo listening retains two speakers and the existing distance-mismatch trial. Existing saved music layouts and feedback keys remain compatible.

## Different geometric comparisons

- Recording: bounded 10/20/30 cm candidates reduce source–microphone distance, without proposing distances under 25 cm. This is a conservative trial search, not an ideal microphone placement or a close-miking limit for instruments.
- Open-mic reinforcement: candidates increase loudspeaker–microphone distance. The model does not compute gain before feedback, directivity, equalization, gain structure or an acoustic feedback threshold. A mic-recording suggestion is never reused as an open-mic reinforcement suggestion.
- Acoustic or amplified playing: a source within 50 cm of a vertical wall can be moved away in a small comparison. When both source and receiver may move, they translate together, preserving their relationship. This is a geometric trial, not a bass/tonal prediction.

All cases honor movement restrictions, approximate furniture footprints and room bounds. Reflections remain first-order point-source geometry for a rectangular room, without measured levels or source directivity. This limits accuracy for extended sources and near-field recording. A successful trial is a user report, not a measured improvement. Mode changes require reconfirmation and invalidate unrelated outcome keys.

## Reverberation explorer

Music and instrument reports expose a separate local comparison of the existing material model with a thick rug or curtain over a specified area. The area replaces a patch of the existing floor/wall; it is capped to the surface and never counts an existing carpet as a second layer. Absorption coefficients are inherited reference values, not measured product data. Added absorption is conservatively clamped to nonnegative changes; the explorer does not model a curtain making an already absorptive surface less absorptive. Sabine/Eyring is selected per band using the same existing engine. Furniture contributions remain coarse reference areas; moving a furniture symbol does not change that diffuse material model.

The chart shows estimated bass/mid/treble decay before and after. Missing materials or approximate room dimensions disable the comparison. The explorer does not change RT60 when playback volume changes, does not infer sound insulation and does not forecast feedback headroom. Purpose-specific instructions distinguish natural acoustic response, microphone capture, stereo low-volume listening and reinforcement. Subjective outcomes alter guidance; same/worse does not prompt more absorption purchases. Inputs and outcomes persist locally per report, geometry, materials and use case, separately from photo data and public report storage.

Instrument PDFs use one source and a generic listener/microphone label, including safe fallback for legacy stereo-shaped instrument records. Photos and photo calibration stay out of exported/shared data. The new material simulation and its feedback remain in this browser.

## Primary references

- Shure, feedback and interacting factors: https://service.shure.com/articles/en_US/Knowledge/how-do-i-fix-my-feedback-problem
- Shure, microphone techniques and direct/ambient balance: https://www.shure.com/en-US/docs/education/Microphone-Techniques-for-Recording
- Genelec, reflections and room treatment: https://www.genelec.com/improving-room-acoustics
- The first-order geometry reference remains Allen & Berkley (1979), linked in geometry-reflections.md.
