# `lib/vocabulary/`

Domain models as controlled vocabularies: each file defines a term, its permitted values, and what holds of each. Record pattern (`as const` object plus derived union type) instead of TS `enum`.

- [`grid-resolution.ts`](./grid-resolution.ts) — `GridTypes`, grid identity and land area per cell.

More vocabularies still live as `enum`s in [`types/climate-variable-interface.ts`](../../types/climate-variable-interface.ts) and belong here as they migrate.
