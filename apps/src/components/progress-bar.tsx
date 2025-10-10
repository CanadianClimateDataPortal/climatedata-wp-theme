import {
	memo,
	type ReactNode,
} from 'react';

import {
	buildProgressBarProps,
	type ProgressBarClassNames,
	type ProgressBarProps,
} from '@/lib/progress-bar';

export {
	buildProgressBarProps,
	type ProgressBarClassNames,
	type ProgressBarProps,
};

/**
 * TODO:
 *
 * See how radix-ui does it, and accessibility ("meter pattern")
 *
 * https://www.radix-ui.com/primitives/docs/components/progress
 * https://www.w3.org/WAI/ARIA/apg/patterns/meter/
 */
export const ProgressBar = memo(function ProgressBarFn({
	label,
	percent,
	classMap,
}: ProgressBarProps): ReactNode {
	const {
		fillColor,
		textColor,
	} = classMap;
	const screenReaderOnly = `Horizontal bar at ${percent}% filled`;
	return (
		<div
			className="relative w-full h-10 mb-2"
			role="meter"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow={percent}
			title={screenReaderOnly}
		>
			<div className="absolute inset-0 bg-gray-100 rounded"></div>
			<div
				className={`absolute inset-y-0 left-0 rounded ${fillColor}`}
				style={{ width: `${percent}%` }}
			></div>
			<div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
				<span className={`font-medium text-gray-700 ${textColor}`}>
					{label}
				</span>
				<span className={`text-blue-500 font-medium`}>{percent}%</span>
			</div>
		</div>
	);
});

export default ProgressBar;

export const ProgressBarTwo = memo(function ProgressBarTwoFn({
	label,
	percent,
	classMap,
}: ProgressBarProps): React.ReactNode {
	const screenReaderOnly = `Horizontal bar at ${percent}% filled`;
	const { textColor, svgFillColor } = classMap;
	return (
		<div title={screenReaderOnly} className={`mb-2`}>
			<svg width="100%" height="40">
				<rect
					x="0"
					y="0"
					width="100%"
					height="40"
					className={`fill-transparent`}
					rx="4"
				/>
				<rect
					x="0"
					y="0"
					width={`${percent}%`}
					height="40"
					className={`${svgFillColor}`}
					rx="4"
				/>
				<text
					x="12"
					y="24"
					className={`text-gray-700 font-medium text-sm`}
				>
					{label}
				</text>
				<text
					x={`${percent}%`}
					dx="8"
					y="24"
					className={`${textColor} font-medium text-sm`}
				>
					{percent}%
				</text>
			</svg>
		</div>
	);
});
