# `components/`

React components for both SPAs built out of `apps/`.

Sub-folders carry their own README:

- `map/` — the Maps SPA's root map component.
  `map-container.tsx`, `map-header.tsx`, `map-wrapper.tsx`, `map-info/` and `map-layers/` conceptually belong there and migrate over time.
- `map-info/` — panels and modals describing what the map is showing, including the map-image export modal.
- `map-layers/` — components rendered inside a Leaflet map.
- `download/` — the Download SPA, served at `/download`.
- `ui/` — generic presentation primitives, free of climate-domain vocabulary.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- `header.tsx` → `AppHeader` — site header; carries a `data-raster="false"` marker so it drops out of the exported map image.
- `map-header.tsx` → `MapHeader` — variable title and controls above the map; same marker, same reason.
- `map-container.tsx` → `MapContainer` — one Leaflet map with its panes, layers and controls.
  Hosts `MapInfoPills` and records opened locations for the console debugger.
- `map-wrapper.tsx` → `MapWrapper` — fetches map info, then renders `MapRoot` once a climate variable has loaded.

`data-raster` and `to-raster` have one home: `apps/src/lib/map/image-rastering/README.md`.
