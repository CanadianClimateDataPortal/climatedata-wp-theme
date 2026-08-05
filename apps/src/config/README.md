# `config/`

Static configuration the apps read at runtime.
These are hand-maintained catalogues, not values fetched from WordPress or GeoServer.

- [`app.config.ts`](./app.config.ts) — scenario and version lists used to label controls.
- [`chart-config.ts`](./chart-config.ts) — Highcharts defaults per chart type.
- [`climate-variables.config.ts`](./climate-variables.config.ts) — the catalogue of climate variables, keyed by the `id` that appears in the Maps URL as `var=`.
- [`map.config.ts`](./map.config.ts) — Leaflet defaults.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- [`climate-variables.config.ts`](./climate-variables.config.ts) — grid names moved from bare strings to the `GridTypes` catalogue in `@/lib/vocabulary`.
  The catalogue gives every grid name one home, so renaming a grid is a change in one file and a typo surfaces as an unknown export.
  The field itself stays `gridType?: string | null` on `ClimateVariableConfigInterface`, so the config still accepts any string — the catalogue is a convention here, not an enforced type.
