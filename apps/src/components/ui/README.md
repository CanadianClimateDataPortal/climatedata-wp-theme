# `components/ui/`

Generic presentation primitives, shared by both SPAs.

A component belongs here when its path, filename and export name are free of climate-domain vocabulary.
Anything naming a variable, a grid, a region or a dataset belongs in a domain folder instead, even when it looks generic today.

## Touched this PR

- `sidebar.tsx` → `Sidebar`, `SidebarTrigger`, `SidebarRail` — the collapsible left panel.
  The three of them gained `data-raster="false"` so the panel and its toggles drop out of the exported map image.
  `SidebarTrigger` and `SidebarRail` also moved from a shared `id="sidebar-toggle"` to a `sidebar-toggle` class, since both render at once and an id has to stay unique.
- `zoom-buttons.tsx` → `ZoomButtons` — the plus/minus pair.
  Owns its `ZoomButtonsProps` locally rather than importing a shared type, and generates a unique wrapper id so two maps can render side by side.

`data-raster` and `to-raster` have one home: `apps/src/lib/map/image-rastering/README.md`.
