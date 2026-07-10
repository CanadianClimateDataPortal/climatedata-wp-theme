import type { Locale } from '@/types/types';

/**
 * Production apex hosts — the EN/FR cross-origin pair.
 *
 * EN and FR are served on different registrable domains in production, so the
 * counterpart cannot be derived from the current hostname; it is baked in here.
 * Bare apex on purpose — no `www.`: production redirects `www.` to the bare
 * apex server-side (a 301 before the app loads), so the SPA only ever runs on
 * the bare host and the switch target must match it. Centralized so there is a
 * single place to correct if the hosts ever change, and it is unit-tested.
 * ([[LLM-Context-ClimateData-Ticket-CLIM-1409]], CI-9 / DI3.)
 */
export const PROD_APEX_HOST_EN = 'climatedata.ca';
export const PROD_APEX_HOST_FR = 'donneesclimatiques.ca';

/**
 * Locale-annotated host pairs — the single source of truth for which host
 * serves which language, per environment.
 *
 * Each entry names both locales' host, so a current hostname found on either
 * side resolves to the sibling host for any requested locale — and to itself
 * when the requested locale matches the current side. This locale annotation is
 * what lets the resolver address a host BY locale instead of blindly swapping
 * to a counterpart (the seam that produced host/path language mismatches).
 */
const HOST_PAIRS: ReadonlyArray<Record<Locale, string>> = [
	{
		en: 'dev-en.climatedata.ca',
		fr: 'dev-fr.climatedata.ca',
	},
	{
		en: 'uat.' + PROD_APEX_HOST_EN,
		fr: 'uat.' + PROD_APEX_HOST_FR,
	},
	{
		en: 'qa.' + PROD_APEX_HOST_EN,
		fr: 'qa.' + PROD_APEX_HOST_FR,
	},
	{
		en: 'preprod.' + PROD_APEX_HOST_EN,
		fr: 'preprod.' + PROD_APEX_HOST_FR,
	},
	{
		en: PROD_APEX_HOST_EN,
		fr: PROD_APEX_HOST_FR,
	},
];

/**
 * Resolve the origin (scheme + host) that serves `targetLocale` for the page
 * currently on `hostname`.
 *
 * The current `hostname` is matched against either side of {@link HOST_PAIRS}
 * and the matched pair's `targetLocale` host is returned — so a same-locale
 * request resolves to the current host itself (self), not a swap. The scheme is
 * carried over verbatim from `protocol`. An unknown host (e.g. `localhost`, a
 * staging box) falls back to the current host, so the switcher still renders a
 * usable (same-origin, path-translated) link instead of breaking where no pair
 * is registered.
 *
 * @param hostname - `window.location.hostname`, e.g. `dev-en.climatedata.ca`.
 * @param protocol - `window.location.protocol`, e.g. `https:` (trailing colon).
 * @param targetLocale - The locale whose serving origin is wanted.
 * @returns The origin serving `targetLocale`, e.g. `https://dev-fr.climatedata.ca`.
 */
export const resolveOriginForLocale = (
	hostname: string,
	protocol: string,
	targetLocale: Locale,
): string => {
	const pair = HOST_PAIRS.find(
		(candidate) =>
			candidate.en === hostname
			|| candidate.fr === hostname,
	);
	const host = pair ? pair[targetLocale] : hostname;
	return `${protocol}//${host}`;
};
