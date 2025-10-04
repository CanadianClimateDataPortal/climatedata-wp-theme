import { cva } from 'class-variance-authority';
import { ApiPostData, MultilingualField, PostData, TermItem } from '@/types/types';
import React from 'react';
import { __, _n } from '@/context/locale-provider';
import { sprintf } from '@wordpress/i18n';

export type MonthFormat = "long" | "numeric" | "2-digit" | "short" | "narrow";

/**
 * Normalize options to a common format used by the RadioGroup component
 * @param options - The options to normalize
 */
export function normalizeOptions(
	options: Array<string | number | { label: string | React.ReactNode; value: string }>
): { label: React.ReactNode; value: string }[] {
	return options.map((item) => {
		if (typeof item === 'string' || typeof item === 'number') {
			// convert strings and numbers to { label, value } objects, all string for type safety
			return { label: String(item), value: String(item) };
		}

		// default to unmodified options, ie. label/value objects array
		return item;
	});
}

/**
 * Normalizes an array of options into the format required by the Dropdown component.
 */
export function normalizeDropdownOptions<T>(
	options: Array<T | { value: T; label: string }>
): { value: T; label: string }[] {
	return options.map((option) => {
		if (option && typeof option === 'object' && 'value' in option) {
			return option;
		}
		return { value: option as T, label: String(option) };
	});
}

/**
 * Normalizes data coming from the API with defaults for missing data and a flattened structure for easier access.
 * @param dataOrPromise
 * @param locale
 */
export const normalizePostData = async (
	dataOrPromise: ApiPostData[] | Promise<ApiPostData[]>,
	locale: keyof MultilingualField = 'en'
): Promise<PostData[]> => {
	const data = await dataOrPromise;

	return data
		.map((post: ApiPostData) => {
			// Check each required property and report specifically which one is missing
			const missingProps = [];

			if (!post) {
				missingProps.push('post');
			} else {
				switch (true) {
					case post.meta === undefined:
						missingProps.push('post.meta');
						break;
					case post.meta?.content === undefined:
						missingProps.push('post.meta.content');
						break;
					case post.meta?.content?.title === undefined:
						missingProps.push('post.meta.content.title');
						break;
				}
			}

			if (missingProps.length > 0) {
				console.warn(
					`Post ID ${post?.id || 'unknown'}: Missing required properties: ${missingProps.join(', ')}`
				);
				return {
					id: post?.id || 'unknown',
					postId: post?.post_id || 0,
					title: 'Unknown',
					description: '',
					thumbnail: '',
					taxonomies: {},
				};
			}

			return {
				id: post.id,
				postId: post.post_id,
				title: post.meta.content.title[locale] || '',
				description:
					post.meta.content.card?.description?.[locale] || '',
				link: post.meta.content.card?.link?.[locale] || undefined,
				thumbnail: post.meta.content.thumbnail || '',
				taxonomies: Object.fromEntries(
					Object.entries(post.meta.taxonomy || {}).map(
						([key, value]) => {
							const terms =
								(value as { terms?: TermItem[] })?.terms || [];
							return [
								key,
								terms.map((term: TermItem) => ({
									id: term.term_id,
									title: term.title[locale] || '',
								})),
							];
						}
					)
				),
			};
		})
		.filter(Boolean);
};

export const doyFormatter = (value: number, language: string, monthFormat: MonthFormat | undefined = 'long') => {
	// First day of the year (UTC)
	const firstDayOfYear = Date.UTC(2019, 0, 1);

	// Convert the day-of-year value to a Date object
	const date = new Date(firstDayOfYear + 1000 * 60 * 60 * 24 * value);

	// Format the date according to the given language
	return date.toLocaleDateString(language, {
		month: monthFormat,
		day: 'numeric',
	});
};

export const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				longLink: 'text-primary underline-offset-4 hover:underline inline whitespace-normal',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

/**
 * Return a formatted and translated string of a value followed by a unit.
 * 
 * This function doesn't format "Day of Year" units (ex: formatting a day number `187` to the string
 * "July 7"). For this, use `doyFormatter()`.
 *
 * @param value The numerical value.
 * @param unit The unit. If empty or undefined, no unit will be outputted.
 * @param decimals The number of decimals in the formatted value.
 * @param locale The locale to use for number formatting.
 * @param relative If true, precede the value with a + or -.
 */
export function formatValue(value: number, unit: string | undefined, decimals: number, locale: string, relative: boolean = false): string {
	const formatter = new Intl.NumberFormat(
		locale,
		{
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
			signDisplay: relative ? 'exceptZero' : 'negative',
			useGrouping: false,
		}
	);
	let valuePattern = `%s`;

	if (unit) {
		valuePattern = `%s ${unit}`;

		switch (unit) {
			case 'DoY':
				if (relative) {
					valuePattern = _n(`%s day`, `%s days`, value);
				}
				break;
			case 'degC':
				valuePattern = __(`%s °C`);
				break;
			case 'mm':
				valuePattern = __(`%s mm`);
				break;
			case 'cm':
				valuePattern = __(`%s cm`);
				break;
			case 'days':
				valuePattern = _n(`%s day`, `%s days`, value);
				break;
			case 'periods':
				valuePattern = _n(`%s period`, `%s periods`, value);
				break;
			case 'events':
				valuePattern = _n(`%s event`, `%s events`, value);
				break;
			case 'mm/day':
				valuePattern = __(`%s mm/day`);
				break;
			case 'degree_days':
				valuePattern = _n(`%s degree day`, `%s degree days`, value);
				break;
		}
	}

	return sprintf(valuePattern, formatter.format(value));
}

/**
 * Return the localized, short month name for a given month.
 *
 * The month name is three or four letters, without a dot (ex: "Jan").
 *
 * This function is an alternative to `date.toLocaleString(<locale>, { month: 'short' })`,
 * which, for French, tends to generate 4 letters names with a dot (ex: "janv."). This is
 * not always desired.
 *
 * @param monthIndex - The index of the month to get the short name for.
 */
export function getShortMonthName(monthIndex: number): string {
	const monthNames = [
		__('Jan'), __('Feb'), __('Mar'), __('Apr'), __('May'), __('Jun'),
		__('Jul'), __('Aug'), __('Sept'), __('Oct'), __('Nov'), __('Dec')
	];
	return monthNames[monthIndex];
}
