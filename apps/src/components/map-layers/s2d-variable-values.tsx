import React from 'react';

import { __ } from '@/context/locale-provider';
import { useLocale } from '@/hooks/use-locale';

import { formatValue } from '@/lib/format';
import { type S2DVariableValuesComponentProps } from '@/lib/s2d-variable-values';

import TooltipWidget from '@/components/ui/tooltip-widget';
import SkillLevelStars from '@/components/ui/skill-level';
import ProgressBar, {
	//
	type ProgressBarProps,
} from '@/components/ui/progress-bar';

const tooltipHistoricalMedian = __(
	'The median of the historical climatology for the month, season, ' +
		'or decadal time period of interest between 1991 and 2020. ' +
		'The median splits the historical data into two equal parts (50th percentile). ' +
		'It is a measure of typical past conditions.'
);

const tooltipTemperatureRange = __(
	'The near-normal range is defined using the historical climatology for the month, ' +
		'season, or decadal time period of interest between 1991 and 2020. ' +
		'The historical data is divided into three equal parts and the ‘near-normal’ ' +
		'range is defined using the middle third, providing a range of typical past conditions.'
);

const LABEL_ABOVE = __('Above %s');

const LABEL_RANGE = __('%s to %s');

const LABEL_BELOW = __('Below %s');

const SKILL_LEVEL_LABELS = [
	//
	__('No skill'),
	__('Low'),
	__('Medium'),
	__('High'),
];

/**
 * All the tooltip texts in order of 0-3 from 'no skill' to 'high'.
 */
const SKILL_LEVEL_TOOLTIP = [
	//
	__(
		'No Skill (CRPSS value is 0.00 or below): The accuracy of past forecasts was no better than random chance, so the forecast should not be used. The historical climatology is a better guide than the forecast and can be used instead.'
	),
	__(
		'Low (CRPSS value is between 0.00 and 0.05): Past forecasts provided only a small improvement over random chance. Use these forecasts with caution and consider consulting both the forecasts and the historical climatology.'
	),
	__(
		'Medium (CRPSS value is between 0.05 and 0.25): The accuracy of past forecasts was satisfactory. The forecast is a better guide than the historical climatology.'
	),
	__(
		'High (CRPSS value is above 0.25): Past forecasts were mostly accurate. The forecast is considered trustworthy.'
	),
];

const formatTemperatureLabel = (
	template: string,
	values: number | number[],
	locale: Intl.LocalesArgument
): string => {
	const valuesArray = Array.isArray(values) ? values : [values];
	let result = template;
	for (const value of valuesArray) {
		const formatted = formatValue(value, 'degC', 1, locale as string);
		result = result.replace('%s', formatted);
	}
	if (valuesArray.length > 1) {
		result = result.replace(/ °C/, ''); // #Temporary hack to remove first
	}
	return result;
};

