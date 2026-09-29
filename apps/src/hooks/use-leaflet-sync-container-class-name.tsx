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
 * the container `<div>` (`react-leaflet/lib/MapContainer.js:53-55`). Later prop changes are
 * never applied. The freeze is deliberate — capturing once is what lets react-leaflet reuse
 * the same Leaflet map instance across re-renders instead of rebuilding it.
 *
 * All three props are frozen, but this hook re-applies only `className`; a caller passing
 * a computed `style` hits the same trap. A container whose class is already final on its
 * first render does not need this hook at all.
 *
 * Forcing a remount via a `key` instead of syncing imperatively would rebuild the Leaflet
 * instance, losing loaded tiles and anything paired against it.
 *
 * @param map - Ref to the live Leaflet map instance. No-ops while the ref is not yet
 * populated.
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
