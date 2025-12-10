import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';
import {
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import { __ } from '@/context/locale-provider';
import { ParsedLatLon } from '@/types/types';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isValidEmail = (email: string): boolean => {
	return validator.isEmail(email);
};

// converts a rem value to pixels
export const remToPx = (rem: string): number => {
	return (
		parseFloat(rem) *
		parseFloat(getComputedStyle(document.documentElement).fontSize)
	);
};

/**
 * Escape special regex characters to safely use in RegExp
 */
const escapeRegExp = (string: string): string => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Highlight text matching a search term by splitting it into parts and marking matched parts
 *
 * Returns an array of parts with a flag indicating whether each part is a match or not
 */
export const splitTextByMatch = (
	text: string,
	searchTerm: string
): Array<{ text: string; isMatch: boolean }> => {
	if (!searchTerm || !text) return [{ text, isMatch: false }];

	const escapedSearchTerm = escapeRegExp(searchTerm);
	const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

	// Split the text by regex, preserving matches
	const parts = text.split(regex);

	// Map the parts to include whether they match or not
	const result = parts.map((part) => {
		if (part.toLowerCase() === searchTerm.toLowerCase()) {
			return { text: part, isMatch: true };
		}
		return { text: part, isMatch: false };
	});

	// Filter out empty parts
	return result.filter((part) => part.text.length > 0);
};

export const getFrequencyType = (frequency: string): FrequencyType | undefined =>  {
	let frequencyCode;

	if (frequency === 'ann') {
		frequencyCode = FrequencyType.YS;
	} else if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(frequency)) {
		frequencyCode = FrequencyType.MS;
	} else if (['spring', 'summer', 'fall', 'winter'].includes(frequency)) {
		frequencyCode = FrequencyType.QSDEC;
	}

	return frequencyCode;
};

export const isFrequencyEnabled = (
	config: FrequencyConfig,
	section: string,
	frequencyType: FrequencyType
): boolean => {
	const configValue = config[frequencyType];
	return Boolean(
		configValue &&
		(configValue === FrequencyDisplayModeOption.ALWAYS ||
			configValue === section)
	);
};

export const getDefaultFrequency = (
	config: FrequencyConfig,
	section: string
) => {
	const hasAnnual = isFrequencyEnabled(config, section, FrequencyType.ANNUAL);
	const hasMonths = isFrequencyEnabled(
		config,
		section,
		FrequencyType.MONTHLY
	);
	const hasSeasons = isFrequencyEnabled(
		config,
		section,
		FrequencyType.SEASONAL
	);

	let defaultValue;

	if (hasAnnual) {
		defaultValue = FrequencyType.ANNUAL;
	} else if (hasMonths) {
		defaultValue = 'jan';
	} else if (hasSeasons) {
		defaultValue = 'spring';
	}

	return defaultValue;
};
/**
 * Converts a date format string (e.g., 'YYYY-MM-DD', 'MM-DD') into a regular expression for validation.
 */
export const dateFormatCheck = (format: string): RegExp => {
	const regexStr = format
		.replace(/YYYY/g, '\\d{4}')
		.replace(/MM/g, '(0[1-9]|1[0-2])')
		.replace(/DD/g, '(0[1-9]|[12]\\d|3[01])');
	return new RegExp(`^${regexStr}$`);
};

export const getCommonPrefix = (strings: string[]) => {
	if (!strings.length) return '';

	let prefix = strings[0];
	for (let i = 1; i < strings.length; i++) {
		while (strings[i].indexOf(prefix) !== 0) {
			prefix = prefix.slice(0, -1);
			if (!prefix) return '';
		}
	}
	return prefix;
}

/**
 * Generates a hash code from a string using a basic bitwise algorithm.
 *
 * Note: This is a non-cryptographic hash function and should not be used for security purposes.
 *
 * @param {string} s - The input string to hash.
 * @returns {number} The resulting hash code.
 */
