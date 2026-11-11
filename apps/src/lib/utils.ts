import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';
import { isFrequencyTypeS2D } from '@/types/assertions';
import {
	AveragingType,
	ColourType,
	type CustomColourSchemes,
	DateRangeConfig,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionOption,
	type S2DFrequencyType,
	type ThresholdInterface,
} from '@/types/climate-variable-interface';
import { __ } from '@/context/locale-provider';
import { ParsedLatLon } from '@/types/types';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
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

export const getFrequencyType = (
	frequency: string,
): S2DFrequencyType | FrequencyType | undefined =>  {
	let frequencyCode;

	if (frequency === 'ann') {
		frequencyCode = FrequencyType.YS;
	} else if (frequency === 'annual_jul_jun') {
		frequencyCode = FrequencyType.YSJUL;
	} else if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(frequency)) { // KEEPING_ONLY_ONE_LIST_OF_STRINGS_ENGLISH_MONTHS_NAMES(?)
		frequencyCode = FrequencyType.MS;
	} else if (['spring', 'summer', 'fall', 'winter'].includes(frequency)) {
		frequencyCode = FrequencyType.QSDEC;
	} else if (isFrequencyTypeS2D(frequency)) {
		frequencyCode = frequency;
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
	const hasAnnualJul = isFrequencyEnabled(
		config,
		section,
		FrequencyType.ANNUAL_JUL_JUN,
	);
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
	} else if (hasAnnualJul) {
		defaultValue = FrequencyType.ANNUAL_JUL_JUN;
	} else if (hasMonths) {
		defaultValue = 'jan';
	} else if (hasSeasons) {
		defaultValue = 'spring';
	}

	return defaultValue;
};

/**
 * @REMARK CLIM-1500 END: These looks good, in order to merge we need further reviewing.
 * - Comments should describe things that we cannot see while reading the code
 * - Formatting adjustments (Renoir will make a commit with message body RENOIR_FORMATTING_ADJUSTMENTS)
 * - Ensure we make-use of existing symbols (e.g. if there's an existing list of months as string, do not make a new one KEEPING_ONLY_ONE_LIST_OF_STRINGS_ENGLISH_MONTHS_NAMES)
 *
 * What's great in what's been added here is that they are tested outside of a web browser.
 */

/**
 * Tells whether a frequency code is offered by a frequency config in a section.
 * It mirrors the options that FrequencySelect renders: a month code needs
 * MONTHLY or ALL_MONTHS, a season code needs SEASONAL, and any other code
 * needs its own key in the config.
 */
export const isFrequencyOffered = (
	config: FrequencyConfig,
	section: string,
	frequency: string
): boolean => {
	if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(frequency)) { // KEEPING_ONLY_ONE_LIST_OF_STRINGS_ENGLISH_MONTHS_NAMES(?)
		return isFrequencyEnabled(config, section, FrequencyType.MONTHLY)
			|| isFrequencyEnabled(config, section, FrequencyType.ALL_MONTHS);
	}

	if (['spring', 'summer', 'fall', 'winter'].includes(frequency)) {
		return isFrequencyEnabled(config, section, FrequencyType.SEASONAL);
	}

	// FrequencySelect renders the MONTHLY item for ALL_MONTHS too, in the
	// download type ANALYZED.
	if (frequency === FrequencyType.MONTHLY) {
		return isFrequencyEnabled(config, section, FrequencyType.MONTHLY)
			|| isFrequencyEnabled(config, section, FrequencyType.ALL_MONTHS);
	}

	return Object.values(FrequencyType).includes(frequency as FrequencyType)
		&& isFrequencyEnabled(config, section, frequency as FrequencyType);
};
/**
 * Finds the threshold value of the next variable that carries the same label
 * as the previous value in the previous variable. The values differ per
 * variable, for example rl20tasmax and rl20pr, while the label, here
 * "1-in-20 year", is the same. An empty label never matches.
 */
