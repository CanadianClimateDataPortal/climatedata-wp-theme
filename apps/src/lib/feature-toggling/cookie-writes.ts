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
 * Sets the toggle cookie, so `hasCookie(name)` returns `true` from now on.
 *
 * The value is `yes`, which is what someone entering the cookie by hand types.
 * Nothing reads the value.
 * `hasCookie` checks whether the name is present, so any value would have the same effect.
 */
export const enableCookieToggle = (name: string): void => {
	if (!isDocumentAvailable()) {
		return;
	}

	document.cookie = `${name}=yes; max-age=${TOGGLE_COOKIE_LIFETIME_IN_SECONDS}`;
};

/**
 * Deletes the toggle cookie, so `hasCookie(name)` returns `false` again.
 *
 * The cookie must disappear; setting a falsy value is not enough.
 * `hasCookie` checks the name and never reads the value.
 */
export const disableCookieToggle = (name: string): void => {
	if (!isDocumentAvailable()) {
		return;
	}

	document.cookie = `${name}=; max-age=-99999999`;
};
