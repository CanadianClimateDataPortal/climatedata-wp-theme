/**
 * Return the relative luminance for RGB values (WCAG formula)
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
 * Convert a hex color code to 3 RGB numbers.
 *
 * A hex color is a 3 or 6 hexadecimal characters string. It can be prefixed
 * with '#' or not.
 *
 * Examples of valid hex colors: '#ff6b35', '#3DF', '8f345d', '3C9'
 *
 * @param hex - The hex color code
 */
export const hexToRgb = (hex: string): [number, number, number] => {
	const clean = hex.replace('#', '');

	if (clean.length !== 3 && clean.length !== 6) {
		throw new Error(
			'Expecting a 3 or 6-character hex color code, got: ' +
				hex +
				' instead.'
		);
	}

	const bigint = parseInt(
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean,
		16
	);

	if (Number.isNaN(bigint)) {
		throw new Error('Cannot parse hexadecimal code: ' + hex);
	}

	return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

/**
 * Return the best contrasting color (light or dark) for a given color.
 *
 * The choice between light and dark is based on the luminance of the base
 * color, e.g., if the base color has low luminance, the `lightColor` is
 * returned.
 *
 * @param baseColor - The color, in hex format, for which to get the contrasting
 *     color.
 * @param darkColor - The color to return if the base color has high luminance.
 * @param lightColor - The color to return if the base color has low luminance.
 * @param luminanceThreshold - The luminance threshold to consider the base
 *     color light or dark.
 * @returns The `darkColor` or `lightColor` based on the luminance of the
 *     `baseColor`.
 *
 * @example Usage Example
 * ```typescript
 * const fillColor = '#ff6b35'; // Color with a low luminance
 * bestContrastingColor(fillColor); // Returns '#FFFFFF'
 * ```
 */
export const bestContrastingColor = (
	baseColor: string,
	darkColor: string = '#000',
	lightColor: string = '#FFF',
	luminanceThreshold: number = 0.5
): string => {
	const [r, g, b] = hexToRgb(baseColor);
	const luminance = getLuminance(r, g, b);
	return luminance < luminanceThreshold ? lightColor : darkColor;
};
