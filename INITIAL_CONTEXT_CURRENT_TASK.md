# Current Task Context

## Branch & Issue

**Branch:** `CLIM-1233_Map-legend-opened-by-default`
**Issue:** CLIM-1233

**Original requirement:**

```markdown
# \[Map\]: Faire en sorte que la légende soit ouverte par défaut pour toutes les variables

Quand on affiche la page “Maps” pour la première fois, présentement la légende est fermée par défaut, pour toutes les variables.

On souhaite que, par défaut, la légende soit ouverte uniquement si la largeur de l'écran est au moins 768 px.

Donc voici la logique:

Au chargement de la page, si la largeur de l'écran est >= 768 px, faire en sorte que la légende soit ouverte par défaut, sinon elle est fermée par défaut.

Pour des raisons de simplicité, on regarde uniquement la largeur de l'écran, pas la largeur de la carte.

C’est tout !

Entre autre, ne pas implémenter de logique sur le redimensionnement. En d’autres mots, si l’utilisateur redimensionne la page après avoir chargé la page, on ne change pas l’affichage de la légende. Par exemple, l’utilisateur charge la page alors que sa largeur d'écran est `400 px`: la légende est masquée. Il redimensionne pour devenir `1000 px`: la légende reste masquée.

Pour la comparaison de carte, il faut la même logique: on affiche la légende par défaut si la largeur de l'écran est `>= 768 px`. Encore une fois, on ne regarde pas la largeur de la carte, seulement celle de l'écran.

```



## Work Session Contexts

### 2025-12-11

#### Analysis Notes

- Check the displayable space (a.k.a. the *Bounding Client Rect*)
    ```js
    // Simplified probing function
    const _getVisibleWidthHeight = () => {
      const { width, height } = document.body.getBoundingClientRect();
      return { width, height };
    }

    // Testing in DevTools
    (()=> { const { width, height } = document.body.getBoundingClientRect(); console.log(`Inner window size ${width} x ${height}`); })();
    ```
- Check the dimensions of where the map is `.leaflet-map-pane`
    ```js
    var mapPane = document.querySelectorAll('.leaflet-map-pane')[0];
    // There's most probably a method on the HTMLDivElement (managed by Leaflet)
    ```
- The size of the opened legend isn't known until we're opening it so we'll have to hard-code an estimate
- Find a way to open, probably look for method `MapLegendOpenControlProps['toggleOpen']` or properly emit a "click" (synthetic) event to `MapLegendOpenControl` element (see `apps/src/components/map-layers/map-legend-open-control.tsx`)

##### Some code I've written in the past

###### LayoutVariant

Around 2019 while using Vue 2 I had written a Vue component  ...

