/**
 * Shared Tailwind class-name lists for the LocationModal's outer element.
 *
 * Instead of duplicating the class-name lists from the typical LocationModal
 * and the new `prepare-raster.ts` to mimick a click when it is attempted
 * to be reproduced from `/raster?url=` Python+Selenium service to make
 * map screenshots.
 */

/**
 * The look of a LocationModal's outer element: background, spacing, layout.
 * Consumed by `LocationModal` (`components/map-layers/location-modal.tsx`).
 */
export const LOCATION_MODAL_BASE_CLASS_NAMES = [
	'location-modal',
	'font-sans',
	'bg-white rounded-lg shadow-lg',
	'flex flex-col',
	'gap-6 p-6',
];

/**
 * Fixed corner placement inside `.leaflet-container` (Leaflet forces
 * `position: relative` on it).
 *  Not anchored to the clicked lat/lng — the modal doesn't move
 * to the marker.
 */
export const LOCATION_MODAL_POSITION_CLASS_NAMES = [
	'absolute z-50',
	'max-w-md w-full',
	'top-1/2 -translate-y-1/2',
	'left-1/2 -translate-x-1/2',
	'max-h-[calc(100%-10rem)]',
	// Medium screens and up: position from top left
	'md:z-30',
	'md:top-[10rem] md:translate-y-0',
	'md:left-16 md:translate-x-0',
	'md:max-h-[calc(100%-12rem)]',
];
