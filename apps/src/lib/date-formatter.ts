import {
	format,
	type FormatOptions as DateFnsFormatOptions,
	type Locale,
} from 'date-fns';
import enCA from 'date-fns/locale/en-CA';
import frCA from 'date-fns/locale/fr-CA';

import { Locale as LocalTypesLocale } from '@/types/types';

// Map of supported locales
const localeMap: { [key: string]: Locale } = {
	en: enCA,
	fr: frCA,
};

export interface DateFormatterOptions {
	locale: string | LocalTypesLocale;
}

export type DateFormatterFnType = (
	dateString: string,
	formatStr: string,
	options?: DateFnsFormatOptions
) => string;

export interface DateFormatterType {
	format: DateFormatterFnType;
}

export function dateFormatter(locale: string) {
	// Get the locale object from the map, fallback to enUS if not found
	const localeData: Locale = Reflect.has(localeMap, locale)
		? Reflect.get(localeMap, locale)
		: Reflect.get(localeMap, 'en');

	const formatter: DateFormatterFnType = (
		dateString,
		formatStr,
		options = {},
	) => {
		return format(
			dateString,
			formatStr,
			{
				...(options || {}),
				locale: localeData,
			}
		);
	};

	return {
		format: formatter,
	};
}