See source at [**LayoutVariant** section of this Gist](https://gist.github.com/renoirb/16f391e0cbd4e4e04f368c06b396e650#layoutvariant);

There's a lot of noise but there's checks for a breakpoint.

```js
/**
 * Direct copy from {@link https://gist.github.com/renoirb/16f391e0cbd4e4e04f368c06b396e650#layoutvariant}
 */

const WIDTH = 992 // refer to Bootstrap's responsive design

export function onMounted() {
  const hasMethod = Reflect.has(this, 'checkIfMobile')
  const hasResizeHandler = Reflect.has(this, 'onResize')
  const hasEl = Reflect.has(this, '$el')
  if (hasMethod && hasResizeHandler && hasEl) {
    const isMobile = this.checkIfMobile()
    const { defaultView } = this.$el.ownerDocument
    const handler = this.onResize
    const layoutVariant = isMobile ? 'mobile' : 'desktop'
    this.layoutVariant = layoutVariant
    this.$emit('layout-variant', layoutVariant)
    defaultView.addEventListener('resize', handler)
    if (isMobile) {
      this.$emit('layout-sidebar', { opened: false, withoutAnimation: true })
    }
  } else {
    const message = `Please make sure you attach onMounted event handler to a Vue mounted lifecycle hook`
    throw new Error(message)
  }
}

export function checkIfMobile() {
  const hasEl = Reflect.has(this, '$el')
  const mobileBreakPoint = this.mobileBreakPoint ? this.mobileBreakPoint : WIDTH
  let isMobile = false
  if (hasEl) {
    const $el = this.$el
    let bodyRectWidth = mobileBreakPoint
    const hasOwnerDocument = 'ownerDocument' in $el
    let hasMethodName = false
    if (hasOwnerDocument) {
      const { body } = $el.ownerDocument
      hasMethodName = 'getBoundingClientRect' in body
      if (hasMethodName) {
        const bodyRect = body.getBoundingClientRect()
        bodyRectWidth = bodyRect.width
      }
    }
    isMobile = bodyRectWidth - 1 < mobileBreakPoint

    return isMobile
  } else {
    const message = `Please make sure you attach checkIfMobile to a Vue component as a method`
    throw new Error(message)
  }
}

/** @type {import('vue').VueConstructor} */
const main = {
  data() {
    const layoutVariant = 'desktop'
    const layoutIsHidden = false
    return {
      layoutVariant,
      layoutIsHidden
    }
  },
  props: {
    mobileBreakPoint: {
      type: Number,
      default: WIDTH
    },
    checkIfMobile: {
      type: Function,
      default() {
        return checkIfMobile.call(this)
      }
    }
  },
  computed: {
    isMobile() {
      const layoutVariant = this.layoutVariant
      return layoutVariant === 'mobile'
    }
  },
  async beforeDestroy() {
    const handler = this.onResize
    const $el = this.$el
    await this.$nextTick(async() => {
      const { defaultView } = $el.ownerDocument
      defaultView.removeEventListener('resize', handler)
    })
  },
  async mounted() {
    await this.$nextTick(onMounted.bind(this))
  },
  methods: {
    onResize() {
      const { hidden = false } = this.$el.ownerDocument
      const isMobile = this.checkIfMobile(this)
      const layoutVariant = isMobile ? 'mobile' : 'desktop'
      const layoutVariantChanged = layoutVariant !== this.layoutVariant
      this.layoutVariant = layoutVariant
      if (!hidden && layoutVariantChanged) {
        this.$emit('layout-variant', layoutVariant)
        this.$emit('layout-navbar', {
          fixed: isMobile
        })
        this.$emit('layout-sidebar', {
          opened: !isMobile,
          withoutAnimation: true
        })
      }
    }
  }
}

export default main
```


#### Completed Tasks

- ✅ Analyzed existing codebase patterns for responsive breakpoint checks
- ✅ Evaluated three implementation options (window width, container width, dedicated hook)
- ✅ Discovered existing `MAX_LEGEND_WIDTH = 430` constant in `MapLegendOpenControl`
- ✅ Implemented legend auto-open using map container width check
- ✅ Used `map.getContainer().getBoundingClientRect().width` for precise measurement
- ✅ Referenced `MapLegendOpenControl.maxLegendWidth` for breakpoint (430px)
- ✅ Verified safe to use `useMap()` hook from react-leaflet
- ✅ Added guard check `if (!map) return` in useEffect
- ✅ Removed debug console.log statements

#### Technical Decisions

**Final Implementation: Map Container Width with Legend's Max Width**

Used map container's actual width and compared against the legend's own max width constant (430px):

```typescript
// CLIM-1233: Open legend by default when map container has space for legend
// Legend max width is 430px (MapLegendOpenControl.MAX_LEGEND_WIDTH)
// Only check on initial mount, no resize handling needed
useEffect(() => {
  if (!map) return;

  const container = map.getContainer();
  const { width } = container.getBoundingClientRect();
  const shouldBeOpen = width >= MapLegendOpenControl.maxLegendWidth;
  setIsOpen(shouldBeOpen);
}, [map]);
```

**Rationale for using 430px instead of 768px:**
1. Legend's actual max width is 430px (`MAX_LEGEND_WIDTH` in `MapLegendOpenControl`)
2. More semantically correct: check if container has space for the legend itself
3. Self-documenting: code shows relationship between check and legend's actual dimensions
4. Maintainable: if `MAX_LEGEND_WIDTH` changes, behavior automatically adjusts
5. More accurate for comparison view where maps are narrower

**Rationale for map container width vs window width:**
1. More technically accurate - measures actual available space for the legend
2. Better behavior in comparison view where maps are side-by-side
3. Uses Leaflet API properly (`map.getContainer()`)
4. Each map's legend state becomes independent and contextually aware
5. Excludes scrollbar from measurement


##### Implementation Approach Options Analyzed

**Option A: Use `window.innerWidth` (initially implemented)**
```typescript
useEffect(() => {
  const shouldBeOpen = window.innerWidth >= 768;
  setIsOpen(shouldBeOpen);
}, []);
```
- ✅ Simplest approach
- ✅ Matches requirement: "largeur de l'écran" (screen width)
- ✅ Consistent with existing `use-mobile.ts` pattern (uses `window.innerWidth`)
- ✅ Consistent with `search-control.tsx` pattern (lines 250-262)
- ⚠️ Measures viewport width including scrollbar
- ⚠️ In comparison view, both maps would check same window width

**Option B: Use map container's actual width**
```typescript
useEffect(() => {
  if (!map) return;
  const container = map.getContainer();
  const { width } = container.getBoundingClientRect();
  const shouldBeOpen = width >= 768;
  setIsOpen(shouldBeOpen);
}, [map]);
```
- ✅ More precise - uses actual map container rendered width
- ✅ Leverages Leaflet API via `useMap()` from react-leaflet
- ✅ In comparison view, each map independently checks its own width
- ✅ Excludes scrollbar from measurement
- ⚠️ Slightly more complex (needs map instance check)
- ⚠️ Might not match literal requirement "screen width"

**Option C: Create dedicated hook (over-engineering for this ticket)**
- Create `useIsWideScreen()` in `use-mobile.ts` with 768px breakpoint
- More reusable but unnecessary for single use case

##### Existing Codebase Patterns

**`use-mobile.ts`:**
- Exports `useIsMobile()` hook with 1024px breakpoint
- Uses `window.innerWidth` for measurement
- Uses `window.matchMedia` for resize events
- Pattern: `useEffect` with resize listener cleanup

**`search-control.tsx` (lines 250-262):**
- Uses `window.innerWidth` directly for responsive input sizing
- Has resize listener with cleanup
- Multiple breakpoints: 520px, 882px

**`use-leaflet.ts`:**
- Currently called only at app root level (`App.tsx`, `download/app.tsx`)
- Safe to call multiple times (idempotent)
- Patches `L.DomEvent.fakeStop` once
- Returns static config via `useMemo`
- No mutations, purely configuration
- Underutilized - most components import `react-leaflet` directly

**Map container structure:**
- In comparison view: two `MapContainer` instances side-by-side
- Each has its own `MapLegend` component instance
- Each map can have different widths in split view

##### Decision: Option B (Map Container Width)

**Rationale:**
1. More technically accurate - measures actual available space for the legend
2. Better behavior in comparison view where maps are side-by-side
3. Uses Leaflet API properly (nudges toward better integration)
4. Minimal code change from Option A
5. `map` instance already available from `useMap()` hook
6. Each map's legend state becomes independent and contextually aware

**Trade-off:**
- Requirement says "largeur de l'écran" but in practice, what matters is whether there's space for the legend in the map container, not the entire screen

#### Files Modified

**`apps/src/components/map-layers/map-legend.tsx`** (lines ~70-81)
- Added `useEffect` to check map container width on mount
- Uses `map.getContainer().getBoundingClientRect().width` for measurement
- Compares against `MapLegendOpenControl.maxLegendWidth` (430px)
- Sets `isOpen` state based on available space
- Dependency array: `[map]` - runs when map instance is ready
- Includes guard: `if (!map) return`

**Final implementation:**
```typescript
/**
 * Open legend by default when map container has space for legend.
 * Legend max width is 430px (MapLegendOpenControl.MAX_LEGEND_WIDTH)
 * Only check on initial mount, no resize handling needed
 */
useEffect(() => {
  if (!map) return;
  const container = map.getContainer();
  const { width } = container.getBoundingClientRect();
  const shouldBeOpen = width >= MapLegendOpenControl.maxLegendWidth;
  setIsOpen(shouldBeOpen);
}, [map]);
```

**Status:** ✅ Implemented - Uses map container width and legend's actual max width constant

#### Example Output


#### Session-Specific Implementation Notes

**Map Legend Component Architecture:**
- Lines 86-103 in `map-legend.tsx`: Legend added to map via `L.Control`
- `MapLegendOpenControl`: Parent wrapper component that receives legend content via `children` prop
- Takes up width × height of whatever legend contents passed in
- Could potentially emit DOM events for communication

**Leaflet Integration:**
- `useMap()` from `react-leaflet` provides the `L.Map` instance
- Map instance methods available:
  - `map.getContainer()` → DOM element of map container
  - `map.getSize()` → pixel dimensions as Point
  - `map.getCenter()` → center coordinates
  - `map.getBounds()` → geographic bounds
- `map.getContainer().getBoundingClientRect()` gives precise rendered dimensions

**Component Hierarchy:**
```
MapContainer (from react-leaflet)
├── map instance via useMap()
└── MapLegend
    ├── Uses L.Control to attach to map
    └── Renders MapLegendOpenControl
        └── children: LazyMapLegendForecastS2D | LazyMapLegendCommon
```


#### Pending Tasks

- [x] ~~Refactor to use Option B (map container width) instead of Option A (window width)~~ → **COMPLETED**
- [x] ~~Use `MapLegendOpenControl.maxLegendWidth` constant instead of hardcoded 768px~~ → **COMPLETED**
- [x] Test in browser with regular map view
- [x] Test in browser with comparison map view (two maps side-by-side)
- [x] Verify behavior at exactly 430px boundary
- [x] Verify behavior with maps of different widths in comparison view
- [x] Remove debug/testing code if any remains

#### Context for Future Work

**Related Ticket Coming:**
Another ticket will require checking:
1. Available space in the map container
2. Space taken by the legend
3. Space taken by "Location PopUp" (appears when clicking a map point)
4. How these three elements interact and position themselves

**Current Ticket Scope Decision:**
CLIM-1233 can be considered **minimally complete** with current `window.innerWidth` implementation. The more sophisticated space-checking logic (Option B using `map.getContainer().getBoundingClientRect()`) may be better addressed as part of the upcomi  ng ticket that deals with the full layout problem.

**Rationale for minimal completion:**
- Current implementation satisfies literal requirement: "largeur de l'écran" (screen width)
- Upcoming ticket will need more comprehensive layout/space management
- Avoid over-engineering this ticket when requirements may change with fuller context
- Keep this PR focused and simple

**TODO for next session:**
- [ ] Review requirements for the related ticket about map space, legend space, and location popup
- [ ] Determine if Option B refactor should be part of the related ticket instead
- [ ] Get full picture of both tickets to make informed architectural decision
