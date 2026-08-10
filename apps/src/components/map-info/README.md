# `components/map-info/`

Panels and modals describing the map the user is currently looking at.

Not a complete inventory of the folder; entries are added as files are documented.

- [`download-map-modal.tsx`](./download-map-modal.tsx) → `DownloadMapModal` — the modal behind the Download button.
  - `handleDownloadClick` — POSTs the current view to the screenshot service, then saves the returned PNG as the downloaded map image.
  - Registers `window.$.fn.prepare_raster`, the entry point the screenshot service's headless browser calls. See [`lib/map/image-rastering/`](../../lib/map/image-rastering/) for the raster vocabulary.
