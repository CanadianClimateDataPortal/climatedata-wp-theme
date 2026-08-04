# `lib/`

## Touched this PR

- `location-modal-class-names.ts` — `LOCATION_MODAL_BASE_CLASS_NAMES`, `LOCATION_MODAL_POSITION_CLASS_NAMES` — shared Tailwind classes for `LocationModal` and its raster replay.
- `utils.ts` — `encodeURL`, `hashCode` (salted URL encoding for the screenshot service), `cn` (Tailwind class merge).

Cross-app map logic like `location-modal-class-names.ts` is a migration candidate into `map/` in a later PR — not moved here. Grid vocabulary moved to `vocabulary/` in this PR.
