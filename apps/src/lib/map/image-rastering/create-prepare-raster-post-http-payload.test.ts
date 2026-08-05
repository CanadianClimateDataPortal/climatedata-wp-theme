import L from 'leaflet';
import { afterEach, describe, expect, test } from 'vitest';

import { createPrepareRasterPostHttpPayload } from './create-prepare-raster-post-http-payload';
import { renderLocationModal } from './types.examples';

// Left ('a') then right ('b') pane ids, indexed by mount order.
const MODAL_IDS = ['a', 'b'] as const;

const EXAMPLE_LATLNG: L.LatLngLiteral = {
	lat: 45.5,
	lng: -73.6,
};

afterEach(() => {
	document.body.innerHTML = '';
});

describe('createPrepareRasterPostHttpPayload', () => {
	test('returns undefined when no popup is open (never a payload with empty locationPopupHtml)', () => {
		expect(createPrepareRasterPostHttpPayload(EXAMPLE_LATLNG)).toBeUndefined();
	});

	test.each([
		{ titles: ['Left Example'], expectedLength: 1 },
		{ titles: ['Left Example', 'Right Example'], expectedLength: 2 },
	])(
		'returns a defined payload with locationPopupHtml length $expectedLength',
		({ titles, expectedLength }) => {
			titles.forEach((title, index) => renderLocationModal(MODAL_IDS[index], title));

			const payload = createPrepareRasterPostHttpPayload(EXAMPLE_LATLNG);

			expect(payload).toBeDefined();
			expect(payload?.locationPopupHtml).toHaveLength(expectedLength);
		},
	);

	test('converts an L.LatLngLiteral object into a [lat, lng] tuple', () => {
		renderLocationModal('a', 'Left Example');

		const payload = createPrepareRasterPostHttpPayload(EXAMPLE_LATLNG);

		expect(payload?.markerLatLon).toEqual([EXAMPLE_LATLNG.lat, EXAMPLE_LATLNG.lng]);
	});
});
