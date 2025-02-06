import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import validator from 'validator';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isValidEmail = (email: string): boolean => {
	return validator.isEmail(email);
};