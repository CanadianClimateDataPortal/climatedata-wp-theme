# `lib/`

Core modules shared by both SPAs: the climate-variable class hierarchy, formatting and colour helpers, and the domain logic the React tree in [`components/`](../components/) calls into.

## Children

- [`map/`](./map/) — logic about the cartographic map itself, including the Download button's screenshot round trip. See its own README.
- [`vocabulary/`](./vocabulary/) — domain models as controlled vocabularies. See its own README.

## Residents worth knowing about

- [`location-modal-class-names.ts`](./location-modal-class-names.ts) — `LOCATION_MODAL_BASE_CLASS_NAMES` and `LOCATION_MODAL_POSITION_CLASS_NAMES`, the Tailwind classes the React `LocationModal` render path and its raster replay both have to agree on.
- [`utils.ts`](./utils.ts) — `encodeURL` and `hashCode` (salted URL encoding for the screenshot service), `cn` (Tailwind class merge).

[`location-modal-class-names.ts`](./location-modal-class-names.ts) is cross-app map logic, so [`map/`](./map/) is where it belongs; it stays here until a migration pass moves it.
