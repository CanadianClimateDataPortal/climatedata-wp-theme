/**
 * useLocale hook to get the locale context from the LocaleProvider
 */
import { useContext } from 'react';
import { LocaleContext } from '@/context/locale-provider';
import { dateFormatter } from '@/lib/date-formatter'

export const useLocale = () => {
	const context = useContext(LocaleContext);
	if (context === undefined) {
		throw new Error('useLocale must be used within a LocaleProvider');
	}
	const { locale, setLocale } = context;

	/**
	 * Returns the localized value from an object.
	 * Tries multiple common keys (e.g., label, title), supporting:
	 * - Flat keys like label_en, title_fr
	 * - Nested keys like label.en, title.fr
	 * - Objects shaped like { en: '...', fr: '...' }
	 * Falls back to the English ('en') version, or an empty string if none found.
	 */
	const getLocalized = (obj: any): string => {
		if (!obj) return '';

		const keys = ['label', 'title'];

		for (const key of keys) {
			const value =
				obj?.[`${key}_${locale}`] || // e.g. label_en
				obj?.[key]?.[locale] || // e.g. label.en
				obj?.[`${key}_en`] || // e.g. label_en
				obj?.[key]?.en; // e.g. label.en

			if (value) {
				return value;
			}
		}

		// fallback if obj is directly { en: '...', fr: '...' }
		return obj?.[locale] || obj?.en || '';
	};

	return {
		locale,
		setLocale,
		getLocalized,
		getDateFormatter: dateFormatter(locale),
	};
};
