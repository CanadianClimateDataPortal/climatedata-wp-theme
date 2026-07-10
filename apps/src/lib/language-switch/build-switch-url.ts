import type { Locale } from '@/types/types';
import {
	resolveOriginForLocale,
} from './resolve-origin-for-locale';
import {
	resolveAlternatePath,
	type SwitchSection,
} from './resolve-alternate-path';

/**
 * Inputs to build the other-language destination URL.
 */
export interface BuildSwitchUrlInput {
	/** `window.location.hostname`, e.g. `dev-en.climatedata.ca`. */
	hostname: string;
	/** `window.location.protocol`, e.g. `https:` (trailing colon). */
	protocol: string;
	/** The current SPA (`map` or `download`). */
	section: SwitchSection;
	/** The locale being switched to. */
	targetLocale: Locale;
	/**
	 * The current query to carry over, WITHOUT a leading `?`
	 * (e.g. `var=hottest_day&region=census`, or `''` for none). Typically the
	 * output of `URLSearchParams.toString()`.
	 */
	search: string;
}

/**
 * Build the URL of the requested section in the requested locale: locale-
 * addressed origin + path translation + query carry.
 *
 * The origin is resolved FOR `input.targetLocale` (not an unconditional
 * swap to the other language), so passing the current page's own locale
 * returns that same page's URL instead of a host/path language mismatch.
 *
 * Pure and free of `window` — hostname and protocol are passed in — so it is
 * exhaustively unit-testable. This is the sole place the switch destination is
 * assembled; the component stays thin.
 *
 * @param input - Hostname/protocol, target section + locale, and the query.
 * @returns The absolute destination URL in the requested locale.
 */
export const buildSwitchUrl = (
	input: BuildSwitchUrlInput,
): string => {
	const origin = resolveOriginForLocale(
		input.hostname,
		input.protocol,
		input.targetLocale,
	);
	const path = resolveAlternatePath(input.section, input.targetLocale);

	const url = new URL(path, origin);
	// URLSearchParams-style string; the setter normalizes the leading `?`.
	url.search = input.search;

	return url.toString();
};
