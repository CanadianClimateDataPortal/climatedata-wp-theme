import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';
import {
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
} from '@/types/climate-variable-interface';
import { RootState } from '@/app/store';
import { PartialState } from '@/types/types';
import {
	ClimateVariableConfigInterface,
	AveragingType,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';

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
	} else if (
		[
			'jan',
			'feb',
			'mar',
			'apr',
			'may',
			'jun',
			'jul',
			'aug',
			'sep',
			'oct',
			'nov',
			'dec',
		].includes(frequency)
	) {
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

// URL Param Config (from url-param-config.ts)
export const STATE_TO_URL_CONFIG: {
	[K in keyof Partial<ClimateVariableConfigInterface>]: {
		urlKey: string;
		transform?: {
			toURL?: <V extends NonNullable<ClimateVariableConfigInterface[K]>>(
				value: V
			) => string;
			fromURL?: (value: string) => ClimateVariableConfigInterface[K];
		};
	};
} = {
	id: { urlKey: 'var' },
	version: { urlKey: 'ver' },
	threshold: { urlKey: 'th' },
	frequency: { urlKey: 'freq' },
	scenario: { urlKey: 'scen' },
	scenarioCompare: {
		urlKey: 'cmp',
		transform: {
			toURL: (value: boolean) => (value ? '1' : '0'),
			fromURL: (value: string) => value === '1',
		},
	},
	scenarioCompareTo: { urlKey: 'cmpTo' },
	interactiveRegion: {
		urlKey: 'region',
		transform: {
			toURL: (value: InteractiveRegionOption) => value.toString(),
			fromURL: (value: string) => value as InteractiveRegionOption,
		},
	},
	dataValue: { urlKey: 'dataVal' },
	colourScheme: { urlKey: 'clr' },
	colourType: { urlKey: 'clrType' },
	averagingType: {
		urlKey: 'avg',
		transform: {
			toURL: (value: AveragingType) => value.toString(),
			fromURL: (value: string) => value as AveragingType,
		},
	},
};

// URL State Functions (from url-state.ts)
export const stateToUrlParams = (state: RootState): URLSearchParams => {
	const params = new URLSearchParams();

	// climate variable state
	if (state.climateVariable?.data) {
		Object.entries(STATE_TO_URL_CONFIG).forEach(([stateKey, config]) => {
			const key = stateKey as keyof ClimateVariableConfigInterface;
			const value = state.climateVariable.data?.[key];

			if (value !== undefined && value !== null) {
				if (config.transform?.toURL) {
					const transformer = config.transform.toURL as (
						val: typeof value
					) => string;
					params.set(config.urlKey, transformer(value));
				} else {
					params.set(config.urlKey, String(value));
				}
			}
		});
	}

	// map state
	if (state.map) {
		// Time period (already array-based for slider component)
		if (state.map.timePeriodEnd?.length) {
			params.set('period', state.map.timePeriodEnd[0].toString());
		}

		// Map variable (if it's a string - could be an object in some cases)
		if (typeof state.map.variable === 'string') {
			params.set('mapVar', state.map.variable);
		}

		// Decade
		if (state.map.decade) {
			params.set('decade', state.map.decade);
		}

		// Threshold value
		if (state.map.thresholdValue !== undefined) {
			params.set('threshold', state.map.thresholdValue.toString());
		}

		// Interactive region
		if (state.map.interactiveRegion) {
			params.set('mapRegion', state.map.interactiveRegion);
		}

		// it looks like we don't have a direct setFrequency action
		if (state.map.frequency) {
			params.set('mapFreq', state.map.frequency);
		}

		// Map color scheme
		if (state.map.mapColor) {
			params.set('color', state.map.mapColor);
		}

		// Opacity settings
		if (state.map.opacity) {
			if (state.map.opacity.mapData !== undefined) {
				params.set(
					'dataOpacity',
					Math.round(state.map.opacity.mapData * 100).toString()
				);
			}
			if (state.map.opacity.labels !== undefined) {
				params.set(
					'labelOpacity',
					Math.round(state.map.opacity.labels * 100).toString()
				);
			}
		}
	}

	return params;
};

export const urlParamsToState = (params: URLSearchParams): PartialState => {
	const state: PartialState = {
		climateVariable: {
			data: {
				// Set a default class to ensure provider doesn't error
				class: 'RasterPrecalculatedClimateVariable',
			},
			searchQuery: '',
		},
		map: {},
	};

	// URL parameters based on config
	Object.entries(STATE_TO_URL_CONFIG).forEach(([stateKey, config]) => {
		const urlValue = params.get(config.urlKey);
		if (urlValue && state.climateVariable?.data) {
			const key = stateKey as keyof ClimateVariableConfigInterface;
			const transformer = config.transform?.fromURL;
			const value = transformer ? transformer(urlValue) : urlValue;
			if (state.climateVariable.data) {
				(state.climateVariable.data as any)[key] = value;
			}
		}
	});

	// Handle map-specific parameters
	if (state.map) {
		// Time period
		const period = params.get('period');
		if (period) {
			const periodNum = parseInt(period);
			if (!isNaN(periodNum)) {
				state.map.timePeriodEnd = [periodNum];
			}
		}

		// Map variable
		const mapVar = params.get('mapVar');
		if (mapVar) {
			state.map.variable = mapVar;
		}

		// Decade
		const decade = params.get('decade');
		if (decade) {
			state.map.decade = decade;
		}

		// Threshold value
		const threshold = params.get('threshold');
		if (threshold) {
			const thresholdNum = parseInt(threshold);
			if (!isNaN(thresholdNum)) {
				state.map.thresholdValue = thresholdNum;
			}
		}

		// Interactive region
		const mapRegion = params.get('mapRegion');
		if (mapRegion) {
			state.map.interactiveRegion = mapRegion;
		}

		// Frequency
		const mapFreq = params.get('mapFreq');
		if (mapFreq) {
			state.map.frequency = mapFreq;
		}

		// Map color scheme
		const color = params.get('color');
		if (color) {
			state.map.mapColor = color;
		}

		// Opacity settings
		if (!state.map.opacity) {
			state.map.opacity = { mapData: 1, labels: 1 };
		}

		const dataOpacity = params.get('dataOpacity');
		if (dataOpacity) {
			const opacityNum = parseInt(dataOpacity);
			if (!isNaN(opacityNum)) {
				state.map.opacity.mapData = opacityNum / 100;
			}
		}

		const labelOpacity = params.get('labelOpacity');
		if (labelOpacity) {
			const opacityNum = parseInt(labelOpacity);
			if (!isNaN(opacityNum)) {
				state.map.opacity.labels = opacityNum / 100;
			}
		}
	}

	return state;
};

export const syncStateToUrl = (state: RootState): void => {
	const params = stateToUrlParams(state);
	const newUrl = `${window.location.pathname}?${params.toString()}`;
	window.history.replaceState({}, '', newUrl);
};
