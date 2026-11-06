# RoomTuner

Experimental web app for planning simple acoustic improvements in a domestic space.
Describe a room, compare a current and proposed layout, try one change and record
whether it helped. Spanish and English; designed for mobile use.

Room dimensions and generic material coefficients produce estimates, not a measured
frequency response. The frequency curve is illustrative. Microphone noise and clap
captures are exploratory and uncalibrated. Layout distances describe geometry,
not a validated improvement in sound. Catalog prices are indicative.

## Development

Requires Node 22+ and pnpm (version pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill in the Supabase credentials in .env.local.
pnpm dev
```

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install webkit
pnpm test:e2e
```

Browser tests use placeholder database credentials; they verify the interface,
not remote persistence or acoustic accuracy. `/api/health` checks database availability.

## Data and access during the pilot

Reports are readable by anyone with their report URL. There are no user accounts
or private report access controls. Each analysis creates a new report; a read link
does not authorize overwriting an existing report. Avoid entering sensitive data.

Layout edits, experiment results and notes stay in the current browser and can be
included in the PDF; they do not sync across devices. A report that could not be
saved is marked as unsaved. The session can retain it in the same tab.

The paywall and live product pricing are disabled by default. Do not enable the
paywall before implementing payment verification. Pilot analytics record categorical
steps and outcomes, without report ids, dimensions or notes. Browser error logs
remain on the device; centralized client error reporting is not implemented.
