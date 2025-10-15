import {
	memo,
	type ReactNode,
} from 'react';

interface ClassNameMap extends Record<string, string> {
	/**
	 * SVG fill color for the progress bar
	 * Example: 'fill-orange-400'
	 */
	labelBgColor: string;

	/**
	 * Text color for the percentage label
	 * Should contrast well with fillColor for readability
	 */
	labelTextColor: string;
}

const MAP_DATA: [string, ClassNameMap][] = [
	[
		'warm',
		{
			labelBgColor: 'fill-orange',
			labelTextColor: 'text-orange-600',
		},
	],
	[
		'neutral',
		{
			labelBgColor: 'fill-blue-400',
			labelTextColor: 'text-blue-600',
		},
	],
	[
		'cool',
		{
			labelBgColor: 'fill-cyan-300',
			labelTextColor: 'text-cyan-600',
		},
	],
] as const;

export type ProgressBarColorKeys = (typeof MAP_DATA)[number][0];

const FALLBACK_COLOR_KEY: ProgressBarColorKeys = 'warm';

const CLASS_NAME_MAP = new Map<ProgressBarColorKeys, ClassNameMap>(MAP_DATA);

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
	colorKey: ProgressBarColorKeys;
}

/**
 * Progress Bar to illustrate a percent value.
 * The label being shown is centered vertically and on top of the filled bar.
 * On the right of the filled bar, we see the percent value aligned with the label text.
 */
const ProgressBar = memo(function ProgressBarFn({
	label,
	percent,
	colorKey,
}: ProgressBarProps): ReactNode {
	let classMap = CLASS_NAME_MAP.get(colorKey);
	if (!classMap) {
		classMap = CLASS_NAME_MAP.get(FALLBACK_COLOR_KEY) as ClassNameMap;
	}

	const { labelBgColor, labelTextColor } = classMap;

	const screenReaderOnly = `Horizontal bar at ${percent}% filled`;

	/**
	 * aria-value and role=meter:
	 *
	 * See equivalent implementation from radix-ui.
	 *
	 * https://www.radix-ui.com/primitives/docs/components/progress
	 * https://www.w3.org/WAI/ARIA/apg/patterns/meter/
	 **/
	return (
		<div
			title={screenReaderOnly}
			className="relative w-full h-10 mb-2"
			role="meter"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={percent}
			data-current-color-key={colorKey}
		>
			{/* Layer 1: Background */}
			<div className="absolute inset-0 bg-gray-100 rounded" />

			{/* Layer 2: SVG filled bar */}
			<svg
				className="absolute inset-0"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
			>
				<rect
					x="0"
					y="0"
					width={`${percent}%`}
					height="100%"
					className={labelBgColor}
					rx="4"
				/>
			</svg>

			{/* Layer 3: Text with float layout */}
			<div className="absolute inset-0 flex items-center text-sm overflow-hidden">
				<div
					className="text-gray-700 font-medium pl-3"
					style={{
						width: `${percent}%`,
						minWidth: 'fit-content',
					}}
				>
					{label}
				</div>
				<div className={`${labelTextColor} font-medium pl-2`}>
					{percent}%
				</div>
			</div>
		</div>
	);
});

export default ProgressBar;
