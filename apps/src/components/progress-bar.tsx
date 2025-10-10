import React, { memo } from 'react';

import {
	buildProgressBarProps,
	type ClassNameKeysTuple,
	type ProgressBarProps,
} from '@/lib/progress-bar';

export {
	buildProgressBarProps,
	type ClassNameKeysTuple,
	type ProgressBarProps,
};

export default memo(function ProgressBarFn({
	label,
	percent,
	fillColor,
}: ProgressBarProps): React.ReactNode {
	return (
		<div className="relative w-full h-10 mb-2">
			<div className="absolute inset-0 bg-gray-100 rounded"></div>
			<div
				className={`absolute inset-y-0 left-0 rounded ${fillColor}`}
				style={{ width: `${percent}%` }}
			></div>
			<div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
				<span className="font-medium text-gray-700">{label}</span>
				<span className={`text-blue-500 font-medium`}>{percent}%</span>
			</div>
		</div>
	);
});
