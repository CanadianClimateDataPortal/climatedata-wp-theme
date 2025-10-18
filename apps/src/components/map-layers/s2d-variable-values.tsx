import {
	memo,
	useState,
	useEffect,
	type ReactNode,
} from 'react';

import { __ } from '@/context/locale-provider';

import { formatValueTemperature } from '@/lib/value-temperature';
import {
	type S2DVariableValuesComponentProps,
} from '@/lib/s2d-variable-values';

import TooltipWidget from '@/components/ui/tooltip-widget';
import SkillLevelStars from '@/components/ui/skill-level';
import ValueTemperature from '@/components/value-temperature';
import {
	default as ProgressBar,
	type ProgressBarProps,
} from '@/components/progress-bar';

const ft = (value: number): string =>
	formatValueTemperature({
		value,
		unit: 'celsius',
		locale: 'fr-CA',
	});


const joinRangeWord = __('to');

/**
 * This will be much easier when #622 is merged or using @/lib/format
 */
const formatDateRangeAsText = (range: [Date, Date]): string => {
	let out: string = '';

	let parts = [
		range?.[0]?.getMonth(),
		range?.[1]?.getMonth(),
	].map(
		(i) => String(i) + 'th'
	);

	parts = ['July', 'Sept']; // TODO using #622 or using @/lib/format

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
	input: S2DVariableValuesComponentProps['nearNormalTemperatureRange']
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

const PROGRESS_BARS: ProgressBarProps[] = [
	{
		label: `Above ${ft(7.5)}`,
		percent: 11,
		fillHexCode: '#8abbd1',
	},
	{
		label: `${ft(-4.9)} to ${ft(7.5)}`,
		percent: 34,
		fillHexCode: '#5871a3',
	},
	{
		label: `Below ${ft(-4.9)}`,
		percent: 3,
		fillHexCode: '#cf9ad6',
	},
	{
		label: `Lorem Ipsum`,
		percent: 77,
		fillHexCode: '#8fe3ba',
	},
	{
		label: `Dolor Sit Amet`,
		percent: 95,
		fillHexCode: '#b2c2c0',
	},
];

/**
 * CRPS, such as other words that are not obvious should instead be annotated as an abbreviation
 *
 * @example
 * ```html
 * <abbr title="Charlie Romeo Papa Silva Silva">CRPSS</abbr>
 * ```
 *
 * @TODO: When figuring out what text to use in this list, make sure CRPSS is nested with appropriate semantic HTML.
 */
const HARDCODED_SKILL_LEVEL_PARENS = 'MEDIUM - CRPSS: ';

const tooltipTextPrefixSkillLevel = __(`The skill level at this location is`); // TODO: Find proper text as it's been inadvertenly modified.

const tooltipTextPrefixHistoricalMedian = __(
	`
	The median of the historical climatology for the month, season,
	or decadal time period of interest between 1991 and 2020.
	The median splits the historical data into two equal parts (50th percentile).
	It is a measure of typical past conditions.
`.trim()
);

export default memo(function S2DVariableValues(
	props: S2DVariableValuesComponentProps
): ReactNode {
	const {
		dateRange,
		nearNormalTemperatureRange,
		historicalMedian,
		skill,
	} = props;

	const [dateRangeAsText, dateRangeAsTextSetter] = useState('...');
	const [dateRangeYearsText, dateRangeYearsTextSetter] = useState('');
	const [temperatureRangeAsText, temperatureRangeAsTextSetter] = useState('');

	useEffect(() => {
		dateRangeAsTextSetter(formatDateRangeAsText(dateRange));
		dateRangeYearsTextSetter(formatDateRangeYearsAsText(dateRange));
		temperatureRangeAsTextSetter(formatTemperatureRangeAsText(nearNormalTemperatureRange));
	}, [
		dateRange,
		nearNormalTemperatureRange,
	]);

	const tooltipSkillLevel = tooltipTextPrefixSkillLevel + '...'; // @TODO: Calculate the proper text from here.

	const tooltipHistoricalMedian = tooltipTextPrefixHistoricalMedian; // @TODO: Calculate the proper text from here.

	const tooltipTemperatureRange = __(
		`
		The near-normal range is defined using the historical climatology for the month,
		season, or decadal time period of interest between 1991 and 2020.
		The historical data is divided into three equal parts and the ‘near-normal’
		range is defined using the middle third, providing a range of typical past conditions.
	`.trim()
	);

	return (
		<>
			<div className={`mt-4 mb-4`}>
				<div
					className={`flex mb-3`}
					data-comment="1st Row"
				>
					<div
						className={`w-1/2`}
						data-comment="1st Row, Left"
						id="row-0-left"
					>
						<div
							className={`mb-2 font-semibold text-brand-blue text-2xl`}
							data-value-text
						>
							{dateRangeAsText}
						</div>
						<div className={`text-xs uppercase text-neutral-grey-medium font-semibold tracking-wider`}>
							{__('Seasonal')}
						</div>
					</div>
					<div
						className={`w-1/2`}
						data-comment="1st Row, Right"
						id="row-0-right"
					>
						<div
							className={`mb-2 mt-2`}
						>
							<SkillLevelStars skillLevel={skillLevel} />
						</div>
						<div className={`flex flex-row gap-2`}>
							<div className={`text-xs uppercase text-neutral-grey-medium font-semibold tracking-wider`}>
								{__('Skill Level')}
							</div>
							<TooltipWidget tooltip={tooltipSkillLevel} />
						</div>
						<div className={`text-xs uppercase text-neutral-grey-medium`}>({HARDCODED_SKILL_LEVEL_PARENS + (skill.crpss ? skill.crpss : '')})</div>
					</div>
				</div>

				<div
					className={`flex mb-3`}
					data-comment="2nd Row"
				>
					<div
						className={`w-1/2`}
						data-comment="2nd Row, Left"
						id="row-1-left"
					>
						<div
							className={`font-semibold text-brand-blue text-2xl`}
							data-value-text
						>
							<ValueTemperature value={historicalMedian?.value} />
						</div>
						<div className={`flex flex-row gap-2`}>
							<div
								className={`text-xs uppercase text-neutral-grey-medium font-semibold tracking-wider`}
								id="historical-median"
							>
								{__('Historical Median')}
							</div>
							<TooltipWidget tooltip={tooltipHistoricalMedian} />
						</div>
						<div className={`text-xs`}>({dateRangeYearsText})</div>
					</div>
					<div
						className={`w-1/2`}
						id="row-1-right"
						data-comment="2nd Row, Right"
					>
						<div
							className={`font-semibold text-brand-blue text-2xl`}
						>
							{temperatureRangeAsText}
						</div>
						<div className={`flex flex-row gap-2`}>
							<div
								className={`text-xs uppercase text-neutral-grey-medium font-semibold tracking-wider`}
							>
								{__('Near-Normal Range')}
							</div>
							<TooltipWidget tooltip={tooltipTemperatureRange} />
						</div>
						<div className={`text-xs`}>({dateRangeYearsText})</div>
					</div>
				</div>
				<div
					className={`flex flex-col pt-2 mb-3`}
					data-comment="3rd Row"
				>
					<div className={`text-xs uppercase text-neutral-grey-medium mb-3`}>
						{__('Seasonal mean temperature probability:') }
					</div>
					{PROGRESS_BARS.map((props) => <ProgressBar { ...props } />)}
				</div>
			</div>
		</>
	);
});
