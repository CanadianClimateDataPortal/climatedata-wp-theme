/**
 * Writes the cookies read by the checks in `cookie-toggles.ts`.
 *
 * A toggle is read on every render and written only when someone enables or
 * disables it, so reading and writing live in separate files.
 *
 * Both functions use `path=/` because a toggle applies to the whole site.
 * A cookie written for one path is invisible from another path.
 * Deleting a cookie requires the same path as the one that created it.
 * Otherwise, the browser keeps the original cookie and the toggle appears stuck.
 */

// Ninety days is long enough for someone exploring an unfinished feature not to
// need the link again, but short enough for a forgotten toggle to expire.
const TOGGLE_COOKIE_LIFETIME_IN_SECONDS = 60 * 60 * 24 * 90; // 90 days.

// The `typeof` guard keeps this module usable in unit tests without a DOM.
const isDocumentAvailable = (): boolean => typeof document !== 'undefined';

/**
 * Sets the toggle cookie, so `hasCookie(name)` check would return `true`.
 *
 * This is for when we only check for cookie existence.
 * The cookie value is not used.
 */
export const enableCookieToggle = (name: string): void => {
	if (!isDocumentAvailable()) {
		return;
	}

	// Omitting `path=/` would make the cookie visible only from the path it was created from.
	document.cookie = `${name}=yes; max-age=${TOGGLE_COOKIE_LIFETIME_IN_SECONDS}; path=/`;
};

/**
 * Deletes the toggle cookie, so `hasCookie(name)` check would return `false`.
 *
 * The cookie must disappear; setting a falsy value is not enough.
 * `hasCookie` checks the name and never reads the value.
 */
export const disableCookieToggle = (name: string): void => {
	if (!isDocumentAvailable()) {
		return;
	}

	document.cookie = `${name}=; max-age=-99999999; path=/`;
};