export const thresholdValueForSameLabel = (
	previousThresholds: ThresholdInterface[],
	nextThresholds: ThresholdInterface[],
	previousValue: string
): string | null => {
	const label = previousThresholds.find(
		(threshold) => threshold.value === previousValue
	)?.label;
	if (!label) {
		return null;
	}

	return nextThresholds.find((threshold) => threshold.label === label)?.value ?? null;
};
/**
 * Gives the previous date range back when the time period control of the next
 * variable could have produced it, else null. The range control
 * (TimePeriodsControl) stores a start and an end exactly one interval apart.
 * The single-thumb control (TimePeriodsControlSingle) stores the same year
 * twice. Both ends must lie inside the min and max of the config. The stored
 * shape tells a range pair from a single year, so a range pair never passes
 * for a single-thumb variable, nor the reverse. The ends and the bounds are
 * read as years. A pair or a config of full dates never matches, such as an
 * S2D date range or the day-type config of StationDataClimateVariable.
 */
export const dateRangeOfferedBy = (
	config: DateRangeConfig | null,
	isRange: boolean,
	previousDateRange: string[] | null | undefined
): string[] | null => {
	if (!config || !previousDateRange || previousDateRange.length !== 2) {
		return null;
	}

	const start = Number(previousDateRange[0]);
	const end = Number(previousDateRange[1]);
	const min = Number(config.min);
	const max = Number(config.max);
	if (![start, end, min, max].every(Number.isInteger)) {
		return null;
	}
	if (start < min || end > max) {
		return null;
	}

	const shapeMatches = isRange
		? end - start === config.interval
		: start === end;

	return shapeMatches ? previousDateRange : null;
};
/**
 * Gives the previous compared scenario back when the next variable offers it
 * and it differs from the main scenario of the next variable, else null. The
 * list is the one getScenarios() gives for the version of the next variable,
 * so a cmip5 scenario never passes against a cmip6 list. The main scenario is
 * the one the sidebar shows, from getScenario(), which may be the default
 * rather than the previous main scenario. EmissionScenariosControl hides the
 * main scenario from the second select, so a compared scenario equal to it
 * could not have been chosen there.
 */
export const scenarioCompareToOfferedBy = (
	nextScenarios: string[],
	nextMainScenario: string | null,
	previousCompareTo: string | null | undefined
): string | null => {
	if (!previousCompareTo || previousCompareTo === nextMainScenario) {
		return null;
	}

	return nextScenarios.includes(previousCompareTo) ? previousCompareTo : null;
};
/**
 * Gives the previous data value back when the next variable shows the Values
 * control, else null. The control is DataValuesControl, and app-sidebar.tsx
 * renders it only when hasDelta() of the variable is truthy. Its two options,
 * absolute and delta, are fixed in the component, so the flag is the whole
 * check. getDataValue() returns a stored delta unchecked, so a delta kept on a
 * variable without delta would still reach the map layer with no control to
 * undo it.
 */
export const dataValueOfferedBy = (
	nextHasDelta: boolean | undefined,
	previousDataValue: string | null | undefined
): string | null => {
	if (!nextHasDelta || !previousDataValue) {
		return null;
	}

	return previousDataValue;
};
/**
 * Gives the previous colour scheme back when the Map colours control of the
 * next variable shows and lists it, else null. app-sidebar.tsx renders the
 * control only when getColourOptionsStatus() is true. A hidden control means
 * the variable does not offer the scheme, because getColourScheme() still
 * colours the map and the user would have no control to undo it. The list is
 * the one ColourSchemeDropdown builds: the keys of the custom schemes when
 * getCustomColourSchemes() gives some, else the keys of DEFAULT_COLOUR_SCHEMES
 * plus the item default. The caller passes DEFAULT_COLOUR_SCHEMES, so this
 * file does not import the map constants.
 */
