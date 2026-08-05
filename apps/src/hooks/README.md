# `hooks/`

Shared React hooks.
A hook belongs here when more than one component needs it, or when it isolates a workaround worth naming.

## `use-leaflet.ts` is load-bearing

`useLeaflet()` looks disposable, because `App.tsx` calls it and discards the `config` object it returns.
That return value is indeed unused. The module is not.

Two things keep it alive:

- Its `useEffect` patches `L.DomEvent.fakeStop` on every mount, at both call sites. Leaflet removed that function years ago; `leaflet-search` still calls it.
- Its side-effect imports pull in Leaflet's own stylesheet along with `leaflet-search` and `leaflet.vectorgrid`.

Deleting the module strips the map's CSS and breaks the search control.
Dropping only the unused `config` return is safe; dropping the module is not.

## Documented so far

These entries cover the files worked on to date, and this is not a complete inventory of the folder.

- `use-leaflet-sync-container-class-name.tsx` → `useLeafletSyncContainerClassName` — re-applies a container `className` react-leaflet freezes after first mount.
  A separate, unrelated module from `use-leaflet.ts` above, despite the similar name.
