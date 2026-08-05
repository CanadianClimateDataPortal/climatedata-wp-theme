# `types/`

Shared TypeScript declarations.

A type belongs here when more than one module needs it.
A type used by a single component belongs in that component's own file, next to the props it describes.

- [`types.ts`](./types.ts) — the broad shared set, including map and chart data shapes.
- [`climate-variable-interface.ts`](./climate-variable-interface.ts) — the climate-variable model and its enums, including `InteractiveRegionOption`.
- [`assertions.ts`](./assertions.ts), [`validations.ts`](./validations.ts) — runtime guards, with [`assertions.test.ts`](./assertions.test.ts) alongside.
- [`download-form-interface.ts`](./download-form-interface.ts), [`progress-bar.ts`](./progress-bar.ts) — narrower shared shapes.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- [`types.ts`](./types.ts) — `ZoomControlProps` removed.
  Only `ZoomButtons` ever used it, so it now lives in [`components/ui/zoom-buttons.tsx`](../components/ui/zoom-buttons.tsx) as `ZoomButtonsProps`, next to the component it describes.
