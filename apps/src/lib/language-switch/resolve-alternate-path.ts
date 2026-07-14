import type { Locale } from '@/types/types';

/**
 * Which SPA the switcher is rendered in, read from `SectionContext`.
 */
export type SwitchSection = 'map' | 'download';

/**
 * Static `{map,download} × {en,fr}` app-path table.
 *
 * Each SPA only ever lives at one of these paths, so a lookup suffices — no
 * arbitrary-slug parsing of the current pathname.
 */
const APP_PATH_BY_SECTION: Record<SwitchSection, Map<Locale, string>> = {
	map: new Map<Locale, string>([
		['en', '/maps/'],
		['fr', '/cartes/'],
	]),
	download: new Map<Locale, string>([
		['en', '/download/'],
		['fr', '/telechargement/'],
	]),
};

/**
 * Select the app path for the target locale from the static route table.
 *
 * @param section - The current SPA (`map` or `download`).
 * @param targetLocale - The locale being switched to.
 * @returns The path segment, e.g. `/cartes/`.
 * @throws If no path exists for the section/locale combination.
 */
export const resolveAlternatePath = (
	section: SwitchSection,
	targetLocale: Locale,
): string => {
	const path = APP_PATH_BY_SECTION[section].get(targetLocale);
	if (path === undefined) {
		const known = [...APP_PATH_BY_SECTION[section].keys()].join(', ');
		throw new Error(
			`No path for section "${section}" and locale "${targetLocale}". ` +
			`Known locales: ${known}.`,
		);
	}
	return path;
};
