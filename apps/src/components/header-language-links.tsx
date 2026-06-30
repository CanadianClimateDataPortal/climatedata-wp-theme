import React from 'react';

import { useLocale } from '@/hooks/use-locale';
import { type Locale } from '@/types/types';
import { cn } from '@/lib/utils';

interface HeaderLanguageLinksProps {
	className?: string;
}

interface ListItemElementProps {
	locale: Locale;
}

const URL_ORDERED_SET = new Set([
	'/maps/;en',
	'/cartes/;fr',
	'/download/;en',
	'/telechargement/;fr',
]);

const createHashMapForApp = (pathName: string) =>
	[...URL_ORDERED_SET]
		.filter((i) => i.split(';')[0] === pathName)
		.map((i) => [i.split(';')[1], i.split(';')[0]]);

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

const HeaderLanguageLinks = (
	props: HeaderLanguageLinksProps
): React.ReactNode => {
	const { className } = props;

	const { locale } = useLocale();

	/**
	 * IDEA: since we can know the current language.
	 *
	 * We could make the lange we're not on more visible than the one we're on already.
	 */
	const currentLangCode = document.documentElement.lang ?? 'en';

	const alternateLangCode = currentLangCode === 'fr' ? 'en' : 'fr';

	// What to change on the link about the langauge we're currently on.
	const getClassNamesForLangCode = (subjectLangCode: string): string[] => {
		return currentLangCode === subjectLangCode
			? ['underline', 'text-zinc-500']
			: [];
	};

	const currentAppPathname = (() => {
		const url = new URL(window.location.href);
		const current = url.pathname.replace('/', '');
		return current;
	})();

	const ListItemElement = (props: ListItemElementProps): React.ReactElement => {
		const { locale } = props;
		const alternateLangCode = locale === 'fr' ? 'en' : 'fr';
		const href = URL_HASHMAP_BASEURL.get(locale) as string;
		// if (currentAppPathname === '/') const pathName = URL_HASHMAP_BASEURL;
		console.log(`<ListItemElement locale="${locale}">`, { locale, currentLangCode, alternateLangCode });

		return (
			<>
				<li
					className={cn(
						'hover:text-brand-red',
						getClassNamesForLangCode(locale)
					)}
				>
					{locale !== alternateLangCode ? (
						<span>{alternateLangCode}</span>
					) : (
						<a href={href + '?yo=dog'}>{alternateLangCode}</a>
					)}
				</li>
			</>
		);
	};

	const whatever = createHashMapForApp(currentAppPathname);

	console.log('HeaderLanguageLinks', {
		currentLangCode,
		locale,
		alternateLangCode,
		currentAppPathname,
		whatever,
	});

	return (
		<>
			<ul
				className={cn(
					'font-semibold text-md text-cdc-black whitespace-normal tracking-wider uppercase flex gap-2',
					className
				)}
				data-lang-code={currentLangCode}
			>
				<ListItemElement locale={locale} />
				<li
					className={cn('hover:text-brand-red', getClassNamesForLangCode('en'))}
				>
					<a href="https://www.ClimateData.ca/">en</a>
				</li>
				<li
					className={cn('hover:text-brand-red', getClassNamesForLangCode('fr'))}
				>
					<a href="https://www.DonneesClimatiques.ca/">fr</a>
				</li>
			</ul>
		</>
	);
};

HeaderLanguageLinks.displayName = 'HeaderLanguageLinks';

export default HeaderLanguageLinks;
