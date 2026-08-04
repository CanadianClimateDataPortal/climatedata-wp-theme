# `lib/map/image-rastering/`

Screenshot round trip for the Maps SPA's Download button — two browser sessions, not one.

**Sender** (user's browser, on the Maps SPA's Download click): `getLocationModalInnerHTML` scrapes the open LocationModal's markup, `createPrepareRasterPostHttpPayload` pairs it with the clicked marker position, `createFetchRequestInitOptions` wraps it as a POST body sent to the screenshot service (dataset/variable/viewport travel separately, encoded via `createFetchTargetToRasterWithEncodedUrl`).

**Receiver** (screenshot service's headless browser, fresh reload, no popup/marker of its own): it evaluates the global `window.$.fn.prepare_raster()`, which invokes `prepareRaster` — replays the marker and popup from the POST body, strips interactive chrome, fires a resize, then waits on `waitForMapsSettled` + `waitForMarkerIcons` before `signalRasterReady` adds the `to-raster` class to `#map-root` — the class the service polls for as its readiness signal.

## Symbols

- `prepareRaster` — receiver-side replay + settle + signal, called by `$.fn.prepare_raster`.
- `createPrepareRasterPostHttpPayload` — builds the sender's POST payload from open popup + marker.
- `getLocationModalInnerHTML` — scrapes the sender's open LocationModal markup.
- `createFetchRequestInitOptions` — wraps a payload as the POST `fetch` init.
- `createFetchTargetToRasterWithEncodedUrl` — builds the salted, encoded screenshot-service URL.
- `waitForMapsSettled` — resolves once every tiled layer is idle, or the shared deadline hits.
- `waitForMarkerIcons` — resolves once replayed marker `<img>` icons finish decoding.
- `signalRasterReady` — adds `to-raster` to `#map-root`, the service's readiness signal.
- `createRasterDebugger` — factory for the console debug helper: replay payloads, retarget deployments, or hold at signal.
