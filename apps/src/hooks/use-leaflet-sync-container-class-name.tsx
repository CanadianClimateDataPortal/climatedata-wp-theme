import React, {
	useEffect,
	useRef,
} from 'react';

/**
 * Keeps a Leaflet map container's CSS class in sync with a `className` value after the
 * map has already mounted.
 *
 * react-leaflet@4.2.1's `<MapContainer>` destructures `className`, `id`, and `style` out
 * of its props and freezes all three together in a `useState` initializer that only runs
 * on the first render (`react-leaflet/lib/MapContainer.js:18-23`), then spreads that
 * frozen object onto the Leaflet container `<div>` later in the same file
 * (`react-leaflet/lib/MapContainer.js:53-55`). Prop changes after that first render are
 * never applied to any of the three. This is deliberate on
 * react-leaflet's part, not an oversight: capturing the values once instead of reading
 * live props on every render is what lets it keep reusing the same underlying Leaflet map
 * instance across re-renders rather than tearing it down and constructing a new one.
 *
 * This hook re-applies only `className`. `id` and `style` are frozen by that same
 * initializer and would silently stop tracking prop changes too — a caller passing a
 * computed `style` expecting it to update after mount would lose it the same way; that
 * case is not handled here.
 *
 * Keying `<MapContainer>` on `className` to force a remount on change was considered and
 * rejected: it would rebuild the underlying Leaflet map from scratch on every class
 * change, dropping any pairing set up against the live map instance — such as a
 * `leaflet.sync` pairing with another map on the page — and every tile already loaded.
 * Moving the class onto a wrapper element around the Leaflet container instead of onto
 * the container itself was also rejected: where the container sits inside a layout that
 * depends on matching DOM depth between multiple map instances (a CSS grid placing two
 * maps side by side, for example), wrapping only one of them breaks that symmetry. Syncing
 * the class onto the live container node imperatively avoids both problems.
 *
 * The class this hook applies is not always cosmetic. For the comparison pane in
 * `map.tsx`, it is also how `Global.css` tells the two panes apart while generating the
 * downloadable map image: a rule scoped to `.map-comparison-right` and the raster-capture
 * flag (`html[data-raster='true']`, see `prepare-raster.ts`) hides that pane's duplicate
 * info pill only while exporting. A class that fails to attach here changes nothing on
 * screen — it produces a wrong exported image, which a glance at the live app would not
 * catch.
 *
 * Whether a map needs this hook at all depends on when its class becomes final.
 * `<MapContainer>`'s comparison pane in `map.tsx` is only rendered once comparison mode is
 * already on, so its first render already carries the right class and react-leaflet's
 * frozen initializer never gets a chance to matter — it does not use this hook. Its
 * primary pane is always mounted, and has its `className` prop change after the fact
 * whenever comparison mode is toggled on or off; that is exactly the case react-leaflet's
 * freeze does not handle, and exactly why the primary pane calls this hook.
 *
 * @param map - Ref to the live Leaflet map instance, e.g. the ref passed to react-leaflet's
 * `<MapContainer ref={...}>`. No-ops while the ref is not yet populated.
 * @param className - The class name to keep applied to the map's container element.
 */
export const useLeafletSyncContainerClassName = (
	map: React.RefObject<L.Map | null>,
	className: string | undefined,
): void => {
	const appliedClassNameRef = useRef<string | undefined>(className);

	useEffect(() => {
		const leafletMap = map.current;
		if (!leafletMap) {
			return;
		}

		const previousClassName = appliedClassNameRef.current;
		const nextClassName = className;

		if (nextClassName === previousClassName) {
			return;
		}

		const container = leafletMap.getContainer();

		if (previousClassName) {
			L.DomUtil.removeClass(container, previousClassName);
		}
		if (nextClassName) {
			L.DomUtil.addClass(container, nextClassName);
		}

		appliedClassNameRef.current = nextClassName;
	}, [
		map,
		className,
	]);
};