export const hashCode = (s: string)=> {
	return s.split('').reduce(function (a: number, b: string) {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
}

/**
 * Encodes a URL with a salt using base64 and URL encoding.
 *
 * The URL is combined with a hash generated from the URL and salt,
 * then base64-encoded and URL-encoded to ensure safe transmission.
 *
 * @param {string} url - The URL to encode.
 * @param {string} salt - The salt used for hash generation.
 * @returns {{ encoded: string, hash: number }} An object containing the encoded URL and its hash.
 */
export const encodeURL = (url: string, salt: string) => {
	const hash = hashCode(url + salt);
	const encoded = encodeURIComponent(btoa(`${url}|${hash}`));
	return { encoded, hash };
};

/**
 * Modify the DOM to prepare the "Explore Maps" page for a screenshot.
 *
 * This function is designed to be executed by an external script (e.g. via Selenium)
 * before taking a screenshot. It removes certain UI elements and applies a specific
 * class to the map container to render the map in a cleaner, full-screen layout.
 *
 * Note: This function does not revert changes. A full page reload is required to restore the original UI.
 */
export function prepareRaster(): void {
	// Simulate a click on the legend toggle button
	const legendToggle = document.getElementById('legend-toggle');
	if (legendToggle instanceof HTMLElement) {
		legendToggle.click();
	}
	// Remove elements that should not appear in the screenshot
	['map-sidebar', 'header', 'sidebar-toggle', 'header-map', 'map-search-control', 'map-zoom-control'].forEach(id => {
		const el = document.getElementById(id);
		if (el) {
			el.remove();
		}
	});

	// Remove all tooltip elements
	document.querySelectorAll('.tooltip').forEach(el => el.remove());

	// Resize the window to force a layout update.
	window.dispatchEvent(new Event('resize'));
}

/**
 * Extracts a feature ID from the properties object of a map layer click event.
 * @param properties
 */
export const getFeatureId = (properties: {
	gid?: number;
	id?: number;
	name?: string;
	title?: string;
	label_en?: string;
	label_fr?: string;
}): number | null => {
	return properties.gid ?? properties.id ?? null;
};

/**
 * Return the translated display name for a unit from its technical code.
 *
 * To be used when displaying only the unit's name, not a value followed by a
 * unit. In that case, use `formatValue()` instead.
 */
export function getUnitName(unit: string): string {
	switch (unit) {
		case 'DoY':
			return __('Day');
		case 'degC':
			return __('°C');
		case 'mm':
			return __('mm');
		case 'cm':
			return __('cm');
		case 'days':
			return __('Days');
		case 'periods':
			return __('Periods');
		case 'events':
			return __('Events');
		case 'mm/day':
			return __('mm/day');
		case 'degree_days':
			return __('Degree Days');
		case 'zone':
			return __('Zone');
		default:
			return unit;
	}
}

/**
 * Return the translated display name for a frequency from its technical code.
 *
 * @param frequency - The frequency code to translate.
 */
export function getFrequencyName(frequency: string): string {
	const nameMap: { [key: string]: string } = {
		ann: __('Annual'),
		jan: __('January'),
		feb: __('February'),
		mar: __('March'),
		apr: __('April'),
		may: __('May'),
		jun: __('June'),
		jul: __('July'),
		aug: __('August'),
		sep: __('September'),
		oct: __('October'),
		nov: __('November'),
		dec: __('December'),
		spring: __('Spring'),
		summer: __('Summer'),
		fall: __('Fall'),
		winter: __('Winter'),
	}

	return nameMap[frequency] ?? frequency;
}

/**
 * Return the translated display name for a region from its technical code.
 *
 * @param region - The region code to translate.
 */
export function getInteractiveRegionName(region: InteractiveRegionOption): string {
	const nameMap = {
		[InteractiveRegionOption.GRIDDED_DATA]: __('Grid Cells'),
		[InteractiveRegionOption.CENSUS]: __('Census Subdivisions'),
		[InteractiveRegionOption.HEALTH]: __('Health Regions'),
		[InteractiveRegionOption.WATERSHED]: __('Watersheds'),
	}
	return nameMap[region] ?? region;
}

/**
 * Return the index of a number in a sorted array, or of the next closest number.
 *
 * @param values Array of numbers. Must already be sorted.
 * @param value The number to search
 * @return The index of the number, if present, or the index of its next
 *         closest. -1 is returned if the number is higher than the highest
 *         number.
 */
export function findCeilingIndex(values: number[], value: number): number {
	if (values.length === 0) {
		return -1;
	}

	let left = 0;
	let right = values.length - 1;

	if (value > values[right]) {
		return -1;
	}

	if (value <= values[left]) {
		return left;
	}

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);

		if (values[mid] === value) {
			// Exact match: return next index (entering new band)
			const nextIndex = mid + 1;
			return nextIndex < values.length ? nextIndex : -1;
		} else if (values[mid] < value) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	return left < values.length ? left : -1;
}

/**
 * Generate `n` numbers equally distributed between `a` and `b`, inclusive.
 *
 * The first number will be `a` and the last number will be `b`.
 *
 * @param a Start of the range, will be the first number.
 * @param b End of the range, will be the last number.
 * @param n Number of numbers to generate, including the first and the last.
 */
export function generateRange(a: number, b: number, n: number): number[] {
	if (n <= 0) {
		return [];
	}

	if (n === 1) {
		return [a];
	}

	const step = (b - a) / (n - 1);
	const result: number[] = [];

	for (let i = 0; i < n; i++) {
		result.push(a + i * step);
	}

	result[result.length - 1] = b;

	return result;
}

/**
 * Parses the latitude and longitude from a coordinate string.
 *
 * Supports partial coordinates, e.g. where only the latitude is specified.
 *
 * @param text - The text to parse
 * @returns An object with the parsed latitude and longitude, or null if the
 *   input is not a string representing coordinates.
 */
export function parseLatLon(text: string): ParsedLatLon | null {
	text = text.trim();

	if (text === '') {
		return null;
	}

	if (text === '-') {
		return {
			lat: Number.NaN,
			lon: Number.NaN,
			isPartial: true,
		}
	}

	const regex = /^(-?\d+(?:[.,]\d*)?)(?:\s*[,;\s]\s*(-?\d+(?:[.,]\d*)?)?)?$/;
	const result = regex.exec(text);

	if (!result) {
		return null;
	}

	const latNumber = parseFloat(result[1].replace(',', '.'));
	const lonNumber = result[2] ?
		parseFloat(result[2].replace(',', '.')) :
		Number.NaN;

	if (!Number.isNaN(latNumber) && Math.abs(latNumber) > 90) {
		return null;
	}

	if (!Number.isNaN(latNumber) && Math.abs(lonNumber) > 180) {
		return null;
	}

	return {
		lat: latNumber,
		lon: lonNumber,
		isPartial: Number.isNaN(lonNumber),
	}
}

/**
 * Parse a string representing a date and time in UTC time.
 *
 * For example, the string "2024-01-01" would be parsed as a date where
 * `date.toUTCString()` would return "Wed, 01 Jan 2024 00:00:00 GMT".
 *
 * @param dateString - The string to parse as a UTC date.
 * @returns A Date object representing the parsed date, or null if the string
 *   cannot be parsed as a date.
 */
export function utc(dateString: string): Date | null {
	const parsedDate = new Date(dateString);

	if (Number.isNaN(parsedDate.valueOf())) {
		return null;
	}

	return new Date(Date.UTC(
		parsedDate.getUTCFullYear(),
		parsedDate.getUTCMonth(),
		parsedDate.getUTCDate(),
		parsedDate.getUTCHours(),
		parsedDate.getUTCMinutes(),
		parsedDate.getUTCSeconds(),
		parsedDate.getUTCMilliseconds(),
	));
}

/**
 * Format a date, but using UTC time.
 *
 * The format to use is the one of "date-fns":
 * https://date-fns.org/v3.6.0/docs/format
 *
 * Example:
 * ```
 * const date = new Date(Date.UTC(2024, 8, 5, 14, 22, 10));
 * const formattedUTC = formatUTCDate(date, 'yyyy-MM-dd HH:mm:ss');
 * // formattedUTC will be "2024-09-05 14:22:10" (i.e. UTC time)
 * ```
 *
 * @param date - The date to format.
 * @param dateFormat - The format to use for the date. Use the "date-fns"
 *   format.
 */
export function formatUTCDate(date: Date, dateFormat: string): string {
	const localDate = new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
		date.getUTCMilliseconds(),
	);

	return format(localDate, dateFormat);
}
