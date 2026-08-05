import React, {
	useEffect,
	useRef,
} from 'react';
import L from 'leaflet';

/**
 * Keeps a Leaflet map container's CSS class in sync with a `className` value after the
 * map has mounted.
 *
 * react-leaflet@4.2.1's `<MapContainer>` destructures `className`, `id`, and `style` from
 * its props and freezes all three in a `useState` initializer that runs only on the first
 * render (`react-leaflet/lib/MapContainer.js:18-23`), then spreads that frozen object onto
 * the container `<div>` (`react-leaflet/lib/MapContainer.js:53-55`), so a later prop change
 * stays on the props and never reaches the DOM.
 * The freeze is deliberate: capturing once is what lets react-leaflet reuse the same
 * Leaflet map instance across re-renders instead of rebuilding it.
 *
 * This hook re-applies `className` alone.
 * A caller passing a computed `style` or `id` hits the same freeze and needs its own
 * remedy, and a container whose class is already final on its first render can skip this
 * hook entirely.
 *
 * Syncing imperatively is what keeps the map alive.
 * Forcing a remount with a `key` would rebuild the Leaflet instance and throw away loaded
 * tiles along with anything paired against it, such as a synced comparison map.
 *
 * @param map - Ref to the live Leaflet map instance.
 * Does nothing while the ref is still empty.
 * @param className - The class to hold on the container.
 * The previous value is removed before this one is added, so a caller can swap classes
 * freely; `undefined` clears whatever this hook last applied.
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
