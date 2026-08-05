# `types/`

Shared TypeScript declarations.

A type belongs here when more than one module needs it.
A type used by a single component belongs in that component's own file, next to the props it describes.

- `types.ts` — the broad shared set, including map and chart data shapes.
- `climate-variable-interface.ts` — the climate-variable model and its enums, including `InteractiveRegionOption`.
- `assertions.ts`, `validations.ts` — runtime guards, with `assertions.test.ts` alongside.
- `download-form-interface.ts`, `progress-bar.ts` — narrower shared shapes.

## Touched this PR

- `types.ts` — `ZoomControlProps` removed.
  Only `ZoomButtons` ever used it, so it now lives in `components/ui/zoom-buttons.tsx` as `ZoomButtonsProps`, next to the component it describes.
