# Room photos: first delivery

Scope: exterior noise and work comfort. An optional panel on noise reports lets the user import a photo or request the rear camera, mark window/door/wall/workspace points, read an area-specific comparison, and record an observation and outcome. Camera capture depends on the browser; choosing an existing photo is always available. Markers are user observations, not detected sources or acoustic measurements.

## Local persistence and boundaries

`lib/evidence` separates the reusable versioned evidence model, image preparation and storage adapter. Each record belongs to the report key and records the use goal; photos are independent of the acoustic analysis and of shared report personalization. Only the noise workflow exposes this first panel. Other goals can reuse the model and adapter with their own instructions later.

Native IndexedDB `roomtuner-evidence-v1`, store `rooms`, holds a re-encoded JPEG Blob and normalized marker coordinates, notes and outcomes. One photo and 12 markers per report, 10 reports per browser, 2 MiB per stored photo (maximum 20 MiB of image data). No silent eviction. Inputs are limited to 12 MiB and JPEG/PNG/WebP signatures, decoded locally, resized to a maximum 1600 px edge and re-encoded through canvas without the original EXIF metadata. HEIC needs conversion before import. The image itself can still contain visible private information.

Images, markers, notes and outcomes have no upload path and are not added to Zustand persistence, API payloads, analytics, shared URLs or PDFs. These are ordinary browser data, not encrypted storage. Anyone using the same browser profile and report can access them. Clearing site data, switching browser/device or losing the report key prevents recovery. Photos save after successful storage; edits require the explicit save button. Errors never claim a successful save. Deletion removes this report's photo and annotations.

## Next stages

1. Test guided comparisons with a few users: can they identify a visible suspected opening, make a safe comparison and describe comfort changes? Check whether they mistake an annotation for a measured source. Improve wording before adding automatic analysis.
2. Before adding audio, evaluate device/browser processing, repeatability and changing exterior sound. A single sequential microphone capture does not justify directional source localization or a measured heat map. Define what can be reported as a relative comparison and reject unreliable captures.
3. Add multiple views and a room-level identity if user tests justify it; right now records attach to a report, not an account or permanent room library.
4. For cross-device media, introduce ownership/authentication and private object storage with access controls, retention/deletion, explicit consent and migrations behind the storage adapter. No such infrastructure is enabled by this release.
5. Reuse captures for music/home studio only after defining goal-specific observations. Photos can suggest visible geometry/materials; they cannot establish isolation, reverberation time or acoustic performance on their own.

No new cloud services, AI calls, paid dependencies or database migrations are required for this delivery. Existing report persistence continues independently.
