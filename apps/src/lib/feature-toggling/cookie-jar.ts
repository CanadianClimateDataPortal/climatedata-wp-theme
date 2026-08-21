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
 *
 * `cookieStore.addEventListener('change', …)` could provide an event-driven
 * implementation, but it is asynchronous and Chromium-only.
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
	const entries = new Map<string, string>();

	for (const pair of raw.split(';')) {
		const separator = pair.indexOf('=');
		if (separator === -1) {
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
const readRawCookieString = (): string =>
	typeof document === 'undefined' ? '' : document.cookie;

let cachedRaw: string | null = null;
let cachedEntries: CookieEntries = new Map();

/** Returns the current cookies, re-parsing them only when the cookie string changes. */
export const readCookieEntries = (): CookieEntries => {
	const raw = readRawCookieString();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedEntries = parseCookieString(raw);
	}

	return cachedEntries;
};
