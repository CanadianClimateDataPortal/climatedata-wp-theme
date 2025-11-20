import React from 'react';
import { __ } from '@/context/locale-provider';
import { sprintf } from '@wordpress/i18n';
import { cn } from '@/lib/utils';
import { bestContrastingColor } from '@/lib/colors';

export type HexColor = `#${string}`;

export interface ProgressBarProps {
	/**
	 * Text to use on top of the progress bar.
	 */
	label: string;
	/**
	 * The width as a percent the bar with background color
	 * (using fillColor) will take up. A number between 0 and 100.
	 */
	percent: number;
	/**
	 * Color code to use for the bar
	 */
	fillHexCode: HexColor;
}

/**
 * Progress Bar to illustrate a percent value.
 * The label being shown is centered vertically and on top of the filled bar.
 * The label's color is light or dark based on the luminosity of the fill color.
 * On the right of the filled bar, we see the percent value aligned with the label text.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
	label,
	percent,
	fillHexCode,
}) => {
	const screenReaderOnly = sprintf(__('Horizontal bar at %s%% filled'), percent);
	const textLightColor = 'text-white';
	const textDarkColor = 'text-black';
	const labelColor = percent < 50
		// Dark text color is used in case the percentage bar is not long enough
		? textDarkColor
		: bestContrastingColor(fillHexCode, textDarkColor, textLightColor);
	// If the percentage >= this threshold, we will show the percentage
	// value *inside* the bar and in white.
	const innerPercentageThreshold = 94;

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
			style={{ '--fill-color': fillHexCode } as React.CSSProperties}
		>
			{/* Layer 1: Background */}
			<div className="absolute" />

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
					fill="var(--fill-color)"
					style={{ fill: 'var(--fill-color)' }}
					rx="6"
				/>
			</svg>

			{/* Layer 3: Text with float layout */}
			<div
				className="absolute inset-0 flex items-center text-sm overflow-hidden"
				style={{
					maxWidth: percent >= innerPercentageThreshold
						? `calc(${percent}% - 2%)`
						: 'none',
				}}
			>
				<div
					className={cn(
						labelColor,
						'font-medium pl-3 min-w-fit',
					)}
					style={{
						width: `${percent}%`,
					}}
				>
					{label}
				</div>
				<div
					className={cn(
						percent >= innerPercentageThreshold
							? labelColor :
							'text-blue-600',
						'font-medium pl-2'
					)}
				>
					{percent}%
				</div>
			</div>
		</div>
	);
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
