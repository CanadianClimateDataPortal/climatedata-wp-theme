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
	// Cookie string syntax is handled here and nowhere else.
	// Every other function in this module works with a `Map`.

	const entries = new Map<string, string>();

	for (const pair of raw.split(';')) {
		const separator = pair.indexOf('=');
		if (separator === -1) {
			// Illustration.
			// A fragment without `=` is not a cookie.
			// `document.cookie` can hold one when a cookie was written badly.
			continue;
		}
		const name = pair.slice(0, separator).trim();
		if (name !== '') {
			entries.set(name, pair.slice(separator + 1).trim());
		}
	}

	return entries;
};

/** The only function in this module that touches the DOM. */
// Illustration.
// The `typeof` guard keeps the module importable under Node.
// A unit test can load this file without a DOM.
const readRawCookieString = (): string =>
	typeof document === 'undefined' ? '' : document.cookie;

let cachedRaw: string | null = null;
let cachedEntries: CookieEntries = new Map();

/** Returns the current cookies, re-parsing them only when the cookie string changes. */
export const readCookieEntries = (): CookieEntries => {
	// Illustration.
	// The comparison below is the entire cache.
	// Reading `document.cookie` costs one native getter.
	// Comparing two short strings costs close to nothing.
	// Parsing is the expensive step and it runs only when the jar changed.
	// A React component can therefore call this on every render, which is what
	// this module is for and where it stops.
	//
	// Nothing here tells anyone that a cookie changed.
	// A toggle changes when someone edits a cookie and reloads the page, so a
	// caller asking at render time already has the current answer.
	//
	// Reacting to a change without a reload would be built outside this module,
	// with what the apps already carry.
	// `useSyncExternalStore` from React subscribes a component to a value that
	// lives outside React.
	// `@reduxjs/toolkit` holds the shared state of both apps and could publish
	// the result instead.
	// Either one would call this function and keep it unchanged.

	const raw = readRawCookieString();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedEntries = parseCookieString(raw);
	}

	return cachedEntries;
};
