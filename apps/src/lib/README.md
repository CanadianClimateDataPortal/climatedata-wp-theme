# `lib/`

## Touched this PR

- `grid-resolution.ts` — `GridTypes`, `getGridTypeFor`, `getGridTypeLabel`, `isStationClimateVariable` — cartographic grid identity + resolution, used by both `/maps` and `/download`.
- `location-modal-class-names.ts` — `LOCATION_MODAL_BASE_CLASS_NAMES`, `LOCATION_MODAL_POSITION_CLASS_NAMES` — shared Tailwind classes for `LocationModal` and its raster replay.
- `utils.ts` — `encodeURL`, `hashCode` (salted URL encoding for the screenshot service), `cn` (Tailwind class merge).

Cross-app map logic like `grid-resolution.ts` is a migration candidate into `map/` in a later PR — not moved here.
