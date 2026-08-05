import { describe, expect, test } from 'vitest';

import { resolveRasterFetchTarget } from './resolve-raster-fetch-target';

describe('resolveRasterFetchTarget', () => {
	test('returns the page URL directly when the proxy is enabled', () => {
		const mapUrl = new URL('https://dev-en.climatedata.ca/maps/?var=hottest_day');

		const target = resolveRasterFetchTarget(mapUrl, true);

		expect(target).toBe(mapUrl.href);
	});

	test('falls back to the encoded screenshot-service URL when the proxy flag is absent', () => {
		window.DATA_URL = 'https://dataclimatedata.example.test';
		window.URL_ENCODER_SALT = 'test-salt';
		const mapUrl = new URL('https://dev-en.climatedata.ca/maps/?var=hottest_day');

		const target = resolveRasterFetchTarget(mapUrl, undefined);

		expect(target.startsWith(`${window.DATA_URL}/raster?url=`)).toBe(true);
	});

	test('falls back to the encoded screenshot-service URL when the proxy flag is explicitly false', () => {
		window.DATA_URL = 'https://dataclimatedata.example.test';
		window.URL_ENCODER_SALT = 'test-salt';
		const mapUrl = new URL('https://dev-en.climatedata.ca/maps/?var=hottest_day');

		const target = resolveRasterFetchTarget(mapUrl, false);

		expect(target.startsWith(`${window.DATA_URL}/raster?url=`)).toBe(true);
	});
});
