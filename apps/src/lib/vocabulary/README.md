# `lib/vocabulary/`

Domain models as controlled vocabularies: each file defines a term, its permitted values, and what holds of each.
Values are declared with the record pattern — an `as const` object plus a union type derived from it — which keeps the permitted values greppable and the type in step with them.

## Residents

- [`grid-resolution.ts`](./grid-resolution.ts) — `GridTypes`, the grid identities, each with its cell size in degrees and the matching label in kilometres.

Other vocabularies are still `enum`s in [`types/climate-variable-interface.ts`](../../types/climate-variable-interface.ts), and belong here as they migrate.
