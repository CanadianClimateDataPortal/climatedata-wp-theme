/**
 * Shared Tailwind class-name lists for the `LocationModal`'s outer element.
 *
 * Two renders have to agree on them: the React components that mount the real
 * `LocationModal`, and `prepare-raster.ts`'s hand-built look-alike `<div>`,
 * which runs outside React to replay the popup for the screenshot service.
 *
 * Hoisted here rather than repeated as string literals, because a repeated
 * literal can drift — `md:left-16` typo'd into two junk classes, say —
 * silently repositioning the raster replay to the horizontal centre of the map
 * instead of the intended top-left corner.
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
 *
 * The corner is the anchor: the modal holds that spot whatever lat/lng was
 * clicked, and stays there as the marker moves.
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
