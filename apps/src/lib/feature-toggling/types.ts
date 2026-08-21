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
