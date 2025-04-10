import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';
import { FrequencyConfig, FrequencyDisplayModeOption, FrequencyType } from "@/types/climate-variable-interface";

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
}

export const isFrequencyEnabled = (config: FrequencyConfig, section: string, frequencyType: FrequencyType): boolean => {
	const configValue = config[frequencyType];
	return Boolean(configValue && (
		configValue === FrequencyDisplayModeOption.ALWAYS ||
		configValue === section
	));
};

export const getDefaultFrequency = (config: FrequencyConfig, section: string) => {
	const hasAnnual = isFrequencyEnabled(config, section, FrequencyType.ANNUAL);
	const hasMonths = isFrequencyEnabled(config, section, FrequencyType.MONTHLY)
	const hasSeasons = isFrequencyEnabled(config, section, FrequencyType.SEASONAL);

	let defaultValue;

	if (hasAnnual) {
		defaultValue = FrequencyType.ANNUAL;
	} else if (hasMonths) {
		defaultValue = 'jan';
	} else if (hasSeasons) {
		defaultValue = 'spring'
	}

	return defaultValue;
}
