/**
 * The injected URL globals this module inspects, each paired with the name to print.
 *
 * The name travels with the value because the console reader needs to know which
 * global to go and fix.
 * Both are rendered into the page from server-side configuration, so the fix lives
 * outside this bundle.
 *
 * `window.DATA_URL` is declared as a `string` and `window.MAP_RASTER_PROXYPHP_DATA_URL`
 * as an optional one, yet neither declaration is a runtime guarantee.
 * A value overridden from the browser's devtools console reaches this code as
 * whatever was typed there.
 */
const readInjectedUrlGlobals = (): [string, string | undefined][] => [
	['window.DATA_URL', window.DATA_URL],
	['window.MAP_RASTER_PROXYPHP_DATA_URL', window.MAP_RASTER_PROXYPHP_DATA_URL],
];

/**
 * Reports a trailing slash on either injected URL global to the browser's console.
 *
 * Code in this namespace joins these globals with the `URL` constructor, which
 * normalizes a trailing slash away, so the addresses it builds stay correct either
 * way.
 * Consumers elsewhere in the app still concatenate strings onto the same globals, and
 * there a trailing slash yields a doubled separator such as `//raster?url=` that the
 * receiving server answers with a 404.
 * The WordPress side already normalizes these values with `rtrim`, so a slash arriving
 * here means the value took a different route into the page.
 *
 * This observes and never corrects.
 * Both globals are left exactly as the page received them, so a value pasted in from
 * the devtools console stays the value under test and the warning describes the page
 * the reader is actually looking at.
 *
 * Call this once at module scope, beside the other eager installers, so the warning
 * lands before any code reads either global.
 *
 * @remark Where does this run?: In the user's browser, eagerly at module scope.
 */
export const warnOnTrailingSlashInInjectedUrls = (): void => {
	for (const [globalName, value] of readInjectedUrlGlobals()) {
		const hasTrailingSlash = typeof value === 'string' && value.endsWith('/');
		if (!hasTrailingSlash) {
			continue;
		}
		console.warn(
			`${globalName} carries a trailing slash (${value}). ` +
				'Consumers that concatenate a path onto it produce a doubled separator, ' +
				'which the receiving server answers with a 404.',
		);
	}
};
