import { TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS } from './toggle-names';
import { enableCookieToggle, disableCookieToggle } from './cookie-writes';

/**
 * Uses a specific string as a marker to create a cookie with a non-empty value.
 *
 * Only specific values are recognised; see `toggle-names.ts`.
 * When the toggle checks only whether a cookie exists (`hasCookie`), the same
 * string can be used for the URL parameter and the cookie name.
 *
 * Use `?EXAMPLE_TOGGLE_NAME=1` to add the cookie and `=0` to remove it.
 */
export const applyFeatureToggleFromUrl = (): void => {
	if (typeof window === 'undefined') {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const value = params.get(TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS);

	if (value === null) {
		return;
	}

	if (value === '1') {
		enableCookieToggle(TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS);
	} else if (value === '0') {
		disableCookieToggle(TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS);
	}

	params.delete(TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS);

	const search = params.toString();
	const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
	window.history.replaceState({}, '', newUrl);
};
