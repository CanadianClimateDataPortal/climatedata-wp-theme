/**
 * Reads `document.cookie` and parses it only when its value changes.
 *
 * The browser returns the entire cookie jar as one string.
 * Reading that string is cheap, but splitting it into entries is not.
 * The cached entries are discarded when the cookie string changes.
 *
 * There is no timer or polling.
 * The cache is checked when a caller asks for the current entries.
 * A caller can therefore check cookies on every React render.
 */

export type CookieEntries = ReadonlyMap<string, string>;

/**
 * Turns `a=1; b=2` into `Map { 'a' => '1', 'b' => '2' }`.
 *
 * This function is pure, so it can be tested without a browser or framework.
 * Pass it a string and inspect the returned map.
 *
 * Pairs without `=` are skipped.
 * Both sides are trimmed because cookie entries are separated by `'; '`.
 */
export const parseCookieString = (raw: string): CookieEntries => {
	// Illustration.
	// Keep cookie-string parsing in this function.
	// All other functions in this module work with a `Map`.

	const entries = new Map<string, string>();

	for (const pair of raw.split(';')) {
		const separator = pair.indexOf('=');
		if (separator === -1) {
			// Illustration.
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

// The `typeof` guard keeps this module importable under Node.
// Unit tests can load it without a DOM.
const readRawCookieString = (): string =>
	typeof document === 'undefined' ? '' : document.cookie;

let cachedRaw: string | null = null;
let cachedEntries: CookieEntries = new Map();

/** Returns the current cookies, re-parsing them only when the cookie string changes. */
export const readCookieEntries = (): CookieEntries => {
	// Illustration.
	// This comparison is the entire cache.
	// Reading `document.cookie` uses one native getter.
	// Comparing the two short strings is inexpensive.
	// Parsing is the expensive step, so it runs only when the cookie jar changes.
	// A React component can therefore call this on every render.

	const raw = readRawCookieString();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedEntries = parseCookieString(raw);
	}

	return cachedEntries;
};

// Illustration, reactivity. Skip unless the question comes up.
//
// This module does not notify callers when a cookie changes.
// A toggle changes when someone edits a cookie and reloads the page.
// A caller that checks during render therefore gets the current value.
//
// To update the interface without a reload, add that behavior outside this module
// using infrastructure that the apps already have.
// React's `useSyncExternalStore` can subscribe a component to a value outside React.
// `@reduxjs/toolkit` can hold the shared state used by both apps and publish the
// result instead.
// Either approach would call `readCookieEntries` without changing it.
