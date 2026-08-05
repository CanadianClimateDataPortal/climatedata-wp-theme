# `lib/map/image-rastering/`

**"Download" here means exporting an image of the current map from the Maps SPA.** It is a different feature from the Download SPA at `/download`.

Screenshot round trip for the Maps SPA's Download button — two browser sessions, not one.

**Sender** (user's browser, on the Maps SPA's Download click): `getLocationModalInnerHTML` scrapes the open LocationModal's markup, `createPrepareRasterPostHttpPayload` pairs it with the clicked marker position, `createFetchRequestInitOptions` wraps it as a POST body. `resolveRasterFetchTarget` picks where that POST goes: when the page render found the same-origin PHP proxy configured for this environment (`window.RASTER_PROXY_ENABLED`), it targets the current page URL directly — a proxy intercepting `POST` on `/maps/` and `/cartes/` derives both path and query string from that request and forwards to the screenshot service. Otherwise it falls back to `createFetchTargetToRasterWithEncodedUrl`, the salted, encoded URL that addresses the screenshot service directly.

**Receiver** (screenshot service's headless browser, fresh reload, no popup/marker of its own): it evaluates the global `window.$.fn.prepare_raster()`, which invokes `prepareRaster` — replays the marker and popup from the POST body, strips interactive chrome, fires a resize, then waits on `waitForMapsSettled` + `waitForMarkerIcons` before `signalRasterReady` adds the `to-raster` class to `#map-root` — the class the service polls for as its readiness signal.

## Timing

The screenshot service sets every deadline in this namespace. Its sequence, from the outside in:

1. Loads the map page and waits for `<body>`.
2. Sleeps 1s.
3. Calls `window.$.fn.prepare_raster(locationPopupHtml, markerLatLon)`.
4. Waits up to 10s for an element carrying `to-raster` to become *visible*. Exceeding this raises an unhandled timeout — HTTP 500, no image.
5. Sleeps 4s.
6. Screenshots that element alone.

Two constants are sized against step 4's 10s ceiling, and both are arithmetic against it rather than figures measured against observed runs:

- `MAP_SETTLE_TOTAL_BUDGET_MS` (9s, `wait-for-maps-settled.ts`) — the whole of `prepareRaster`'s settling, both `waitForMapsSettled` calls combined. Leaves roughly a second for the synchronous DOM work between them and for script-invocation overhead.
- `PREPARE_RASTER_STUB_POLL_DEADLINE_MS` (5s, `install-prepare-raster-stub.ts`) — how long the stub waits for the real implementation to be registered, covering bundle parse and React mount.

The two are separate give-up points rather than two shares of one 10s: a page that spends all of both has already lost the service.

Step 5 is why the 9s budget does not have to guarantee every tile finished: a tile landing inside that trailing 4s is still captured. Step 5 grants nothing to step 4, so it cannot rescue a signal that arrives late.

Step 3 runs through the service's `driver.execute_script`, which is why everything reachable from `$.fn.prepare_raster` is meant to swallow its own failures rather than throw. An exception escaping into `execute_script` arrives as a `JavascriptException` and kills the export, a failure the service cannot tell apart from no application being on the page at all. `installPrepareRasterStub` states that contract, and names the one place the code does not yet enforce it.

## Vocabulary

- `html[data-raster="true"]` — persistent mode flag marking what belongs in the capture; styling keys off it to reveal elements normally hidden, like the info pills.
- `[data-raster="false"]` on any node — marks that node and its children for one-shot removal from the DOM, performed by `prepareRaster` before the mode flag above is set.
- `to-raster` on `#map-root` — the readiness signal the screenshot service polls for.

## Symbols

- `prepareRaster` — receiver-side replay + settle + signal, called by `$.fn.prepare_raster`.
- `createPrepareRasterPostHttpPayload` — builds the sender's POST payload from open popup + marker.
- `getLocationModalInnerHTML` — scrapes the sender's open LocationModal markup.
- `createFetchRequestInitOptions` — wraps a payload as the POST `fetch` init.
- `createFetchTargetToRasterWithEncodedUrl` — builds the salted, encoded screenshot-service URL; `resolveRasterFetchTarget`'s fallback when `window.RASTER_PROXY_ENABLED` is absent, and always the target `createRasterDebugger`'s `createFetchFor` retargets at a different screenshot-service deployment.
- `resolveRasterFetchTarget` — picks the Sender's POST target: `mapUrl.href` when `window.RASTER_PROXY_ENABLED` is set, otherwise `createFetchTargetToRasterWithEncodedUrl`'s encoded URL.
- `waitForMapsSettled` — resolves once every tiled layer is idle, or the shared deadline hits.
- `waitForMarkerIcons` — resolves once replayed marker `<img>` icons finish decoding.
- `signalRasterReady` — adds `to-raster` to `#map-root`, the service's readiness signal.
- `installPrepareRasterStub` — installs a polling stub at `window.$.fn.prepare_raster` at module scope, ahead of React. A call arriving before `DownloadMapModal` registers the real implementation is captured and replayed once it appears. `DownloadMapModal`'s unmount cleanup reinstalls the stub, so the key always holds a callable function. Intended never to throw, for the reason under Timing.
- `installDebugPayloadAccessor` — installs the `window.mapPrepareRasterPostHttpPayload` accessor; assigning it a defined value lazy-loads the debugger below.
- `createRasterDebugger` — factory for the console debug helper (replay payloads, retarget deployments, hold at signal); loaded on demand, not part of the main bundle.
