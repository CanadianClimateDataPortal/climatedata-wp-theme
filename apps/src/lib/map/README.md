# `lib/map/`

Logic about the map as a cartographic object — grid cells, Leaflet data, and what gets drawn.
Consumed by both `/maps` and `/download`.

"Map" carries two meanings in this codebase, so it is worth stating which one this folder holds.
The Maps SPA is the page served at `/maps`; this folder is about the thing rendered on it.
The React components that render it live in `components/map/`.

## Children

- `image-rastering/` — the Download-button screenshot round trip; see its own README.
