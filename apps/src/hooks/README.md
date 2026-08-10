# `hooks/`

Shared React hooks; not a complete inventory of the folder.

- [`use-leaflet.ts`](./use-leaflet.ts) → `useLeaflet` — load-bearing despite appearances: [`App.tsx`](../App.tsx) discards the `config` it returns, but the module's `useEffect` restores `L.DomEvent.fakeStop` for `leaflet-search`, and its side-effect imports pull in Leaflet's stylesheet, `leaflet-search` and `leaflet.vectorgrid`. Dropping the unused return is safe; deleting the module strips the map's CSS and breaks the search control.
- [`use-leaflet-sync-container-class-name.tsx`](./use-leaflet-sync-container-class-name.tsx) → `useLeafletSyncContainerClassName` — re-applies a container `className` that react-leaflet freezes after first mount. A separate module from [`use-leaflet.ts`](./use-leaflet.ts) despite the name.
