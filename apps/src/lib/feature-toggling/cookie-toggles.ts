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
// Three named functions instead of one function with a mode argument.
// Each name states the question it answers, so a call site reads as the
// sentence a reviewer wants to check.
//
// The second parameter is the testing seam.
// A test passes `parseCookieString('FLAG=true')` and never touches a DOM.
// Production code leaves it out and reads the live cookie jar.
/** Returns `true` when the cookie is set, regardless of its value. */
export const hasCookie = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.has(name);

// Illustration.
// A missing cookie and a cookie holding `yes` both answer `false` here.
// Silence means off, which is the safe direction for a fence.
/** Returns `true` when the cookie value is exactly `true`. */
export const isCookieTrue = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'true';

// Illustration.
// This is not the negation of `isCookieTrue`.
// Both answer `false` when the cookie is absent.
// That is how a caller tells "said no" apart from "said nothing".
/** Returns `true` when the cookie value is exactly `false`. */
export const isCookieFalse = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.get(name) === 'false';
