/**
 * useLocale hook to get the locale context from the LocaleProvider
 */
import { useContext } from 'react';
import { LocaleContext } from '@/context/locale-provider';

export const useLocale = () => {
	const context = useContext(LocaleContext);
	if (context === undefined) {
		throw new Error('useLocale must be used within a LocaleProvider');
	}
	const { locale, setLocale } = context;

	/**
	 * Returns the localized label value from an object with label_en and label_fr fields.
	 * Falls back to label_en or empty string if not present.
	 */
	const getLocalizedLabel = (obj: { label_en?: string; label_fr?: string }) => {
		return obj[`label_${locale}` as 'label_en' | 'label_fr'] || obj.label_en || '';
	};
	return { locale, setLocale, getLocalizedLabel };
};