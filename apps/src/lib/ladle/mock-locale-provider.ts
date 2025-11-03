import {
	createElement,
	type ReactNode,
	useEffect,
	useState,
} from 'react';
import {
	type ArgTypes,
} from '@ladle/react';

import { createI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';

import { type Locale } from '@/types/types';
import { LocaleContext } from '@/context/locale-provider';

export interface StoryWithLocale {
	locale: Locale;
}

export interface LadleMockLocaleProviderProps {
	children: ReactNode;
	locale: Locale;
	translatedFrench: Record<string, string>;
}

export const createLadleMockLocaleStoryArgTypes =
	(
		defaultValue?: Locale,
	): ArgTypes<StoryWithLocale> => {
		const out: ArgTypes<StoryWithLocale> = {
			locale: {
				options: ['en', 'fr'],
				control: { type: 'select' },
				defaultValue,
			},
		};
		return out;
	};

/**
 * Custom I18n and LocaleContext.Provider setup for Ladle
 */
export const LadleMockLocaleProvider = ({
	children,
	locale = 'en',
	translatedFrench = {},
}: LadleMockLocaleProviderProps): ReactNode => {
	const [currentLocale, setCurrentLocale] = useState(locale);
	const i18n = createI18n();

	if (Object.keys(translatedFrench).length < 1) {
		const message = `Missing required argument "translatedFrench" to provide a few translations`;
		throw new Error(message);
	}

	useEffect(() => {
		setCurrentLocale(locale);
		const translations: Record<Locale, Record<string, string>> = {
			en: {},
			fr: translatedFrench,
		};
		// Mock the WordPress i18n functions
		window.wp = window.wp || {};
		window.wp.i18n = {
			__: (text: string) => {
				return translations[locale]?.[text] || text;
			},
			_n: (single: string, plural: string, number: number) => {
				const text = number === 1 ? single : plural;
				return translations[locale]?.[text] || text;
			},
		};

		// Also update document.documentElement.lang for your component
		document.documentElement.setAttribute('lang', locale);
	}, [
		locale,
		translatedFrench,
	]);

	const localeContextProviderValue = {
		locale: currentLocale,
		setLocale: setCurrentLocale,
	};

	// Not using JSX notation so we do not need to make this module mignle JSX and logic.
	return createElement(
		I18nProvider,
		{
			i18n,
			key: 'i18n-provider-mock',
		},
		[
			createElement(
				LocaleContext.Provider,
				{
					value: localeContextProviderValue,
					key: 'locale-context-provider-mock',
				},
				children,
			),
		],
	);
};
