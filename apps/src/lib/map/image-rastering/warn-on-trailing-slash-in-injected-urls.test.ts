import { afterEach, describe, expect, test, vi } from 'vitest';

import { warnOnTrailingSlashInInjectedUrls } from './warn-on-trailing-slash-in-injected-urls';

/**
 * Tests for {@link warnOnTrailingSlashInInjectedUrls}'s reporting contract.
 *
 * The globals under test are rendered into the page from server-side configuration
 * and can also be overridden by hand from the browser's devtools console, which is
 * the case no URL-building code can defend against.
 * These tests pin what the function reports: one warning per offending global, naming
 * that global, and silence for every value that is already well formed.
 *
 * `window` is the real jsdom one the module reads, which is why `afterEach` clears
 * both globals rather than restoring a module mock.
 */

const CLEAN_DATA_URL = 'https://dataclimatedata.example.test';

afterEach(() => {
	window.DATA_URL = '';
	delete window.MAP_RASTER_PROXYPHP_DATA_URL;
	vi.restoreAllMocks();
});

describe('warnOnTrailingSlashInInjectedUrls', () => {
	test('warns and names the global when window.DATA_URL carries a trailing slash', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		window.DATA_URL = `${CLEAN_DATA_URL}/`;
		window.MAP_RASTER_PROXYPHP_DATA_URL = CLEAN_DATA_URL;

		warnOnTrailingSlashInInjectedUrls();

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('window.DATA_URL carries a trailing slash'),
		);
	});

	test('warns and names the global when window.MAP_RASTER_PROXYPHP_DATA_URL carries a trailing slash', () => {
		// The optional global is reported on its own merits, so a well-formed
		// window.DATA_URL alongside it cannot mask the one that needs fixing.
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		window.DATA_URL = CLEAN_DATA_URL;
		window.MAP_RASTER_PROXYPHP_DATA_URL = `${CLEAN_DATA_URL}/`;

		warnOnTrailingSlashInInjectedUrls();

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining(
				'window.MAP_RASTER_PROXYPHP_DATA_URL carries a trailing slash',
			),
		);
	});

	test('stays silent when neither global carries a trailing slash', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		window.DATA_URL = CLEAN_DATA_URL;
		window.MAP_RASTER_PROXYPHP_DATA_URL = CLEAN_DATA_URL;

		warnOnTrailingSlashInInjectedUrls();

		expect(warn).not.toHaveBeenCalled();
	});

	test('stays silent when the optional global is absent', () => {
		// A deployment without the same-origin raster proxy never defines that
		// global, and that is a supported state rather than a misconfiguration.
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		window.DATA_URL = CLEAN_DATA_URL;
		delete window.MAP_RASTER_PROXYPHP_DATA_URL;

		warnOnTrailingSlashInInjectedUrls();

		expect(warn).not.toHaveBeenCalled();
	});
});
