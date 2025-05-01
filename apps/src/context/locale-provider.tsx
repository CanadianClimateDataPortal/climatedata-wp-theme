/**
 * LocaleContext and Provider
 *
 * Provides a context for managing locale within the application.
 * Allows components to access and update locale if needed, eg. if
 * in the future a language switcher is implemented.
 *
 */
import React, { createContext, useState, useEffect } from 'react';
import { Locale } from '@/types/types';

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
