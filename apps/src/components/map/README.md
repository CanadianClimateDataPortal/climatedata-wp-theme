# `components/map/`

The Maps SPA, served at `/maps` and `/cartes/`. Cartographic logic comes from [`lib/map/`](../../lib/map/); this folder holds the components rendered over it.

The `components/map*` siblings ([`map-container.tsx`](../map-container.tsx), [`map-header.tsx`](../map-header.tsx), [`map-wrapper.tsx`](../map-wrapper.tsx), [`map-info/`](../map-info/), [`map-layers/`](../map-layers/)) conceptually belong here and migrate in over time.

- [`map.tsx`](./map.tsx) → `MapRoot` — owns the `#map-root` element and renders one `MapContainer`, plus a second alongside it while comparing two emission scenarios. Exported from [`index.ts`](./index.ts).
