import { readCookieEntries } from './cookie-jar';
import type { CookieEntries } from './types';

/**
 * A toggle is an existence toggle: the presence of a cookie of that name turns it on.
 * The URL handler creates or deletes the cookie, so a check never reads the value.
 */

/** Returns `true` when the cookie is set, regardless of its value. */
export const hasCookie = (
	name: string,
	entries: CookieEntries = readCookieEntries(),
): boolean => entries.has(name);
