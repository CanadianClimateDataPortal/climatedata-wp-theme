/**
 * @file LocationModal Popup Fixtures — Shared Example HTML
 *
 * Realistic `LocationModal` markup, and the DOM-mounting helper that plants
 * it, used across this namespace's sender-side tests: the popup content
 * `getLocationModalInnerHTML` scrapes and `createPrepareRasterPostHttpPayload`
 * carries in its payload.
 *
 * @see {@link PrepareRasterPostHttpPayload.locationPopupHtml} — the shape this markup fills
 * @see {@link getLocationModalInnerHTML} — the scraper this markup exercises
 * @see {@link createPrepareRasterPostHttpPayload} — the payload builder this markup exercises
 */

import type { PrepareRasterPostHttpPayload } from './types';

/**
 * Realistic `LocationModal` markup carrying two `data-raster="false"` nodes —
 * the close button and the "See details" link — both stripped by
 * `prepareRaster` before capture.
 *
 * @param title - The location title rendered in the popup heading.
 * @returns HTML matching a mounted `LocationModal`'s content.
 */
export const createExampleLocationPopupHtml = (
	title: string,
): string => {
	const template = `
		<button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none" data-raster="false" aria-label="Close Modal">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
		</button>
		<div class="min-h-0 overflow-y-auto">
			<h2 class="mb-1 text-2xl font-semibold leading-7 text-cdc-black">${title}</h2>
			<p class="m-0 text-sm leading-5 text-neutral-grey-medium">Statistically Downscaled Global Climate Projections - Hottest Day - CMIP6 - SSP2-4.5</p>
			<div class="mt-4 mb-4">
				<div class="mb-3 flex">
					<div class="w-1/2">
						<div class="font-semibold text-brand-blue mb-1 text-2xl">- 29.2 °C</div>
						<div class="">
							<div class="text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider">Median</div>
							<div class="text-xs text-neutral-grey-medium">(1782 - 2050)</div>
						</div>
					</div>
					<div class="w-1/2">
						<div class="font-semibold text-brand-blue mb-1 text-2xl">-2.2 °C</div>
						<div class="">
							<div class="text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider whitespace-nowrap">Relative to baseline</div>
							<div class="text-xs text-neutral-grey-medium">(1782 - 2000)</div>
						</div>
					</div>
				</div>
				<div>
					<div class="font-semibold text-brand-blue mb-1 text-2xl">23.8 to 26.9 °C</div>
					<div class="text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider">Range</div>
				</div>
			</div>
			<p class="text-right" data-raster="false">
				<a href="#" aria-label="Go to details section" class="text-sm font-normal leading-6">
					<span class="inline-flex items-center gap-2 text-brand-blue">See details<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
				</a>
			</p>
		</div>
	`;
	return template;
};

/**
 * A defined, two-pane `PrepareRasterPostHttpPayload` — compare-mode shape,
 * for tests that need a ready-made payload rather than a mounted DOM.
 *
 * `markerLatLon` is the geographic centre of Canada, a recognizable
 * placeholder rather than an arbitrary invented coordinate.
 */
export const EXAMPLE_PREPARE_RASTER_POST_PAYLOAD: PrepareRasterPostHttpPayload = {
	locationPopupHtml: [
		createExampleLocationPopupHtml('Left LocationModal Example'),
		createExampleLocationPopupHtml('Right LocationModal Example'),
	],
	markerLatLon: [62.52753, -98.52539],
};

/**
 * Mounts a `LocationModal` fixture at `#location-modal-{id}`, matching the
 * DOM shape `getLocationModalInnerHTML` scrapes from the real component.
 *
 * @param id - Suffix for the mounted element's id, e.g. `'a'` for the left/main pane.
 * @param title - Forwarded to {@link createExampleLocationPopupHtml}.
 * @returns The mounted host element, for assertions against its own `innerHTML`.
 */
export const renderLocationModal = (
	id: string,
	title: string,
): HTMLElement => {
	const el = document.createElement('div');
	el.id = `location-modal-${id}`;
	el.innerHTML = createExampleLocationPopupHtml(title);
	document.body.appendChild(el);
	return el;
};
