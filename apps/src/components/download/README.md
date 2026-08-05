# `components/download/`

The Download SPA, served at `/download` and `/telecharger/`, entry point `apps/src/main-download.tsx`.

A multi-step wizard: pick a dataset, a variable, a location, then options, and receive climate data files.

## Naming, so the two "downloads" stay apart

"Download" in `components/map-info/` means something else entirely: exporting an image of the current map from the Maps SPA.
That feature lives in `components/map-info/download-map-modal.tsx` and `apps/src/lib/map/image-rastering/`, and shares no code with this folder.
This folder is about data files; that one is about a picture.

## Touched this PR

- `steps.tsx` → `Steps` — the wizard shell holding every step.
  Now takes its default grid name from the `GridTypes` catalogue in `@/lib/vocabulary` rather than a bare `'canadagrid'` string, so the same intent reads the same way everywhere the grid name appears.
