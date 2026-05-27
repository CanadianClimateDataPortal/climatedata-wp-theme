import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';

import { useAppSelector } from '@/app/hooks';
import { selectCurrentLocationTitle } from '@/features/map/map-slice';

import S2DReleaseDate from '@/components/s2d-release-date';

import { buildForecastCategories } from '@/components/map-layers/s2d-build-forecast-categories';

import { type ProgressBarProps } from '@/components/ui/progress-bar';

import {
	ModalSummaryPopover,
} from '@/components/ui/modal-summary-popover';

import {
	ForecastTypes,
	S2DFrequencyTypes,
	type ForecastType,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';

import {
	extractSkillLevelData,
	generatePeriodRangeLabel,
	type LocationS2DData,
} from '@/lib/s2d';
import {
	formatValue,
} from '@/lib/format';
import { cn } from '@/lib/utils';

type WithProgressBars = {
	progressBars: ProgressBarProps[];
};

type WithLocationData = {
	locationData: LocationS2DData | null;
};

type WithClassName = {
	className?: string;
};

type HistoricalMedianProbabilities = {
	/**
	 * Percent number against what to test (a possibility) for "less than"
	 */
	threshold: number;
	/**
	 * Text to display if "all probabilities" are "less than"
	 */
	preamble: string;
};

const OUTCOME_PROBABILITIES_PREAMBLE = new Map<
	ForecastType,
	HistoricalMedianProbabilities
>([
	[
		ForecastTypes.EXPECTED,
		{
			threshold: 40,
			preamble: __(
				'As all probabilities are lower than 40%, there is no clear forecast outcome.'
			),
		},
	],
	[
		ForecastTypes.UNUSUAL,
		{
			threshold: 30,
			preamble: __(
				'As both probabilities are lower than 30%, there is no clear forecast outcome.'
			),
		},
	],
]);

type LineTheHistoricalMedianProps =
	WithLocationData &
	WithProgressBars &
	WithClassName;

/**
 * The Historical Median line.
 *
 * Display Historical median line with all information about it
 * and optionnaly a warning when they don't go above a threshold.
 *
 * Summary line about "mean temperature", when
 * none of the probabilities are above 40%, with
 * an historical median at 2.7°C, shown in French,
 * the text would be:
 *
 * > Comme toutes les probabilités sont inférieures à 40 %,
 * > il n’y a aucun résultat significatif.
 * > La médiane historique (2.7 °C) issue de la climatologie
 * > donne une indication des conditions passées typiques.
 */
const LineTheHistoricalMedian = (
	props: LineTheHistoricalMedianProps,
): React.ReactNode => {
	const {
		className = '',
		locationData,
		progressBars,
	} = props;

	const { climateVariable } = useClimateVariable();
	const { locale } = useLocale();

	const forecastType =
		climateVariable?.getForecastType() ?? ForecastTypes.UNUSUAL;
	const unit = climateVariable?.getUnit() ?? '';

	const parts: string[] = [];

	const currentConditions = OUTCOME_PROBABILITIES_PREAMBLE.get(forecastType);
	if (currentConditions) {
		const allPercent = progressBars.map(({ percent }) => percent);
		const allPercentLessThan = allPercent.map(
			(percent) => Math.floor(percent) < currentConditions.threshold
		);
		if (allPercentLessThan.includes(false)) {
			// In other words; NOT "all percents smaller than threshold"
		} else {
			parts.push(currentConditions.preamble);
		}
	}

	if (
		locationData &&
		'historical_median_p50' in locationData
	) {
		const formatted = formatValue(
			locationData.historical_median_p50,
			unit,
			1,
			locale
		);
		const part = sprintf(
			__(
				'The historical median (%s) from the climatology provides an indication of typical past conditions.'
			),
			formatted,
		);
		parts.push(part);

		return (
			<p className={cn(className)}>
				{parts.join(' ')}
			</p>
		);
	}
};


/**
 * The title line.
 *
 * "Forecast Summary for [location]"
 *
 * Example:
 * "Résumé des prévisions pour Anderson Island Protected Area, SK:":
 */
const LineTitleForecastSummaryFor = (
): React.ReactNode => {
	const currentLocationTitle = useAppSelector(selectCurrentLocationTitle);
	let formattedTitle = __('Forecast Summary') + ':';
	if (currentLocationTitle !== null) {
		formattedTitle = sprintf(
			__('Forecast Summary for %s:'),
			currentLocationTitle,
		);
	}
	return (
		<strong className="font-semibold">
			{formattedTitle}
		</strong>
	);
};


type LineTheTimePeriodForVariableHasProps =
	WithClassName;

/**
 * The line under the title.
 *
 * "The [time period] [variable] has a"
 *
 * Example:
 * "La température moyenne pour mai à juillet a"
 */
const LineTheTimePeriodForVariableHas = (
	props: LineTheTimePeriodForVariableHasProps,
): React.ReactNode => {
	const {
		className = '',
	} = props;

	const { climateVariable } = useClimateVariable();
	const { locale } = useLocale();

	const frequency = (climateVariable?.getFrequency() ??
		S2DFrequencyTypes.MONTHLY) as S2DFrequencyType;
	const variableId = climateVariable?.getId();
	const variableName = climateVariable?.getTitle() ?? '';

	const dateRange = climateVariable?.getDateRange();
	// Same logic around dateRangeStart in S2DVariableValues
	const dateRangeStart = dateRange ? dateRange[0] : null;

	let formattedPeriodRange = '';

	if (dateRangeStart !== null) {
		// Same logic around DateRangeLine in S2DVariableValues
		const DateRangeLine = dateRangeStart
			? generatePeriodRangeLabel(dateRangeStart, frequency, locale)
			: null;
		formattedPeriodRange = DateRangeLine !== null ? DateRangeLine : '';
	}

	// A single sprintf template can't produce correct French for both variables:
	// "Les précipitations totales ont" (plural) vs "La température moyenne a" (singular).
	const tooltipOpeningLineVariants = {
		s2d_precip_accum: sprintf(__('The %s total precipitation has a'), formattedPeriodRange) /* from climate-variables.config.ts */,
		s2d_air_temp: sprintf(__('The %s mean temperature has a'), formattedPeriodRange)        /* from climate-variables.config.ts */,
		fallback: sprintf(__('The %s %s has a'), formattedPeriodRange, variableName.toLowerCase()),
	};

	const progressBarsListFirstLine = Reflect.has(
		tooltipOpeningLineVariants,
		variableId ?? 'fallback'
	)
		? Reflect.get(tooltipOpeningLineVariants, variableId ?? 'fallback')
		: Reflect.get(tooltipOpeningLineVariants, 'fallback');

	return (
		<p className={cn(className)}>
			{progressBarsListFirstLine}
		</p>
	);
};


type LineTheSkillLevelForThisLocationProps =
	WithLocationData &
	WithClassName;

export const LineTheSkillLevelForThisLocation = (
	props: LineTheSkillLevelForThisLocationProps,
): React.ReactNode => {
	const {
		className = '',
		locationData,
	} = props;

	if (!locationData) {
		return null;
	}

	const {
		skillLevelLabel,
		skillLevel,
	} = extractSkillLevelData(locationData);

	const guidanceText = [
		/* 0: No skill  */ __('The accuracy of past forecasts was no better than random chance'),
		/* 1: Low skill */ __('The accuracy of past forecasts was a small improvement over random chance'),
		/* 2: Medium    */ __('The accuracy of past forecasts was satisfactory'),
		/* 3: High      */ __('Past forecasts were mostly accurate'),
	][(typeof skillLevel !== 'number') ? 0 : skillLevel];

	const TEMPLATE = sprintf(
		__(
			'The skill level is “%s”. %s for this location, time period, and month of release.'
		),
		skillLevelLabel,
		guidanceText,
	);

	return (
		<p className={cn(className)}>
			{TEMPLATE}
		</p>
	);
};


type LineListForecastCategoriesProps =
	WithProgressBars &
	WithClassName;

const LineListForecastCategories = (
	props: LineListForecastCategoriesProps,
): React.ReactNode => {
	const {
		className = '',
		progressBars,
	} = props;

	const { climateVariable } = useClimateVariable();

	const forecastType =
		climateVariable?.getForecastType() ?? ForecastTypes.UNUSUAL;

	// Category definitions parallel to progressBars, for tooltip content
	const forecastCategories = buildForecastCategories(forecastType);

	return (
		<>
			<ul className={cn('mt-2 list-disc list-outside', className)}>
				{progressBars.map((bar, idx) => (
					<li key={idx} className="mt-2 ml-4">
						{sprintf(
							__('%d%% probability of being %s (%s)'),
							Math.round(bar.percent),
							forecastCategories[idx].term.toLowerCase(),
							bar.labelTooltipCutoff,
						)}
					</li>
				))}
			</ul>
			<p>
				{__('relative to the 1991 to 2020 historical climatology.')}
			</p>
		</>
	);
};


type ForecastSummaryContentsProps =
	WithProgressBars &
	WithLocationData;

const ForecastSummaryContents = (
	props: ForecastSummaryContentsProps,
): React.ReactNode => {
	const {
		progressBars,
		locationData,
	} = props;

	// To make S2D Release Date look like the rest of the text
	// we have to negate all className from the S2DReleaseDate
	// component.
	const CN_RELEASE_DATE = [
		'-font-semibold',
		'-text-dark-purple',
		'-text-xs',
		'-tracking-wider',
		'-uppercase',
	];

	return (
		<>
			<LineTitleForecastSummaryFor />
			<LineTheTimePeriodForVariableHas
				className="mt-2"
			/>
			<LineListForecastCategories
				className="mt-2"
				progressBars={progressBars}
			/>
			<LineTheSkillLevelForThisLocation
				className="mt-2"
				locationData={locationData}
			/>
			<LineTheHistoricalMedian
				className="mt-2"
				locationData={locationData}
				progressBars={progressBars}
			/>
			<p className="mt-2">
				<S2DReleaseDate
					className={cn(CN_RELEASE_DATE)}
					tooltip={false}
				/>
			</p>
			<p className="mt-2">
				{__('Consider checking back for updated forecasts!')}
			</p>
		</>
	);
};


type S2DLocationModalForecastSummaryProps =
	WithLocationData &
	WithProgressBars;

export const S2DLocationModalForecastSummary = (
	props: S2DLocationModalForecastSummaryProps,
): React.ReactNode => {
	const {
		progressBars,
		locationData,
	} = props;

	// 'Forecast Summary' in French would be 'Résumé des Prévisions'
	const popoverTriggerButtonTitle = __('Forecast Summary');
	// The button text, when is the same as 'Forecast Summary' when
	// in french, the Release Date contents may wrap text in a wrong
	// way so we have to keep this button small.
	// We could alternatively use BookOpenText from 'lucide-react'
	const popoverTriggerButtonInner = (
		<>
			{__('Summary')}
		</>
	);
	return (
		<ModalSummaryPopover
			popoverTriggerButtonTitle={popoverTriggerButtonTitle}
			popoverTriggerButtonInner={popoverTriggerButtonInner}
		>
			<ForecastSummaryContents
				progressBars={progressBars}
				locationData={locationData}
			/>
		</ModalSummaryPopover>
	);
};

export default S2DLocationModalForecastSummary;

