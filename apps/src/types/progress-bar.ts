
/**
 * String literal type for hex color codes, e.g. "#FFFFFF".
 */
export type HexColor = `#${string}`;

export interface ProgressBarProps {
	/**
	 * Text to use on top of the progress bar.
	 */
	label: string;
	/**
	 * Compact cutoff form for the TooltipWidget text,
	 * e.g. "> 3.5 °C", "1.8 to 3.5 °C", "< 1.0 mm/day".
	 */
	labelTooltipCutoff: string;
	/**
	 * The width as a percent the bar with background color
	 * (using fillColor) will take up. A number between 0 and 100.
	 */
	percent: number;
	/**
	 * Color code to use for the bar
	 * @see {@link HexColor}
	 */
	fillHexCode: HexColor;
}

