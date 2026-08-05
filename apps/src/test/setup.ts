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

// Two browser APIs the image-rastering tests exercise, each shimmed only when
// this jsdom leaves it undefined, so a jsdom that ships the real one keeps it.
// `README.md` in this folder records what was probed and why
// `requestAnimationFrame` stays on jsdom's own implementation.
if (typeof HTMLImageElement.prototype.decode !== 'function') {
	// Resolves rather than rejects, so tests exercise `waitForMarkerIcons`'s
	// decode path instead of its `.catch()` branch.
	HTMLImageElement.prototype.decode = (): Promise<void> => Promise.resolve();
}

if (typeof document.fonts === 'undefined') {
	// `prepareRaster` awaits `document.fonts.ready` alongside the marker-icon
	// and map-settle checks; this jsdom has no FontFaceSet.
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
