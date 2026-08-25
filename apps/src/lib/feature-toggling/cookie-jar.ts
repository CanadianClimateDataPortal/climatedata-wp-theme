/**
 * Reads `document.cookie` and parses it only when its value changes.
 *
 * The browser returns the entire cookie jar as one string.
 * Reading that string is cheap, but splitting it into entries is not.
 * The cached entries are discarded when the cookie string changes.
 */

import type { CookieEntries } from './types';

/**
 * Turns `a=1; b=2` into `Map { 'a' => '1', 'b' => '2' }`.
 *
 * This function is pure, so it can be tested without a browser or framework.
 *
 * Pairs without `=` are skipped.
 * Both sides are trimmed because cookie entries are separated by `'; '`.
 */
export const parseCookieString = (raw: string): CookieEntries => {
	// Keep cookie-string parsing in this function.
	// All other functions in this module work with a `Map`.

	const entries = new Map<string, string>();

	for (const pair of raw.split(';')) {
		const separator = pair.indexOf('=');
		if (separator === -1) {
			// Skip fragments without `=` because they are not valid cookies.
			// `document.cookie` can contain one if a cookie was written incorrectly.
			continue;
		}
		const name = pair.slice(0, separator).trim();
		if (name !== '') {
			entries.set(name, pair.slice(separator + 1).trim());
		}
	}

	return entries;
};

// The `typeof` guard keeps this module to be usable in unit tests without a DOM.
const readRawCookieString = (): string =>
	typeof document === 'undefined' ? '' : document.cookie;

let cachedRaw: string | null = null;
let cachedEntries: CookieEntries = new Map();

/** Returns the current cookies, re-parsing them only when the cookie string changes. */
export const readCookieEntries = (): CookieEntries => {
	// This comparison is the cache invalidation check.
	// Reading `document.cookie` uses one native getter.
	// Parsing is the expensive step, so it runs only when the cookie jar changes.
	// A React component can therefore call this on every render.

	const raw = readRawCookieString();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedEntries = parseCookieString(raw);
	}

	return cachedEntries;
};
