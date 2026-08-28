/**
 * Names of cookies that toggle unfinished features.
 *
 * A name lives here instead of beside the component it gates because more than one
 * place needs it.
 * The component reads the toggle, and the URL-parameter code writes the same cookie.
 */

/**
 * Reveals the decadal frequencies in the frequency dropdown.
 *
 * The decadal frequencies already work when requested through the URL, with
 * `&freq=decadal-ann`, `&freq=decadal-may-sep` or `&freq=decadal-nov-mar`.
 * When this toggle is inactive, the `FrequenciesDropdownS2D` keeps them hidden
 * until they are ready for a public audience.
 *
 * To activate it, use the browser DevTools or add a URL query parameter:
 * - DevTools console:
 *   `document.cookie = 'S2D_FREQUENCIES_TO_ADD_SUPPORT=yes'`
 * - URL query parameter:
 *   - Add the cookie: `&S2D_FREQUENCIES_TO_ADD_SUPPORT=1`
 *   - Remove the cookie: `&S2D_FREQUENCIES_TO_ADD_SUPPORT=0`
 */
export const TOGGLE_COOKIE_DECADAL_FREQUENCY_OPTIONS =
	'S2D_FREQUENCIES_TO_ADD_SUPPORT';
