# `test/`

Vitest bootstrap shared by every test in `apps/`.
`setup.ts` is wired in through `vite.config.ts`.

## jsdom platform shims

`setup.ts` fills in two browser APIs the image-rastering tests exercise.
Each one is installed only when this jsdom leaves it undefined, so a later jsdom that ships the real implementation keeps it.

- `HTMLImageElement.prototype.decode` — `waitForMarkerIcons` calls it on every replayed marker icon.
  The shim resolves rather than rejects: a rejecting shim would send every test down the `.catch()` branch instead of the decode path under test.
- `document.fonts` — `prepareRaster` awaits `document.fonts.ready` alongside the marker-icon and map-settle checks.
  This jsdom has no FontFaceSet, so the shim supplies an already-resolved `ready`.

`requestAnimationFrame` already exists in this jsdom and stays on jsdom's own implementation on purpose.
The settle loop in `lib/map/image-rastering/wait-for-maps-settled.ts` is timed against real frame scheduling, and a hand-rolled replacement would change the very timing the settle tests exist to pin.

Probed against this repo's jsdom on 2026-08-05.
Re-probe after a jsdom upgrade: a shim whose guard now passes is dead weight, and an API that disappeared needs a new one.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- `setup.ts` — added the two guarded shims above.