export const S2DVariableValues: React.FC<S2DVariableValuesComponentProps> = ({
	dateRangeYears,
	historicalMedian,
	nearNormalTemperatureRange,
	skill,
}) => {
	const { locale } = useLocale();

	const DateRangeLine = <>July to Sept.</>; // #Temporary

	const skillLevel = skill.value as number
	const SkillLevelTooltipSuffix = SKILL_LEVEL_TOOLTIP[skillLevel];

	/**
	 * We might even be able to use the following code instead of another copy.
	 * Unless the {@link SkillLevelTooltipSuffix} gets translation text without the
	 * convention of prefixing the text "High (...) ..." where we would have the text we need.
	 *
	 * @example
	 * ```typescript
	 * const SkillLevelLabel = SkillLevelTooltipSuffix.split(' (')[0];
	 * ```
	 *
	 * @see {@link SKILL_LEVEL_TOOLTIP}
	 */
	const SkillLevelLabel = SKILL_LEVEL_LABELS[skillLevel]; // #Temporary

	const tooltipSkillLevel = __('The skill level at this location is') + ' ' + SkillLevelTooltipSuffix;

	const formatTemperature = (value: number): string =>
		formatValue(value, 'degC', 1, locale as string);

	const PROGRESS_BARS: ProgressBarProps[] = [
		// #Temporary
		{
			label: formatTemperatureLabel(LABEL_ABOVE, 7.5, locale),
			percent: 11,
			fillHexCode: '#8abbd1',
		},
		{
			label: formatTemperatureLabel(LABEL_RANGE, [-4.9, 7.5], locale),
			percent: 34,
			fillHexCode: '#5871a3',
		},
		{
			label: formatTemperatureLabel(LABEL_BELOW, -4.9, locale),
			percent: 3,
			fillHexCode: '#cf9ad6',
		},
	];

	const SkillLevelLine = (
		<>
			{SkillLevelLabel}
			{' - '}
			{
				<abbr
					lang="en"
					title="Continuous Ranked Probability Skill Score"
				>
					CRPSS
				</abbr>
			}
			{': '}
			{skill?.crpss ?? ''}
		</>
	);

	const NearNormalTemperatureRangeLine = (
		<>
			{nearNormalTemperatureRange && (
				<data value={nearNormalTemperatureRange.join(',')}>
					{formatTemperatureLabel(
						LABEL_RANGE,
						nearNormalTemperatureRange,
						locale
					)}
				</data>
			)}
		</>
	);

	const HistoricalMeanLine = (
		<>
			{historicalMedian?.value &&
				formatTemperature(historicalMedian?.value)}
		</>
	);

	const DateRangeYearsLine = Array.isArray(dateRangeYears)
		? '(' + dateRangeYears.join(' - ') + ')'
		: '';

	return (
		<div className="mt-4 mb-4">
			<dl className="grid grid-cols-2 mb-3 gap-x-4">
				{/* Seasonal */}
				<div className="flex flex-col-reverse mb-3">
					<dt className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
						{__('Seasonal')}
					</dt>
					<dd className="mb-2 text-2xl font-semibold text-brand-blue">
						{DateRangeLine}
					</dd>
				</div>

				{/* Skill Level */}
				<div
					className="flex flex-col-reverse mb-3"
					role="group"
					aria-labelledby="skill-level-label"
				>
					<dt id="skill-level-label">
						<div className="flex flex-row gap-2">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{__('Skill Level')}
							</span>
							<TooltipWidget tooltip={tooltipSkillLevel} />
						</div>
						<div>({SkillLevelLine})</div>
					</dt>
					<dd className="mb-1 text-xs uppercase text-neutral-grey-medium">
						<SkillLevelStars skillLevel={skillLevel} />
					</dd>
				</div>

				{/* Historical Median */}
				<div
					className="flex flex-col-reverse"
					role="group"
					aria-labelledby="historical-median-label"
				>
					<dt id="historical-median-label">
						<div className="flex flex-row gap-2 mb-1">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{__('Historical Median')}
							</span>
							<TooltipWidget tooltip={tooltipHistoricalMedian} />
						</div>
						<div className="text-xs">{DateRangeYearsLine}</div>
					</dt>
					<dd className="mb-2 text-2xl font-semibold text-brand-blue">
						{HistoricalMeanLine}
					</dd>
				</div>

				{/* Near-Normal Range */}
				<div
					className="flex flex-col-reverse"
					role="group"
					aria-labelledby="temperature-range-label"
				>
					<dt id="temperature-range-label">
						<div className="flex flex-row gap-2 mb-1">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{__('Near-Normal Range')}
							</span>
							<TooltipWidget tooltip={tooltipTemperatureRange} />
						</div>
						<div className="text-xs">{DateRangeYearsLine}</div>
					</dt>
					<dd className="mb-2 text-2xl font-semibold text-brand-blue">
						{NearNormalTemperatureRangeLine}
					</dd>
				</div>
			</dl>

			<section aria-labelledby="probability-heading">
				<h3
					id="probability-heading"
					className="mb-3 text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium"
				>
					{__('Seasonal mean temperature probability:')}
				</h3>
				{PROGRESS_BARS.map((props, idx) => (
					<ProgressBar key={idx} {...props} />
				))}
			</section>
		</div>
	);
};

S2DVariableValues.displayName = 'S2DVariableValues';

export default S2DVariableValues;
