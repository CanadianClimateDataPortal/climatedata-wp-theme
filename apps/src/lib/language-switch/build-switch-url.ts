import type { Locale } from '@/types/types';
import {
	resolveAlternateOrigin,
} from './resolve-alternate-origin';
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
 * Build the equivalent other-language URL: origin swap + path translation +
 * verbatim query carry.
 *
 * Pure and free of `window` — origin and protocol are passed in — so it is
 * exhaustively unit-testable. This is the sole place the switch destination is
 * assembled; the component stays thin.
 *
 * @param input - Origin/protocol, target section + locale, and the query.
 * @returns The absolute destination URL.
 */
export const buildSwitchUrl = (
	input: BuildSwitchUrlInput,
): string => {
	const origin = resolveAlternateOrigin(input.hostname, input.protocol);
	const path = resolveAlternatePath(input.section, input.targetLocale);

	const url = new URL(path, origin);
	// URLSearchParams-style string; the setter normalizes the leading `?`.
	url.search = input.search;

	return url.toString();
};
