
import { createClassNameMappingHelper } from '@/lib/class-name-mapping';

/**
 * CSS class name mappings for progress bar color roles
 */
export interface ProgressBarClassNames extends Record<string, string>{
	/**
	 * Background fill color for the progress bar (CSS background)
	 * Example: 'bg-orange-400'
	 */
	fillColor: string;

	/**
	 * SVG fill color for the progress bar
	 * Example: 'fill-orange-400'
	 */
	svgFillColor: string;

	/**
	 * Text color for the percentage label
	 * Should contrast well with fillColor for readability
	 */
	textColor: string;
}

const classMaps = new Map<string, ProgressBarClassNames>([
	[
		'warm',
		{
			fillColor: 'bg-orange-400',
			svgFillColor: 'fill-orange-400',
			textColor: 'text-orange-600',
		},
	],
	[
		'neutral',
		{
			fillColor: 'bg-blue-400',
			svgFillColor: 'fill-blue-400',
			textColor: 'text-blue-600',
		},
	],
	[
		'cool',
		{
			fillColor: 'bg-cyan-300',
			svgFillColor: 'fill-cyan-300',
			textColor: 'text-cyan-600',
		},
	],
]);

export interface ProgressBarProps {
	/**
	 * Text to use on top of the progress bar.
	 */
	label: string;
	/**
	 * The width as a percent the bar with background color
	 * (using fillColor) will take up.
	 */
	percent: number;
	/**
	 * What to use for className
	 */
	classMap: ProgressBarClassNames;
}

export const progressBarClassNameMapping =
	createClassNameMappingHelper(classMaps);

export function buildProgressBarProps(
	label: string,
	percent: number,
	colorKey: string
): ProgressBarProps {
	const classMap = progressBarClassNameMapping.get(colorKey);
	return {
		label,
		percent,
		classMap,
	};
}
