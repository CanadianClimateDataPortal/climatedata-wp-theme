# `components/map/`

Components of the Maps SPA, served at `/maps/` and `/cartes/`.
Cartographic logic comes from `@/lib/map/`; this folder holds the React surface over it.

`components/map*` siblings (`map-container.tsx`, `map-header.tsx`, `map-wrapper.tsx`, `map-info/`, `map-layers/`) conceptually belong here and will migrate into this folder over time.

## Current resident

- `map.tsx` → `MapRoot` — owns the `#map-root` element and renders one `MapContainer`, plus a second synced alongside it while comparing two emission scenarios.
  Exported from this folder's `index.ts` barrel.
