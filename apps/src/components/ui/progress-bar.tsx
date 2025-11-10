import React from 'react';
import { __ } from '@/context/locale-provider';
import { sprintf } from '@wordpress/i18n';
import { getContrastingTextColor } from '@/lib/color-contrast';

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
 * On the right of the filled bar, we see the percent value aligned with the label text.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
	label,
	percent,
	fillHexCode,
}) => {
	const screenReaderOnly = sprintf(__('Horizontal bar at %s%% filled'), percent);

	let textHexCode = getContrastingTextColor(fillHexCode);
	if (textHexCode.startsWith('#FFF') && percent < 51) {
		// if the filled area is less than 51%, we won't be able to read the text white on white
		textHexCode = '#000000';
	}

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
			<div className="absolute inset-0 flex items-center text-sm overflow-hidden">
				<div
					className="text-black font-medium pl-3 min-w-fit"
					style={{
						width: `${percent}%`,
						color: textHexCode,
					}}
				>
					{label}
				</div>
				<div
					className="text-blue-600 font-medium pl-2"
					style={{
						textShadow: 'rgba(255, 255, 255, 1) 0px 0px 3px',
					}}
				>
					{percent}%
				</div>
			</div>
		</div>
	);
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
