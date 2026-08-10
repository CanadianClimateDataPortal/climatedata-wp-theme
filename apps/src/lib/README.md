# `lib/`

Core modules shared by both SPAs: the climate-variable class hierarchy, formatting and colour helpers, and the domain logic the React tree in [`components/`](../components/) calls into. Not a complete inventory of the folder.

- [`map/`](./map/) — the map as a cartographic object, including the downloaded map image. See its own README.
- [`vocabulary/`](./vocabulary/) — domain models as controlled vocabularies. See its own README.
- [`location-modal-class-names.ts`](./location-modal-class-names.ts) — `LOCATION_MODAL_BASE_CLASS_NAMES` and `LOCATION_MODAL_POSITION_CLASS_NAMES`, the Tailwind classes `LocationModal` and its raster replay must agree on. Cross-app map logic, so [`map/`](./map/) is where it belongs until a migration pass moves it.
- [`utils.ts`](./utils.ts) — `encodeURL` and `hashCode` (salted URL encoding for the screenshot service), `cn` (Tailwind class merge).
