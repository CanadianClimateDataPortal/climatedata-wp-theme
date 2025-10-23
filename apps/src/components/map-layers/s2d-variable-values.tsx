import React from 'react';

import { __ } from '@/context/locale-provider';
import { useLocale } from '@/hooks/use-locale';

import { formatValue } from '@/lib/format';
import { type S2DVariableValuesComponentProps } from '@/lib/s2d-variable-values';

import TooltipWidget from '@/components/ui/tooltip-widget';
import StarRating from '@/components/ui/star-rating';
import ProgressBar, {
	type ProgressBarProps,
} from '@/components/ui/progress-bar';
import { SidebarFooterReleaseDate } from '@/components/sidebar-inner-s2d';
import { sprintf } from '@wordpress/i18n';

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

const tooltipSkillLevelSuffix = __(
	'The past performance or “skill” of the prediction system is measured ' +
	'using the continuous ranked probability skill score (CRPSS). CRPSS ' +
	'measures the accuracy of forecasts produced for the same lead time as ' +
	'the selected forecast and for the same month, season, or decadal time ' +
	'period over 1991 to 2020.'
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
		'The skill level at this location is No Skill (CRPSS value is 0.00 ' +
		'or below): The accuracy of past forecasts was no better than random ' +
		'chance, so the forecast should not be used. The historical ' +
		'climatology is a better guide than the forecast and can be used ' +
		'instead.'
	),
	__(
		'The skill level at this location is Low (CRPSS value is between ' +
		'0.00 and 0.05): Past forecasts provided only a small improvement ' +
		'over random chance. Use these forecasts with caution and consider ' +
		'consulting both the forecasts and the historical climatology.'
	),
	__(
		'The skill level at this location is Medium (CRPSS value is between ' +
		'0.05 and 0.25): The accuracy of past forecasts was satisfactory. ' +
		'The forecast is a better guide than the historical climatology.'
	),
	__(
		'The skill level at this location is High (CRPSS value is above ' +
		'0.25): Past forecasts were mostly accurate. The forecast is ' +
		'considered trustworthy.'
	),
];

export const S2DVariableValues: React.FC<S2DVariableValuesComponentProps> = ({
	dateRangeYears,
	historicalMedian,
	nearNormalTemperatureRange,
	skill,
}) => {
	const { locale } = useLocale();

	const DateRangeLine = <>July to Sept.</>; // #Temporary

	const skillLevel = skill.value as number

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

	const tooltipSkillLevel = (
		<>
			<p className="mb-2">{SKILL_LEVEL_TOOLTIP[skillLevel]}</p>
			<p>{tooltipSkillLevelSuffix}</p>
		</>
	);

	const formatTemperature = (value: number): string =>
		formatValue(value, 'degC', 1, locale as string);

	const PROGRESS_BARS: ProgressBarProps[] = [
		// #Temporary
		{
			label: sprintf(LABEL_ABOVE, formatTemperature(7.5)),
			percent: 11,
			fillHexCode: '#8abbd1',
		},
		{
			label: sprintf(
				LABEL_RANGE,
				formatTemperature(-4.9),
				formatTemperature(7.5),
			),
			percent: 34,
			fillHexCode: '#5871a3',
		},
		{
			label: sprintf(LABEL_BELOW, formatTemperature(-4.9)),
			percent: 3,
			fillHexCode: '#cf9ad6',
		},
	];

	const SkillLevelLine = (
		<>
			{SkillLevelLabel}
			{' - '}
			<abbr
				lang="en"
				title="Continuous Ranked Probability Skill Score"
			>
				CRPSS
			</abbr>
			{': '}
			{formatValue(skill.crpss, '', 2, locale)}
		</>
	);

	const NearNormalTemperatureRangeLine = (
		<>
			{nearNormalTemperatureRange && (
				<data value={nearNormalTemperatureRange.join(',')}>
					{sprintf(
						LABEL_RANGE,
						formatTemperature(nearNormalTemperatureRange[0]),
						formatTemperature(nearNormalTemperatureRange[1]),
					)}
				</data>
			)}
		</>
	);

	const HistoricalMeanLine = (
		<>
			{formatTemperature(historicalMedian.value)}
		</>
	);

	const DateRangeYearsLine = Array.isArray(dateRangeYears)
		? '(' + dateRangeYears.join(' - ') + ')'
		: '';

	return (
		<div className="mt-4">
			<dl className="relative grid grid-cols-2 mb-3 gap-x-4 gap-y-3 items-start">
				{/* Seasonal */}
				<div className="flex flex-col-reverse mb-1">
					<dt className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
						{__('Seasonal')}
					</dt>
					<dd className="mb-1 text-2xl font-semibold text-brand-blue">
						{DateRangeLine}
					</dd>
				</div>

				{/* Skill Level */}
				<div
					className="flex flex-col-reverse mb-1"
					role="group"
					aria-labelledby="skill-level-label"
				>
					<dt id="skill-level-label" className="mt-0">
						<div className="flex flex-row gap-2">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{__('Skill Level')}
							</span>
							<TooltipWidget tooltip={tooltipSkillLevel} />
						</div>
						<div className="text-xs text-neutral-grey-medium">
							({SkillLevelLine})
						</div>
					</dt>
					<dd className="mb-2 mt-1 text-xs uppercase text-neutral-grey-medium">
						<StarRating value={2} maxStars={3} />
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
						<div className="text-xs text-neutral-grey-medium">
							{DateRangeYearsLine}
						</div>
					</dt>
					<dd className="mb-1 text-2xl font-semibold text-brand-blue">
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
						<div className="text-xs text-neutral-grey-medium">
							{DateRangeYearsLine}
						</div>
					</dt>
					<dd className="mb-1 text-2xl font-semibold text-brand-blue">
						{NearNormalTemperatureRangeLine}
					</dd>
				</div>
			</dl>

			<section aria-labelledby="probability-heading" className="mt-9">
				<h3
					id="probability-heading"
					className="mb-3 text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium"
				>
					{__('Seasonal mean temperature probability:')}
				</h3>
				<div className="border-x border-cold-grey-2 relative">
					<div className="absolute h-full top-0 border-l border-cold-grey-2 left-1/4"></div>
					<div className="absolute h-full top-0 border-l border-cold-grey-2 left-1/2"></div>
					<div className="absolute h-full top-0 border-l border-cold-grey-2 left-3/4"></div>
					{PROGRESS_BARS.map((props, idx) => (
						<ProgressBar key={idx} {...props} />
					))}
				</div>
			</section>

			<section className="mt-9">
				<SidebarFooterReleaseDate />
			</section>
		</div>
	);
};

S2DVariableValues.displayName = 'S2DVariableValues';

export default S2DVariableValues;
