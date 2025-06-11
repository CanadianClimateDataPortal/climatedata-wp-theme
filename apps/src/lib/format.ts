import { cva } from 'class-variance-authority';
import {
	WMSLegendData,
	TransformedLegendEntry,
	PostData,
	ApiPostData,
	MultilingualField,
	TermItem,
	Locale,
} from '@/types/types';
import { ColorMap } from '@/types/climate-variable-interface';
import React from 'react';

export async function transformLegendData(
	input: WMSLegendData,
	colourScheme: string,
	isDelta: boolean,
	unit: string | undefined,
	locale: Locale,
	decimals: number,
	colorMap: ColorMap,
): Promise<TransformedLegendEntry[]> {
	let legendEntries = undefined;

	// Get raw legend entries with right labels
	const rawLegendEntries = input?.Legend?.[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.entries
		?.map((item) => ({
			...item,
			// for some variables, the response has an item with NaN text as its label, we need to convert to 0 instead
			label: item.label === 'NaN' ? 0 : item.label,
			opacity: Number(item.opacity ?? 1),
		}))
		.reverse(); // reverse the data to put higher values at the top

	if(colourScheme === 'default') {
		// If default scheme we keep raw legend entries
		legendEntries = rawLegendEntries?.slice();
	} else {
		// Format legend entries from color map colours entries

		const values = isDelta
			? rawLegendEntries?.map(entry => typeof entry.label === 'number' ? entry.label : parseFloat(entry.label))
			: rawLegendEntries?.map(entry => typeof entry.quantity === 'number' ? entry.quantity : parseFloat(entry.quantity));
		const min = Math.min(...(values ?? []));
		const max = Math.max(...(values ?? []));
		const length = values?.length;

		// Set label between min and max regarding its position
		if(min !== undefined && max !== undefined && length !== undefined) {
			legendEntries = colorMap.colours.map((color, i) => {
				let label: string | number = min + ((max - min) * i) / (colorMap.colours.length - 1);

				if(isDelta) {
					label = parseFloat(label.toFixed(decimals));
				} else {
					// Format with umit
					switch (unit) {
						case "DoY":
							label = doyFormatter(label - 1, locale, 'short');
							break;
						case "°C":
							label = parseFloat((label - 273.15).toFixed(decimals));
							break;
						default:
							label = parseFloat(label.toFixed(decimals));
					}
				}

				return {
					label: label,
					color: color,
					opacity: 1,
				};
			})
			.reverse();
		}
	}

	if (!legendEntries) {
		throw new Error('Invalid input format');
	}

	return legendEntries;
}

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

export const doyFormatter = (value: number, language: string, monthFormat: "long" | "numeric" | "2-digit" | "short" | "narrow" | undefined = 'long') => {
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
