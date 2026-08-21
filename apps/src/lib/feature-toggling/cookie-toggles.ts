import { readCookieEntries, type CookieEntries } from './cookie-jar';

/**
 * These functions answer three questions about a cookie.
 *
 * Choose the check that matches the behaviour being fenced.
 * Widening a dropdown for someone using the DevTools console is safe behind
 * `hasCookie`.
 * A feature that must stay off until someone explicitly enables it belongs behind
 * `isCookieTrue`, where an unreadable value counts as "no".
 *
 * `isCookieTrue` and `isCookieFalse` are opposites only when the cookie is present
 * and its value is exactly `true` or `false`.
 * If the cookie is absent or has any other value, both return `false`.
 *
 * These checks do not establish trust.
 * A visitor can set any cookie from the console.
 * That is acceptable while a toggle changes only what a dropdown lists, but not
 * when a toggle gates data.
 *
 * Each function accepts parsed entries as a second argument, so tests can pass
 * `parseCookieString('…')` and remain plain unit tests.
 * When omitted, the function reads the live cookie jar.
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
/** Returns `true` when the cookie value is exactly `true`. */
export const isCookieTrue = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'true';

// Illustration.
// This is not the negation of `isCookieTrue`.
// Both return `false` when the cookie is absent.
// This lets a caller distinguish "said no" from "said nothing".
/** Returns `true` when the cookie value is exactly `false`. */
export const isCookieFalse = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'false';
