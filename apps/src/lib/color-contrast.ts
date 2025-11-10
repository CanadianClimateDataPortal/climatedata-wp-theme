import type { HexColor } from '@/components/ui/progress-bar';

/**
 * Calculate relative luminance (WCAG formula)
 * Returns value between 0 (black) and 1 (white)
 */
export const getLuminance = (r: number, g: number, b: number): number => {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const srgb = c / 255;
		return srgb <= 0.03928
			? srgb / 12.92
			: Math.pow((srgb + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Convert hex color to RGB values as a 3 items long tuple.
 */
export const hexToRgb = (hex: HexColor): [number, number, number] => {
	const clean = hex.replace('#', '');
	const bigint = parseInt(
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean,
		16
	);

	return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

/**
 * Get contrasting text color (black or white) for given background.
 *
 * @param bgColor - Background color in hex format
 * @returns '#000000' or '#ffffff'
 *
 * @example Usage Example
 * ```typescript
 * const fillColor: HexColor = '#ff6b35';
 * getContrastingTextColor(fillColor); // Returns '#000000' or '#ffffff'
 * ```
 */
export const getContrastingTextColor = (
	bgColor: HexColor,
	lightTextColor: HexColor = '#000',
	darkTextColor: HexColor = '#FFF',
): HexColor => {
	const [r, g, b] = hexToRgb(bgColor);
	const luminance = getLuminance(r, g, b);

	// WCAG threshold: 0.5 works well for most cases
	return luminance < 0.5 ? darkTextColor : lightTextColor;
};
