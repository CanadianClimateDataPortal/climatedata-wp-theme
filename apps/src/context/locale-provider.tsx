/**
 * LocaleContext and Provider
 *
 * Provides a context for managing locale within the application.
 * Allows components to access and update locale if needed, eg. if
 * in the future a language switcher is implemented.
 *
 */
import React, { createContext, useContext } from 'react';
import { Locale } from '@/types/types';

// Define the LocaleContext
const LocaleContext = createContext<{ locale: Locale }>({ locale: 'en' });

// Provider component
export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const rootElement = document.getElementById('root');
	const locale =
		(rootElement?.getAttribute('data-app-lang') as Locale) || 'en';

	return (
		<LocaleContext.Provider value={{ locale: locale as Locale }}>
			{children}
		</LocaleContext.Provider>
	);
};

// How to use the LocaleContext
export const useLocaleContext = () => {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error(
			'useLocaleContext must be used within a LocaleProvider'
		);
	}

	return context;
};
