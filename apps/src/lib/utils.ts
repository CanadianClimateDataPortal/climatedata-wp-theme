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

	// Add 'to-raster' class to the map container to adjust its appearance for raster output
	const mapObjects = document.getElementById('wrapper-map');
	if (mapObjects) {
		setTimeout(() => {
			// Give it three seconds to make sure everything is loaded.
			mapObjects.classList.add('to-raster');
		}, 3000);
	}
}
