/**
 * Production apex hosts — the cross-origin pair (DI3).
 *
 * EN and FR are served on different registrable domains in production, so the
 * counterpart cannot be derived from the current hostname; it is baked in here.
 * Bare apex on purpose — NO `www.` (per ticket CI-9). Centralized so there is a
 * single place to correct if the hosts ever change, and it is unit-tested.
 */
export const PROD_APEX_HOST_EN = 'climatedata.ca';
export const PROD_APEX_HOST_FR = 'donneesclimatiques.ca';

/**
 * Explicit bidirectional host → counterpart-host lookup (D1b).
 *
 * Every known host maps to its other-language equivalent. Dev and UAT keep a
 * shared apex and only flip the `en`/`fr` token; production crosses to the
 * other registrable domain ({@link PROD_APEX_HOST_EN} ↔ {@link PROD_APEX_HOST_FR}).
 * Dead-obvious and exhaustively testable, one place for the truth.
 */
const HOST_COUNTERPART = new Map<string, string>([
	['dev-en.climatedata.ca', 'dev-fr.climatedata.ca'],
	['dev-fr.climatedata.ca', 'dev-en.climatedata.ca'],
	['uat-en.climatedata.ca', 'uat-fr.climatedata.ca'],
	['uat-fr.climatedata.ca', 'uat-en.climatedata.ca'],
	[PROD_APEX_HOST_EN, PROD_APEX_HOST_FR],
	[PROD_APEX_HOST_FR, PROD_APEX_HOST_EN],
]);

/**
 * Reconstruct the other-language origin (scheme + host) from the current one.
 *
 * The host is looked up in {@link HOST_COUNTERPART}; the scheme is carried over
 * verbatim from `protocol`. An unknown host (e.g. `localhost`, a staging box)
 * falls back to the current host, so the switcher still renders a usable link
 * even where no counterpart is registered — see the ticket's open question on
 * host forms beyond dev/uat/prod-apex.
 *
 * @param hostname - `window.location.hostname`, e.g. `dev-en.climatedata.ca`.
 * @param protocol - `window.location.protocol`, e.g. `https:` (trailing colon).
 * @returns The other-language origin, e.g. `https://dev-fr.climatedata.ca`.
 */
export const resolveAlternateOrigin = (
	hostname: string,
	protocol: string,
): string => {
	const counterpart = HOST_COUNTERPART.get(hostname) ?? hostname;
	return `${protocol}//${counterpart}`;
};
