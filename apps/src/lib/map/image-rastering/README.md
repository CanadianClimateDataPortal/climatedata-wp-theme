# `lib/map/image-rastering/`

**"Download" here means exporting an image of the current map from the Maps SPA.** It is a different feature from the Download SPA at `/download`.

Screenshot round trip for the Maps SPA's Download button — two browser sessions, not one.

**Sender** (user's browser, on the Maps SPA's Download click): `getLocationModalInnerHTML` scrapes the open LocationModal's markup, `createPrepareRasterPostHttpPayload` pairs it with the clicked marker position, `createFetchRequestInitOptions` wraps it as a POST body. The POST target is the current page URL itself (`window.location.href`, hash stripped) — a same-origin PHP proxy intercepts `POST` on `/maps/` and `/cartes/`, derives both path and query string from that request, and forwards to the screenshot service. Dataset/variable/viewport travel as the page's own existing query string; no client-side URL encoding step remains in this path.

**Receiver** (screenshot service's headless browser, fresh reload, no popup/marker of its own): it evaluates the global `window.$.fn.prepare_raster()`, which invokes `prepareRaster` — replays the marker and popup from the POST body, strips interactive chrome, fires a resize, then waits on `waitForMapsSettled` + `waitForMarkerIcons` before `signalRasterReady` adds the `to-raster` class to `#map-root` — the class the service polls for as its readiness signal.

## Vocabulary

- `html[data-raster="true"]` — persistent mode flag marking what belongs in the capture; styling keys off it to reveal elements normally hidden, like the info pills.
- `[data-raster="false"]` on any node — marks that node and its children for one-shot removal from the DOM, performed by `prepareRaster` before the mode flag above is set.
- `to-raster` on `#map-root` — the readiness signal the screenshot service polls for.

## Symbols

- `prepareRaster` — receiver-side replay + settle + signal, called by `$.fn.prepare_raster`.
- `createPrepareRasterPostHttpPayload` — builds the sender's POST payload from open popup + marker.
- `getLocationModalInnerHTML` — scrapes the sender's open LocationModal markup.
- `createFetchRequestInitOptions` — wraps a payload as the POST `fetch` init.
- `createFetchTargetToRasterWithEncodedUrl` — builds the salted, encoded screenshot-service URL. No longer used by the production Sender path above, which posts to `mapUrl.href` directly; retained because `createRasterDebugger`'s `createFetchFor` still needs it to retarget a captured replay at a different screenshot-service deployment.
- `waitForMapsSettled` — resolves once every tiled layer is idle, or the shared deadline hits.
- `waitForMarkerIcons` — resolves once replayed marker `<img>` icons finish decoding.
- `signalRasterReady` — adds `to-raster` to `#map-root`, the service's readiness signal.
- `installDebugPayloadAccessor` — installs the `window.mapPrepareRasterPostHttpPayload` accessor; assigning it a defined value lazy-loads the debugger below.
- `createRasterDebugger` — factory for the console debug helper (replay payloads, retarget deployments, hold at signal); loaded on demand, not part of the main bundle.
