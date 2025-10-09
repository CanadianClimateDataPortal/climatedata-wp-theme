import React, { useState } from 'react';

import { type LocationModalContentParams } from '@/types/climate-variable-interface';

import TooltipWidget from '@/components/ui/tooltip-widget';

const PATTERNS_CLASS_NAME = new Map();
PATTERNS_CLASS_NAME.set('alpha', 'text-xs uppercase text-neutral-grey-medium');

const patternKeys = [...PATTERNS_CLASS_NAME.keys()];

const getClassNames = (key: string): string => {
	const attempt = PATTERNS_CLASS_NAME.get(key);
	if (!attempt) {
		const message = `Unknown pattern key "${key}", we only have: ${patternKeys}`;
		throw Error(message);
	}
	return attempt;
};

export default function S2DVariableValues({
	mode = 'modal',
}: Partial<LocationModalContentParams>): React.ReactNode {
	// Question: What's the business with modal and non modal? In which other situations is this used?
	const [currentMode, setCurrentMode] = useState(mode);
	// See in:
	// -  MedianOnlyVariableValues
	// Something to manipulate in DevTools until we fix workspace to have proper React DevTools
	Reflect.set(window, 'CURRENT_WORK_ITEM_TEMPORARY_HANDLE', {
		currentMode,
		setCurrentMode,
	});

	return (
		<>
			<div className="mt-4 mb-4">
				<div className="flex mb-3" data-comment="1st Row">
					<div
						className="w-1/2 bg-red-300"
						data-comment="Top Left"
						title="Range description"
					>
						<div className="mb-1 text-2xl text-brand-blue">
							July to Sept.
						</div>
						<div className={getClassNames('alpha')}>SEASONAL</div>
					</div>
					<div
						className="w-1/2 bg-orange-300"
						data-comment="Top Right"
						title="Skill widget thing"
					>
						<div className="flex flex-row gap-2 control-title">
							<div className={getClassNames('alpha')}>
								SKILL LEVEL
							</div>
							<TooltipWidget tooltip="Skill Level tooltip text" />
						</div>
					</div>
				</div>
				<div className="flex mb-3" data-comment="2nd Row">
					<div
						className="w-1/2 bg-red-500"
						data-comment="1st Left"
						title="Historical Median"
					>
						<div className="text-2xl text-brand-blue">
							1.3 deg C
						</div>
						<div className="flex flex-row gap-2 control-title">
							<div className={getClassNames('alpha')}>
								HISTORICAL MEDIAN
							</div>
							<TooltipWidget tooltip="Historical Median tooltip text" />
						</div>
						<div className="text-xs">(1991-2020)</div>
					</div>
				</div>
			</div>
		</>
	);
}
