import { afterEach, describe, expect, test } from 'vitest';

import { waitForMarkerIcons } from './wait-for-marker-icons';

/**
 * Regression tests for {@link waitForMarkerIcons}'s never-rejects contract.
 *
 * The selector is restricted to `img.leaflet-marker-icon` because `L.DivIcon`
 * puts the same class on a `<div>` carrying inline SVG with nothing to fetch.
 */
describe('waitForMarkerIcons', () => {
	afterEach(() => {
		// jsdom keeps DOM nodes alive across tests in the same file otherwise.
		document.body.innerHTML = '';
	});

	test('resolves with no leaflet-marker-icon present', async () => {
		await expect(waitForMarkerIcons()).resolves.toEqual([]);
	});

	test('resolves rather than rejects when decode() rejects on a marker icon', async () => {
		const icon = document.createElement('img');
		icon.className = 'leaflet-marker-icon';
		icon.decode = (): Promise<void> => Promise.reject(new Error('decode failed'));
		document.body.appendChild(icon);

		await expect(waitForMarkerIcons()).resolves.toEqual([undefined]);
	});

	test('ignores a div.leaflet-marker-icon (the L.DivIcon case)', async () => {
		const icon = document.createElement('div');
		icon.className = 'leaflet-marker-icon';
		document.body.appendChild(icon);

		await expect(waitForMarkerIcons()).resolves.toEqual([]);
	});
});
