import { describe, test, expect, afterEach } from 'vitest';
import { createFetchRequestInitOptions, createPrepareRasterPostHttpPayload } from './prepare-raster';
import { createExampleLocationPopupHtml } from './prepare-raster.examples';

const renderLocationModal = (id: string, title: string): void => {
	const el = document.createElement('div');
	el.id = `location-modal-${id}`;
	el.innerHTML = createExampleLocationPopupHtml(title);
	document.body.appendChild(el);
};

afterEach(() => {
	document.body.innerHTML = '';
});

describe('createPrepareRasterPostHttpPayload', () => {
	test('returns undefined when no popup is open, regardless of markerLatLon', () => {
		expect(createPrepareRasterPostHttpPayload([45.5, -73.6])).toBeUndefined();
		expect(createPrepareRasterPostHttpPayload(null)).toBeUndefined();
	});

	test('returns undefined when a popup is open but no location is selected', () => {
		renderLocationModal('a', 'Left Example');
		expect(createPrepareRasterPostHttpPayload(null)).toBeUndefined();
	});

	test('carries a single popup and the selected location', () => {
		renderLocationModal('a', 'Left Example');
		const markerLatLon: [number, number] = [45.5, -73.6];

		const payload = createPrepareRasterPostHttpPayload(markerLatLon);

		expect(payload).toBeDefined();
		expect(payload?.markerLatLon).toEqual(markerLatLon);
		expect(payload?.locationPopupHtml).toHaveLength(1);
		expect(payload?.locationPopupHtml[0]).toContain('Left Example');
	});

	test('carries both popups in compare mode', () => {
		renderLocationModal('a', 'Left Example');
		renderLocationModal('b', 'Right Example');
		const markerLatLon: [number, number] = [62.5, -98.5];

		const payload = createPrepareRasterPostHttpPayload(markerLatLon);

		expect(payload?.locationPopupHtml).toHaveLength(2);
		expect(payload?.locationPopupHtml[0]).toContain('Left Example');
		expect(payload?.locationPopupHtml[1]).toContain('Right Example');
	});
});

describe('createFetchRequestInitOptions', () => {
	test('omits the request body when no payload is given', () => {
		const options = createFetchRequestInitOptions();
		expect(options.body).toBeUndefined();
		expect(options.method).toBe('POST');
	});

	test('serializes the payload as the JSON request body', () => {
		const payload = {
			locationPopupHtml: ['<div>content</div>'] as [string, string?],
			markerLatLon: [45.5, -73.6] as [number, number],
		};

		const options = createFetchRequestInitOptions(payload);

		expect(options.body).toBe(JSON.stringify(payload));
	});
});
