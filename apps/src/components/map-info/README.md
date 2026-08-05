# `components/map-info/`

Panels and modals describing the map the user is currently looking at.

"Download" in this folder means exporting an **image** of that map.
The Download SPA at `/download`, which exports climate data files, is a separate feature under [`components/download/`](../download/).

See [`apps/src/lib/map/image-rastering/README.md`](../../lib/map/image-rastering/README.md) for the raster vocabulary and the full screenshot round trip.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- [`download-map-modal.tsx`](./download-map-modal.tsx) → `DownloadMapModal` — the map-image export modal.
  - `handleDownloadClick` — POSTs the current view to the screenshot service, then hands the returned image to the browser as a file download.
  - Registers `window.$.fn.prepare_raster` — the entry point the screenshot service's headless browser calls; see [`lib/map/image-rastering/`](../../lib/map/image-rastering/).
