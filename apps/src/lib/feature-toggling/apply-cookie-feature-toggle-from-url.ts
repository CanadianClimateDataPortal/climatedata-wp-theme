import { enableCookieToggle, disableCookieToggle } from './cookie-writes';

/**
 * Sets or deletes the toggle cookie `name` from a URL parameter of the same name.
 *
 * `?NAME=1` writes the cookie through `enableCookieToggle`.
 * `?NAME=0` deletes it through `disableCookieToggle`.
 * Any other value changes nothing.
 * The parameter is then removed from the address bar, and the hash is kept.
 * A link copied afterwards therefore does not pass the toggle on.
 *
 * Only the name passed by the caller is read.
 * The cookie then satisfies `hasCookie(name)`, so the parameter and the cookie can share one name.
 */
export const applyFeatureToggleFromUrl = (name: string): void => {
	if (typeof window === 'undefined') {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const value = params.get(name);

	if (value === null) {
		return;
	}

	if (value === '1') {
		enableCookieToggle(name);
	} else if (value === '0') {
		disableCookieToggle(name);
	}

	params.delete(name);

	const search = params.toString();
	const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
	window.history.replaceState({}, '', newUrl);
};
