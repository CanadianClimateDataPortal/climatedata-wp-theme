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
export const splitTextByMatch = (text: string, searchTerm: string): Array<{text: string, isMatch: boolean}> => {
  if (!searchTerm || !text) return [{ text, isMatch: false }];
  
  const escapedSearchTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split the text by regex, preserving matches
  const parts = text.split(regex);
  
  // Map the parts to include whether they match or not
  const result = parts.map(part => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return { text: part, isMatch: true };
    }
    return { text: part, isMatch: false };
  });
  
  // Filter out empty parts
  return result.filter(part => part.text.length > 0);
};