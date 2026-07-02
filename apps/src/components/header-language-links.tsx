import {
	type ReactNode,
	useContext,
} from 'react';

import { useAppSelector } from '@/app/hooks';
import SectionContext from '@/context/section-provider';
import { selectDownloadUrlSearch } from '@/features/download/download-url-sync-slice';
import { selectMapUrlSearch } from '@/features/url-sync/url-sync-slice';
import { useLocale } from '@/hooks/use-locale';
import { buildSwitchUrl } from '@/lib/language-switch';
import { cn } from '@/lib/utils';
import { type Locale } from '@/types/types';

interface HeaderLanguageLinksProps {
	className?: string;
}

/**
 * Both languages, in a fixed `EN | FR` order. The current one is rendered
 * regardless (inert), so the pair reads consistently.
 */
const LOCALES: Locale[] = [
	'en',
	'fr',
];

/**
 * Bilingual `EN | FR` switcher for the Map and Download SPA headers.
 *
 * The current locale (from `useLocale()`) renders as an inert `<span>`; the
 * other locale renders as a real `<a href>` to the equivalent page on the
 * other-language site (origin swap + path translation + current query). The
 * query is derived from Redux state via `selectMapUrlSearch` /
 * `selectDownloadUrlSearch`, not `window.location.search` — url-sync writes the
 * URL on a debounced `replaceState` with no re-render, so the URL lags the live
 * state — so the `href` stays current even for a middle/Ctrl-click "open in new
 * tab". ([[LLM-Context-ClimateData-Ticket-CLIM-1409]], CI-16.)
 */
const HeaderLanguageLinks = (
	props: HeaderLanguageLinksProps
): ReactNode => {
	const { className } = props;

	const { locale } = useLocale();
	const section = useContext(SectionContext);

	// Both slices are always selectable (single shared store); `section` picks
	// which app's params are the live ones for this header.
	const mapSearch = useAppSelector(selectMapUrlSearch);
	const downloadSearch = useAppSelector(selectDownloadUrlSearch);
	const search = section === 'download' ? downloadSearch : mapSearch;

	return (
		<ul
			className={cn(
				'text-xs font-semibold tracking-wider uppercase text-cdc-black flex gap-2',
				className
			)}
			data-lang-code={locale}
		>
			{LOCALES.map((subjectLocale) => {
				const isCurrent = subjectLocale === locale;

				return (
					<li
						key={subjectLocale}
						className={cn(
							!isCurrent && 'hover:text-brand-red',
							isCurrent && ['underline', 'text-zinc-500']
						)}
					>
						{isCurrent ? (
							<span lang={subjectLocale}>{subjectLocale}</span>
						) : (
							<a
								lang={subjectLocale}
								hrefLang={subjectLocale}
								href={buildSwitchUrl({
									hostname: window.location.hostname,
									protocol: window.location.protocol,
									search,
									section,
									targetLocale: subjectLocale,
								})}
							>
								{subjectLocale}
							</a>
						)}
					</li>
				);
			})}
		</ul>
	);
};

HeaderLanguageLinks.displayName = 'HeaderLanguageLinks';

export default HeaderLanguageLinks;
