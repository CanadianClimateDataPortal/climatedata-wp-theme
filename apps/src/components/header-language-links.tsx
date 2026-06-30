import React from 'react';

import { useLocale } from '@/hooks/use-locale';
import { type Locale } from '@/types/types';
import { cn } from '@/lib/utils';

interface HeaderLanguageLinksProps {
	className?: string;
}

interface ListItemElementProps {
	subjectLangCode: Locale;
	subjectAppPathname: string;
}

const URL_HASHMAP_BASEURL = new Map<Locale, string>([
	['fr', 'https://www.DonneesClimatiques.ca'],
	['en', 'https://www.ClimateData.ca'],
]);

const URL_HASHMAP_PATHS_MAPS = new Map<Locale, string>([
	['fr', '/cartes/'],
	['en', '/maps/'],
]);

const URL_HASHMAP_PATHS_DOWNLOAD = new Map<Locale, string>([
	['fr', '/telechargement/'],
	['en', '/download/'],
]);

const getPathnameFor = (locale: string, appName: string): string => {
	let out = '';
	let attempt;
	if (/^(download|telechargement)$/.test(appName)) {
		attempt = URL_HASHMAP_PATHS_DOWNLOAD.get(locale as Locale);
	} else if (/^(maps|cartes)$/.test(appName)) {
		attempt = URL_HASHMAP_PATHS_MAPS.get(locale as Locale);
	}
	if (typeof attempt === 'string') {
		out = attempt;
	}
	return out;
};

const HeaderLanguageLinks = (
	props: HeaderLanguageLinksProps
): React.ReactNode => {
	const { className } = props;

	const { locale } = useLocale();

	const currentLangCode = document.documentElement.lang ?? locale;
	const alternateLangCode = currentLangCode === 'fr' ? 'en' : 'fr';

	const currentUrl = (() => {
		// Missing: useUrlSync (`apps/src/hooks/use-url-sync.ts`, `apps/src/hooks/use-download-url-sync.ts`)
		return new URL(window.location.href);
	})();

	const currentAppPathname = (() => {
		const current = currentUrl.pathname.replace(/\//g, '');
		return current;
	})();

	// What to change on the link about the langauge we're currently on.
	const getClassNamesForLangCode = (subjectLangCode: string): string[] => {
		return currentLangCode === subjectLangCode
			? ['underline', 'text-zinc-500']
			: [];
	};

	const ListItemElement = (props: ListItemElementProps): React.ReactElement => {
		const { subjectLangCode, subjectAppPathname } = props;
		const baseUrl = URL_HASHMAP_BASEURL.get(subjectLangCode) as string;
		const pathname = getPathnameFor(subjectLangCode, subjectAppPathname);
		const href = new URL(baseUrl + pathname + currentUrl.search);

		return (
			<>
				<li
					className={cn(
						'hover:text-brand-red',
						getClassNamesForLangCode(subjectLangCode)
					)}
				>
					{subjectLangCode === currentLangCode ? (
						<span>{subjectLangCode}</span>
					) : (
						<a href={String(href)}>{subjectLangCode}</a>
					)}
				</li>
			</>
		);
	};

	return (
		<>
			<ul
				className={cn(
					'font-semibold text-md text-cdc-black whitespace-normal tracking-wider uppercase flex gap-2',
					className
				)}
				data-lang-code={currentLangCode}
			>
				<ListItemElement
					subjectLangCode={alternateLangCode}
					subjectAppPathname={currentAppPathname}
				/>
			</ul>
		</>
	);
};

HeaderLanguageLinks.displayName = 'HeaderLanguageLinks';

export default HeaderLanguageLinks;
