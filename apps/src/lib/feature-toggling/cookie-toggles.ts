import { readCookieEntries } from './cookie-jar';
import type { CookieEntries } from './types';

/**
 * These functions answer three questions about a cookie.
 *
 * Choose the check that matches the behaviour being fenced.
 *
 * 1. If a specific cookie name is present, regardless of its value, use `hasCookie`.
 * 2. If a specific cookie name is present, and its string value is exactly `true`, use `isCookieTrue`.
 * 3. If a specific cookie name is present, and its string value is exactly `false`, use `isCookieFalse`.
 */

/** Returns `true` when the cookie is set, regardless of its value. */
export const hasCookie = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.has(name);

/** Returns boolean `true` when the cookie value string is exactly `'true'`. */
export const isCookieTrue = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'true';

/** Returns boolean `true` when the cookie value string is exactly `'false'`. */
export const isCookieFalse = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'false';
