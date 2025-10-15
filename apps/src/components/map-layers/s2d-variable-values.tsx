import {
	memo,
	useState,
	useEffect,
	type ReactNode,
} from 'react';

import { __ } from '@/context/locale-provider';

import { formatValueTemperature } from '@/lib/value-temperature';
import {
	classNameMappingForS2DVariableValues,
	type S2DVariableValuesComponentProps,
} from '@/lib/s2d-variable-values';

import TooltipWidget from '@/components/ui/tooltip-widget';
import ValueTemperature from '@/components/value-temperature';
import {
	default as ProgressBar,
	type ProgressBarProps,
} from '@/components/progress-bar';

const ft = (value: number): string =>
	formatValueTemperature({
		value: String(value),
		unit: 'celsius',
		locale: 'fr-CA',
	});

const helper = classNameMappingForS2DVariableValues;

const joinRangeWord = __('to');

/**
 * This will be much easier when #622 is merged
 */
const formatDateRangeAsText = (range: [Date, Date]): string => {
	let out: string = '';

	let parts = [
		range?.[0]?.getMonth(),
		range?.[1]?.getMonth(),
	].map(
		(i) => String(i) + 'th'
	);

	parts = ['July', 'Sept']; // TODO using #622

	if (parts.length === 2) {
		out += parts.join(` ${joinRangeWord} `) + '.';
	}

	return out;
};

const formatDateRangeYearsAsText = ([begin, end]: [Date, Date]): string => {
	let out: string = '';

	const parts = [+begin.getFullYear(), +end.getFullYear()];

	out += parts.join(' - ');

	return out;
};

const formatTemperatureRangeAsText = (
	input: S2DVariableValuesComponentProps['temperatureRange']
) => {
	let out: string = '';

	const parts = (input ?? []).map((v, idx, arr) => {
		if (arr.length === 2) {
			if (idx === 0) {
				return ft(v).split(' ')[0];
			} else {
				return ft(v);
			}
		}
	});
	if (parts.length === 2) {
		out = parts.join(` ${joinRangeWord} `);
	}

	return out;
};

export default memo(function S2DVariableValues(
	props: S2DVariableValuesComponentProps
): ReactNode {
	const { dateRange, temperatureRange, historicalMedian } = props;

	const [dateRangeAsText, dateRangeAsTextSetter] = useState('...');
	const [dateRangeYearsText, dateRangeYearsTextSetter] = useState('');
	const [temperatureRangeAsText, temperatureRangeAsTextSetter] = useState('');

	useEffect(() => {
		dateRangeAsTextSetter(formatDateRangeAsText(dateRange));
		dateRangeYearsTextSetter(formatDateRangeYearsAsText(dateRange));
		temperatureRangeAsTextSetter(formatTemperatureRangeAsText(temperatureRange));
	}, [
		dateRange,
		dateRangeAsTextSetter,
		dateRangeYearsTextSetter,
		temperatureRange,
		temperatureRangeAsTextSetter,
	]);

	const { emphasisText, smallSubTitleUnderEmphasis } = helper.get();

	const PROGRESS_BARS: ProgressBarProps[] = [
		{
			label: `Above ${ft(7.5)}`,
			percent: 11,
			colorKey: 'warm',
		},
		{
			label: `${ft(-4.9)} to ${ft(7.5)}`,
			percent: 34,
			colorKey: 'neutral',
		},
		{
			label: `Below ${ft(-4.9)}`,
			percent: 55,
			colorKey: 'cool',
		},
	];

	return (
		<>
			<div className="mt-4 mb-4">
				<div className="flex mb-3" data-comment="1st Row">
					<div
						className="w-1/2"
						data-comment="Top Left"
						title="Range description"
					>
						<div className={`mb-1 ${emphasisText}`}>
							{dateRangeAsText}
						</div>
						<div className={`${smallSubTitleUnderEmphasis}`}>
							{__('Seasonal')}
						</div>
					</div>
					<div
						className="w-1/2"
						data-comment="Top Right"
						title="Skill widget thing"
					>
						<div className="grid grid-cols-1 place-content-center gap-4 p-8">
							<div className="flex flex-row items-center justify-center gap-2">
								<div
									className={`${smallSubTitleUnderEmphasis}`}
								>
									{__('Skill Level')}
								</div>
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
						<div className={`${emphasisText}`}>
							<ValueTemperature value={historicalMedian?.value} />
						</div>
						<div className="flex flex-row gap-2 control-title">
							<div className={`${smallSubTitleUnderEmphasis}`}>
								{__('Historical Median')}
							</div>
							<TooltipWidget tooltip="Historical Median tooltip text" />
						</div>
						<div className="text-xs">({dateRangeYearsText})</div>
					</div>
					<div className="w-1/2" data-comment="1st Right" title="TBD">
						<div className={`${emphasisText}`}>
							{temperatureRangeAsText}
						</div>
						&nbsp;
					</div>
				</div>
				<div className="flex flex-col mb-3 pt-2" data-comment="3rd Row">
					<div className={`${smallSubTitleUnderEmphasis} mb-3`}>
						SEASONAL MEAN TEMPERATURE PROBABILITY:
					</div>
					{
						PROGRESS_BARS.map(({ label, percent, colorKey }) => (
						<ProgressBar
							label={label}
							percent={percent}
							colorKey={colorKey}
						/>))}
				</div>
			</div>
		</>
	);
});
