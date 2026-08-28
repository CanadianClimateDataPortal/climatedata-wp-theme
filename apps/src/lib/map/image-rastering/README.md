# `lib/map/image-rastering/`

**"Download" here means the downloaded map image** — a picture of the current map. That is a different feature from the Download SPA at `/download`, which exports data files.

The round trip spans two browsers, not one.

**Sender** (the user's browser, on the Download click): [`get-location-modal-inner-html.ts`](./get-location-modal-inner-html.ts) scrapes the open `LocationModal` markup, [`create-prepare-raster-post-http-payload.ts`](./create-prepare-raster-post-http-payload.ts) pairs it with the clicked marker position, and [`create-fetch-request-init-options.ts`](./create-fetch-request-init-options.ts) wraps that as a POST body for the screenshot service. Dataset, variable and viewport travel separately in the URL, encoded by [`create-fetch-target-to-raster-with-encoded-url.ts`](./create-fetch-target-to-raster-with-encoded-url.ts).

**Receiver** (the screenshot service's headless browser, a fresh page load with no popup or marker of its own): it evaluates the global `window.$.fn.prepare_raster()`, which runs `prepareRaster` — replaying the marker and popup from the POST body, stripping interactive chrome, firing a resize, then waiting on the internal `waitForMapsSettled` and `waitForMarkerIcons` helpers before `signalRasterReady` adds the `to-raster` class to `#map-root`. A placeholder registered by [`install-prepare-raster-stub.ts`](./install-prepare-raster-stub.ts) at SPA start-up holds any call arriving before React has mounted.

## Vocabulary

- `html[data-raster="true"]` — persistent mode flag marking what belongs in the image; styling keys off it to reveal elements normally hidden, such as the info pills.
- `[data-raster="false"]` on any node — marks that node and its children for one-shot removal from the DOM, done by `prepareRaster` before the mode flag above is set.
- `to-raster` on `#map-root` — the readiness signal the screenshot service polls for.

## Symbols

Everything [`index.ts`](./index.ts) exports:

- `prepareRaster` — receiver-side replay, settle and signal; what `$.fn.prepare_raster` calls.
- `getLocationModalInnerHTML` — scrapes the sender's open `LocationModal` markup.
- `createPrepareRasterPostHttpPayload` — builds the sender's POST payload from the open popup and marker.
- `createFetchRequestInitOptions` — wraps a payload as the POST `fetch` init.
- `createFetchTargetToRasterWithEncodedUrl` — builds the salted, encoded screenshot-service URL.
- `signalRasterReady` — adds `to-raster` to `#map-root`.
- `installPrepareRasterStub` — installs the start-up placeholder described above.
