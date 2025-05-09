import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';
import { FrequencyConfig, FrequencyDisplayModeOption, FrequencyType } from '@/types/climate-variable-interface';

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

export const getFrequencyCode = (frequency: string) => {
	let frequencyCode = '';

	if (frequency === 'ann') {
		frequencyCode = 'ys';
	} else if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(frequency)) {
		frequencyCode = 'ms';
	} else if (['spring', 'summer', 'fall', 'winter'].includes(frequency)) {
		frequencyCode = 'qsdec';
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
 * Validates and parses a latitude,longitude string.
 *
 * @param str A string in the format "lat,lng"
 * @returns An object with parsed lat/lng values or nulls if invalid
 */
export const isLatLong = (str: string) => {
	// Regular expression to match a pair of decimal numbers separated by a comma
	// Allows optional negative sign and optional decimal places, with optional space after comma
	const regex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;

	// Attempt to match the input string with the regex
	const match = str.match(regex);
	if (!match) return { lat: null, lng: null }; // Return nulls if the format doesn't match

	// Parse the matched latitude and longitude values
	const lat = parseFloat(match[1]);
	const lng = parseFloat(match[3]);

	// Check if latitude and longitude are within valid geographic ranges
	if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
		return { lat: lat, lng: lng }; // Return parsed coordinates if valid
	}

	// Return nulls if values are out of valid geographic range
	return { lat: null, lng: null };
};

