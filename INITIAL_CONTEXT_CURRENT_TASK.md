# Current Task Context

## Branch & Issue

**Branch:** `CLIM-1235_Map-Legend-under-LocationModal`
**Parent branch:** `CLIM-1233_Map-legend-opened-by-default`
**Issue:** CLIM-1235

**Original requirement:**

```markdown

# CLIM-1235: \[Map\] La légende et le "location popup" apparaissent l'un par dessus l'autre

Problème: quand on ouvre la légende et la “location popup” en même temps, la popup s’ouvre par dessus la légende, ce qui peut être agaçant.

<figure>
(image)
<figcaption>
very small sized browser window where we can clearly see that the LocationModal modal, a rectangle titled "Point (X, Y)", sub title "Seasonal to Decadal Forecast" and more headings and visualization and we can see it's overlapping on top of the map legend we can't see anything.)
</figcaption>
</figure>

Il faudrait que, lorsque la légende est ouverte, que la popup location s’ouvre plus vers la gauche pour ne pas se superposer à la légende.

Uniquement si le Forecast Display est “Forecast” (pas besoin si c’est “Climatology”)

```


## Work Session Contexts

Taking into account discoveries made in earlier (CLIM-1233) task.

### Map Markup

```html
<div class="leaflet-container">
  <div class="leaflet-control-container">
    <div class="leaflet-top leaflet-right">
      <!-- LEGEND -->
      <div class="legend-wrapper ... z-30 leaflet-control">
        <!-- legend content -->
      </div>
    </div>
  </div>
  <!-- LOCATION MODAL (sibling to leaflet-control-container) -->
  <div class="location-modal ... z-30">
    <!-- modal content -->
  </div>
</div>
```

Refer to `./INITIAL_CONTEXT_CURRENT_TASK_MAP_MARKUP.html`


### 2025-12-11

#### Analysis Notes

**Component Architecture:**
- LocationModal and Legend are sibling elements in the DOM
- Both use `z-30`, so paint order determines which appears on top
- LocationModal renders after Legend in component tree → covers legend

**Current Positioning:**
- Legend: `right-5` (~20px from right), max-width 430px, extends to ~450px from right edge
- LocationModal: `md:right-28` (~112px from right) on desktop
- Overlap: ~338px on desktop when both are open

**Communication Challenge:**
- Components don't share state directly
- Need a way for LocationModal to know when Legend is open
- Need to detect if they overlap spatially

#### Technical Decisions

**Approach: DOM Custom Events as Communication Channel**

Use the DOM as an event bus between React components. This is a valid React pattern using `useEffect` for side effects.

**Pattern:**
```typescript
// Legend broadcasts state changes
useEffect(() => {
  const event = new CustomEvent('legend:statechange', {
    bubbles: true,
    detail: { isOpen, rect, isForecastMode }
  });
  element.dispatchEvent(event);
}, [dependencies]);

// LocationModal listens and reacts
useEffect(() => {
  const handler = (e: Event) => { /* react to state */ };
  document.addEventListener('legend:statechange', handler);
  return () => document.removeEventListener('legend:statechange', handler);
}, [dependencies]);