export const colourSchemeOfferedBy = (
	nextColourOptionsStatus: boolean,
	nextCustomColourSchemes: CustomColourSchemes | null,
	defaultColourSchemes: Record<string, unknown>,
	previousColourScheme: string | null | undefined
): string | null => {
	if (!nextColourOptionsStatus || !previousColourScheme) {
		return null;
	}

	const offeredSchemes = nextCustomColourSchemes
		? Object.keys(nextCustomColourSchemes)
		: ['default', ...Object.keys(defaultColourSchemes)];

	return offeredSchemes.includes(previousColourScheme) ? previousColourScheme : null;
};
/**
 * Gives the previous colour type back when the colour scheme carried to the
 * next variable shows the Discrete and Continuous choice, else null.
 * MapColorsDropdown renders that choice only for a scheme that is set and is
 * not default, so the type follows the scheme. The caller passes the scheme
 * that colourSchemeOfferedBy() gave back. A value outside the ColourType enum
 * never passes.
 */
export const colourTypeOfferedBy = (
	carriedColourScheme: string | null,
	previousColourType: string | null | undefined
): string | null => {
	if (!carriedColourScheme || carriedColourScheme === 'default' || !previousColourType) {
		return null;
	}

	return Object.values(ColourType).includes(previousColourType as ColourType)
		? previousColourType
		: null;
};
/**
 * Gives the previous averaging type back when the next variable shows the
 * averaging control and its averaging options include the type, else null.
 * The only averaging control is the radio group of StepAdditionalDetails in
 * the download wizard. The map app has none. The radio group lists the options
 * of getAveragingOptions(), and filters every option out for an S2D variable.
 * An S2D variable still inherits both options from the fallback of
 * RasterPrecalculatedClimateVariable, so the caller passes whether the next
 * variable is S2D. A hidden control means the variable does not offer the
 * value. The options hold the class fallbacks, for example both options for
 * RasterPrecalculatedClimateVariable and none for StationClimateVariable.
 */
export const averagingTypeOfferedBy = (
	nextIsS2D: boolean,
	nextAveragingOptions: AveragingType[],
	previousAveragingType: AveragingType | null | undefined
): AveragingType | null => {
	if (nextIsS2D || !previousAveragingType) {
		return null;
	}

	return nextAveragingOptions.includes(previousAveragingType) ? previousAveragingType : null;
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
		case 'DoY-jul':
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
		[InteractiveRegionOption.USER]: __('Upload a Custom Shapefile'),
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
			return mid;
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

/**
 * Converts a given value into a JSON string, with optional rounding for numeric
 * values.
 *
 * @param value - The value to be converted into a JSON string. Only values
 *         supported by JSON.stringify() are supported. `undefined` is not
 *         supported.
 * @param maxDecimals - The maximum number of decimal places for numeric values.
 *        If null, no rounding is applied.
 * @throws {Error} If the `value` is `undefined`.
 * @throws {Error} If `maxDecimals` is negative.
 * @return The JSON string representation of the input value.
 */
export function toJSONString(
	value: unknown,
	maxDecimals: number | null = null,
): string {
	if (value === undefined) {
		throw new Error('Value cannot be undefined');
	}

	const formatDecimals = (value: number) => {
		if (maxDecimals != null) {
			if (maxDecimals < 0) {
				throw new Error('maxDecimals must be a non-negative integer');
			}
			const decimalsMultiplier = Math.pow(10, Math.round(maxDecimals));
			return Math.round(value * decimalsMultiplier) / decimalsMultiplier;
		}
		return value;
	}

	const format = (value: unknown) => {
		if (typeof value === 'number' && Number.isFinite(value)) {
			return formatDecimals(value);
		}
		return value;
	}

	return JSON.stringify(
		value,
		(_, value) => format(value),
	);
}

/**
 * Return the number of elements in an array, recursively.
 *
 * @param array
 *
 * @example
 * ```typescript
 * const myArray = [1, 2, [3, 4, [5, 6]]];
 * console.log(myArray.length) // 3
 * console.log(arraySize(myArray)) // 6
 * ```
 */
export function arraySize(array: unknown | unknown[]): number {
	if (Array.isArray(array)) {
		return array.reduce((acc, item) => acc + arraySize(item), 0);
	} else {
		return 1;
	}
}
