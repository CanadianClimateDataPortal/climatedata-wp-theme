import { URL_FEATURE_TOGGLES } from './toggle-names';
import { enableCookieToggle, disableCookieToggle } from './cookie-writes';

/**
 * Sets or deletes toggle cookies from URL parameters of the same names.
 *
 * Only the names listed in `URL_FEATURE_TOGGLES` are read.
 * For each name:
 * - `?NAME=1` writes the cookie through `enableCookieToggle`.
 * - `?NAME=0` deletes it through `disableCookieToggle`.
 * - Any other value leaves the cookie unchanged.
 * - The parameter is then removed from the address bar.
 *
 * The address bar is rewritten once, and only when at least one parameter was removed.
 * The hash is kept.
 * `use-url-sync.ts` keeps the app state in the URL, and a toggle is not app state.
 * So the handler runs first and removes its parameter.
 * When `URL_FEATURE_TOGGLES` is empty, the handler does nothing.
 *
 * The cookie then satisfies `hasCookie(NAME)`, so the parameter and the cookie can share one name.
 */
export const applyFeatureToggleFromUrl = (): void => {
	if (typeof window === 'undefined') {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	let removed = false;

	for (const name of URL_FEATURE_TOGGLES) {
		const value = params.get(name);

		if (value === null) {
			continue;
		}

		if (value === '1') {
			enableCookieToggle(name);
		} else if (value === '0') {
			disableCookieToggle(name);
		}

		params.delete(name);
		removed = true;
	}

	if (!removed) {
		return;
	}

	const search = params.toString();
	const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
	window.history.replaceState({}, '', newUrl);
};
