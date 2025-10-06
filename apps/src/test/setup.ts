/**
 * Setup file used when running vitest.
 */

import { expect } from 'vitest';
import L from 'leaflet';
import 'vitest'

interface CustomMatchers<R = unknown> {
	toBeSameDate: (expected: Date) => R
}

declare module 'vitest' {
	interface Matchers<T = any> extends CustomMatchers<T> {}
}

global.L = L;

interface ExpectationResult {
	pass: boolean
	message: () => string
	actual?: unknown
	expected?: unknown
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
			}
		}

		const receivedDate = received.toDateString();
		const expectedDate = expected.toDateString();

		return {
			pass: receivedDate === expectedDate,
			message: () => `Expected ${receivedDate} to be same date as ${expectedDate}`,
			actual: received,
			expected: expected,
		}
	}
});
