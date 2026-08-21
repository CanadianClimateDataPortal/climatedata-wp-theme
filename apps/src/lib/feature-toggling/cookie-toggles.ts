import { readCookieEntries, type CookieEntries } from './cookie-jar';

/**
 * These functions answer three questions about a cookie.
 *
 * Choose the check that matches the behaviour being fenced.
 *
 * 1. If a specific cookie name is present, regardless of its value, use `hasCookie`.
 * 2. If a specific cookie name is present, and its string value is exactly `true`, use `isCookieTrue`.
 * 3. If a specific cookie name is present, and its string value is exactly `false`, use `isCookieFalse`.
 */

// Illustration.
// Use three named functions instead of one function with a mode argument.
// Each name states the question it answers, so the call site reads like the
// question a reviewer needs to check.
//
// The second parameter is the testing seam.
// Tests can pass `parseCookieString('FLAG=true')` without touching the DOM.
// Production code omits it and reads the live cookie jar.
/** Returns `true` when the cookie is set, regardless of its value. */
export const hasCookie = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.has(name);

// Illustration.
// A missing cookie and a cookie with the value `yes` both return `false` here.
// Treating an unrecognised value as off is the safe choice for a fence.
/** Returns boolean `true` when the cookie value string is exactly `'true'`. */
export const isCookieTrue = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'true';

// Illustration.
// This is not the negation of `isCookieTrue`.
// Both return `false` when the cookie is absent.
// This lets a caller distinguish "said no" from "said nothing".
/** Returns boolean `true` when the cookie value string is exactly `'false'`. */
export const isCookieFalse = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'false';
