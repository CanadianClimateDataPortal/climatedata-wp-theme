# `components/map-info/`

## Touched this PR

- `download-map-modal.tsx` → `DownloadMapModal` — the Download-image modal.
  - `handleDownloadClick` — POSTs the current view to the screenshot service, downloads the returned PNG.
  - Registers `window.$.fn.prepare_raster` — the entry point the screenshot service's headless browser calls; see `lib/map/image-rastering/`.
