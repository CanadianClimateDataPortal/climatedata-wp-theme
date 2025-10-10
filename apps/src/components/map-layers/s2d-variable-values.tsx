import React, { memo } from 'react';

import TooltipWidget from '@/components/ui/tooltip-widget';
import ValueTemperature from '@/components/value-temperature';
import ProgressBar, { buildProgressBarProps } from '@/components/progress-bar';
import { formatValueTemperature } from '@/components/value-temperature';

const PATTERNS_CLASS_NAME = [
	['alpha', 'text-xs uppercase text-neutral-grey-medium'],
] as const;

const classMaps = new Map(PATTERNS_CLASS_NAME) as ReadonlyMap<string, string>;

const cn = (key: string): string => {
	let v = '';
	const attempt = classMaps.get(key);
	if (!attempt) {
		const message = `There's nothing for key: "${key}"`;
		throw new Error(message);
	}
	v = attempt;
	return v;
};

const ft = (value: number): string =>
	formatValueTemperature({
		value: String(value),
		unit: 'celsius',
		locale: 'fr-CA',
	});

export default memo(function S2DVariableValues(): React.ReactNode {
	return (
		<>
			<div className="mt-4 mb-4">
				<div className="flex mb-3" data-comment="1st Row">
					<div
						className="w-1/2"
						data-comment="Top Left"
						title="Range description"
					>
						<div className="mb-1 text-2xl text-brand-blue">
							July to Sept.
						</div>
						<div className={cn('alpha')}>
							SEASONAL
						</div>
					</div>
					<div
						className="w-1/2"
						data-comment="Top Right"
						title="Skill widget thing"
					>
						<div className="grid grid-cols-1 place-content-center gap-4 p-8">
							<div className="flex flex-row items-center justify-center gap-2">
								<div className={cn('alpha')}>SKILL LEVEL</div>
								<TooltipWidget tooltip="Skill Level tooltip text" />
							</div>
						</div>
					</div>
				</div>
				<div className="flex mb-3" data-comment="2nd Row">
					<div
						className="w-1/2"
						data-comment="1st Left"
						title="Historical Median"
					>
						<div className="text-2xl text-brand-blue">
							<ValueTemperature value="1.3" />
						</div>
						<div className="flex flex-row gap-2 control-title">
							<div className={cn('alpha')}>
								HISTORICAL MEDIAN
							</div>
							<TooltipWidget tooltip="Historical Median tooltip text" />
						</div>
						<div className="text-xs">(1991-2020)</div>
					</div>
					<div
						className="w-1/2 bg-slate-100"
						data-comment="1st Right"
						title="TBD"
					>
						&nbsp;
					</div>
				</div>
				<div className="flex flex-col mb-3" data-comment="3rd Row">
					<div className="text-xs uppercase text-neutral-grey-medium mb-3">
						SEASONAL MEAN TEMPERATURE PROBABILITY:
					</div>
					<ProgressBar
						{...buildProgressBarProps(
							`Above ${ft(7.5)}`,
							11,
							'warm'
						)}
					/>
					<ProgressBar
						{...buildProgressBarProps(
							`${ft(-4.9)} to ${ft(7.5)}`,
							34,
							'neutral'
						)}
					/>
					<ProgressBar
						{...buildProgressBarProps(
							`Below ${ft(-4.9)}`,
							55,
							'cool'
						)}
					/>
				</div>
			</div>
		</>
	);
});
