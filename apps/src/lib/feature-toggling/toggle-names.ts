/**
 * Names of the cookies that toggle unfinished features.
 *
 * To declare one, export a string constant here, for example
 * `export const TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM = 'LOREMIPSUM' as const;`
 * Use letters, digits and underscores only (no ECMAScript symbols) so the name is valid both as a cookie
 * name and as a URL parameter.
 *
 * A name lives here, not beside the code it gates, because more than one place
 * reads it: the check that gates the feature, and `applyFeatureToggleFromUrl`
 * when the toggle can also be set from a URL.
 */

/**
 * Names of the toggles that a URL parameter can set, read by `applyFeatureToggleFromUrl`.
 *
 * To enable the URL route for a toggle, declare its name above, then add that constant here.
 */
export const URL_FEATURE_TOGGLES: readonly string[] = [
	// ...
];
