import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';

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
