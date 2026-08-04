# `components/map/`

The Maps SPA, served at `/maps` and `/cartes/`. Consumes cartographic map logic from `@/lib/map/`.

`components/map*` siblings (`map-container.tsx`, `map-header.tsx`, `map-wrapper.tsx`, `map-info/`, `map-layers/`) conceptually belong here and will migrate into this folder over time.

## Current resident

- `map.tsx` → `MapRoot` — root Leaflet map component, exported from this
  folder's `index.ts` barrel.
