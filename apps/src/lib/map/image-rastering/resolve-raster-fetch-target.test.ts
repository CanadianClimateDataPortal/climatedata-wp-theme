import { describe, expect, test } from 'vitest';

import { resolveRasterFetchTarget } from './resolve-raster-fetch-target';

const MAP_PAGE_ADDRESS = 'https://dev-en.climatedata.ca/maps/?var=hottest_day';

describe('resolveRasterFetchTarget', () => {
	test('targets the map page itself when a proxy data URL is present', () => {
		const mapUrl = new URL(MAP_PAGE_ADDRESS);

		const target = resolveRasterFetchTarget(mapUrl, 'https://raster.example.test');

		expect(target).toBe(MAP_PAGE_ADDRESS);
	});

	test('targets the map page itself when the proxy data URL repeats the screenshot service address', () => {
		// The proxy may forward to the very address the fallback branch would have
		// called, so presence has to decide the branch rather than the value.
		window.DATA_URL = 'https://dataclimatedata.example.test';
		window.URL_ENCODER_SALT = 'test-salt';
		const mapUrl = new URL(MAP_PAGE_ADDRESS);

		const target = resolveRasterFetchTarget(mapUrl, window.DATA_URL);

		expect(target).toBe(MAP_PAGE_ADDRESS);
	});

	test('falls back to the encoded screenshot-service URL when the proxy data URL is absent', () => {
		window.DATA_URL = 'https://dataclimatedata.example.test';
		window.URL_ENCODER_SALT = 'test-salt';
		const mapUrl = new URL(MAP_PAGE_ADDRESS);

		const target = resolveRasterFetchTarget(mapUrl, undefined);

		expect(target.startsWith(`${window.DATA_URL}/raster?url=`)).toBe(true);
	});

	test('falls back to the encoded screenshot-service URL when the proxy data URL is an empty string', () => {
		// An environment variable rendered into the page as `""` reaches here as an
		// empty string, and that is a deployment without a proxy rather than one with.
		window.DATA_URL = 'https://dataclimatedata.example.test';
		window.URL_ENCODER_SALT = 'test-salt';
		const mapUrl = new URL(MAP_PAGE_ADDRESS);

		const target = resolveRasterFetchTarget(mapUrl, '');

		expect(target.startsWith(`${window.DATA_URL}/raster?url=`)).toBe(true);
	});
});
