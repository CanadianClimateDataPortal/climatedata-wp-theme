import React from 'react';

import { cn } from '@/lib/utils';

interface HeaderLanguageLinksProps {
	className?: string;
}

const HeaderLanguageLinks = (
	props: HeaderLanguageLinksProps
): React.ReactNode => {
	const {
		className,
	} = props;

	/**
	 * IDEA: since we can know the current language.
	 *
	 * We could make the lange we're not on more visible than the one we're on already.
	 */
	const currentLangCode = document.documentElement.lang ?? 'en';

	// What to change on the link about the langauge we're currently on.
	const cnListForLangCodeWhen = (subjectLangCode: string): string[] => {
		return currentLangCode === subjectLangCode
			? ['underline', 'text-zinc-500']
			: [];
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
				<li
					className={cn(
						'hover:text-brand-red',
						cnListForLangCodeWhen('en')
					)}
				>
					<a href="https://www.ClimateData.ca/">en</a>
				</li>
				<li
					className={cn(
						'hover:text-brand-red',
						cnListForLangCodeWhen('fr')
					)}
				>
					<a href="https://www.DonneesClimatiques.ca/">fr</a>
				</li>
			</ul>
		</>
	);
};

HeaderLanguageLinks.displayName = 'HeaderLanguageLinks';

export default HeaderLanguageLinks;
