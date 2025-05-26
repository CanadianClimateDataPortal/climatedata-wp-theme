/**
 * LocaleContext and Provider
 *
 * Provides a context for managing locale within the application.
 * Allows components to access and update locale if needed, eg. if
 * in the future a language switcher is implemented.
 *
 */
import React, { createContext, useState } from 'react';
import { Locale } from '@/types/types';

declare global {
	interface Window {
		wp: {
			i18n: {
				__: (text: string) => string;
				_n: (single: string, plural: string, number: number) => string;
			};
		};
	}
}

// Define the LocaleContext
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | undefined>(undefined);

// Provider component
export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const rootElement = document.getElementById('root');
	const initialLocale = (rootElement?.getAttribute('data-app-lang') as Locale) || 'en';

	const [locale, setLocale] = useState<Locale>(initialLocale);

	return (
		<LocaleContext.Provider value={{ locale, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
};

export { LocaleContext };

// Function to translate text using WordPress i18n
export const __ = (text: string): string => {
	return window.wp?.i18n?.__(text) || text;
};

// Function to translate plural text using WordPress i18n
export const _n = (single: string, plural: string, number: number): string => {
	return window.wp?.i18n?._n(single, plural, number) || (number === 1 ? single : plural);
};
