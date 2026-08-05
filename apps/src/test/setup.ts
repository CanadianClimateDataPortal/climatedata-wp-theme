/**
 * Setup file used when running vitest.
 */

import { expect } from 'vitest';
import L from 'leaflet';
import 'vitest'

interface CustomMatchers<R = unknown> {
	toBeSameDate: (expected: Date) => R;
}

declare module 'vitest' {
	interface Matchers<T = any> extends CustomMatchers<T> {}
}

global.L = L;

// Two platform shims jsdom lacks, each guarded so a future jsdom shipping the
// real thing wins over this shim. Probed empirically against this repo's jsdom
// on 2026-08-05 — `requestAnimationFrame` already exists here and stays
// unshimmed on purpose: the image-rastering settle loop needs the real one.
if (typeof HTMLImageElement.prototype.decode !== 'function') {
	// Resolves rather than rejects: `waitForMarkerIcons` always resolves
	// regardless of `decode()`'s outcome, so a rejecting shim would test its
	// `.catch()` branch instead of icon-decode behaviour itself.
	HTMLImageElement.prototype.decode = (): Promise<void> => Promise.resolve();
}

if (typeof document.fonts === 'undefined') {
	// `prepareRaster` awaits `document.fonts.ready` alongside the marker-icon
	// and map-settle checks; jsdom has no FontFaceSet at all.
	Object.defineProperty(document, 'fonts', {
		configurable: true,
		value: { ready: Promise.resolve() },
	});
}

interface ExpectationResult {
	pass: boolean;
	message: () => string;
	actual?: unknown;
	expected?: unknown;
}

expect.extend({
	/**
	 * Matcher checking if a Date instance is for the same date (year, month,
	 * day of the month) as an expected Date, without considering time.
	 *
	 * @param received - The Date to validate.
	 * @param expected - The expected Date.
	 */
	toBeSameDate(received: Date, expected: Date): ExpectationResult {
		const isDate = received instanceof Date;

		if (!isDate) {
			return {
				pass: false,
				message: () => `Expected ${received} to be a Date`,
				actual: received,
				expected: expected,
			};
		}

		const receivedDate = received.toDateString();
		const expectedDate = expected.toDateString();

		return {
			pass: receivedDate === expectedDate,
			message: () => `Expected ${receivedDate} to be same date as ${expectedDate}`,
			actual: received,
			expected: expected,
		};
	}
});
