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
	type ModalSummaryPopoverProps,
} from '@/components/ui/modal-summary-popover';

import {
	ForecastTypes,
	type ForecastType,
} from '@/types/climate-variable-interface';

import {
	extractSkillLevelData,
	type LocationS2DData,
} from '@/lib/s2d';
import {
	formatValue,
	formatIntlDate,
} from '@/lib/format';
import { cn } from '@/lib/utils';

type ForecastTypeAndProgressBars = {
	forecastType: ForecastType;
	progressBars: ProgressBarProps[];
};

type WithChildren = {
	children?: React.ReactNode[] | React.ReactNode;
};

type LineHistoricalMedianPrefixedWhenProps = ForecastTypeAndProgressBars & WithChildren;

type LineHistoricalMedianPrefixedWhenAllAreLessThan = {
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
	LineHistoricalMedianPrefixedWhenAllAreLessThan
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

/**
 * When Probabilities are lower than a threshold for the current
 * data shown, add a warning about the fact that there is no clear
 * forecast outcome.
 */
const LineHistoricalMedianPrefixedWhen = ({
	forecastType,
	progressBars,
	children,
}: LineHistoricalMedianPrefixedWhenProps): React.ReactNode => {
	const currentCondition = OUTCOME_PROBABILITIES_PREAMBLE.get(forecastType);
	if (!currentCondition) {
		return null;
	}

	const childNodes =
		children && Array.isArray(children) ? children : [children];

	const allPercent = progressBars.map(({ percent }) => percent);
	const allAreSmallerThan = allPercent.map(
		(percent) => Math.floor(percent) < currentCondition.threshold
	);
	let historicalMedianPreamble = '';
	if (allAreSmallerThan.includes(false)) {
		// In other words; not "all percents smaller than threshold"
		historicalMedianPreamble = '';
	} else {
		historicalMedianPreamble = currentCondition.preamble + ' ';
	}

	return (
		<p className="mt-2">
			{historicalMedianPreamble}
			{...childNodes}
		</p>
	);
};

LineHistoricalMedianPrefixedWhen.displayName = 'LineHistoricalMedianPrefixedWhen';

const LineTitleForecastSummary = (): React.ReactNode => {
	let outcome: React.ReactNode = null;
	const currentLocationTitle = useAppSelector(selectCurrentLocationTitle);
	if (currentLocationTitle !== null) {
		outcome = (
			<p className="font-semibold">
				{sprintf(
					__('Forecast Summary for %s:'),
					currentLocationTitle,
				)}
			</p>
		);
	}

	return outcome;
};

LineTitleForecastSummary.displayName = 'LineTitleForecastSummary';

type LineSkillLevelProps = {
	locationData: LocationS2DData | null;
};

export const LineSkillLevel = (
	props: LineSkillLevelProps,
): React.ReactNode => {
	const {
		locationData,
	} = props;

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
		__('The skill level is “%s”. %s for this location, time period, and month of release.'),
		skillLevelLabel,
		guidanceText,
	);

	return (
		<p className="mt-2">
			{TEMPLATE}
		</p>
	);
};

LineSkillLevel.displayName = 'LineSkillLevel';

type ForecastSummaryContentsProps = ForecastTypeAndProgressBars & {
	locationData: LocationS2DData | null;
};

export const ForecastSummaryContents = (
	props: ForecastSummaryContentsProps,
): React.ReactNode => {
	const {
		forecastType,
		progressBars,
		locationData,
	} = props;
	const { climateVariable } = useClimateVariable();
	const { locale } = useLocale();

	const variableId = climateVariable?.getId();
	const variableName = climateVariable?.getTitle() ?? '';
	const unit = climateVariable?.getUnit() ?? '';
	const dateRange = climateVariable?.getDateRange() ?? [];

	// [time period] => "mai à juil."
	const periodRange = dateRange.map((i) => formatIntlDate(i, locale, { month: 'short' }));

	let formattedPeriodRange = '';
	if (periodRange) {
		if (forecastType === ForecastTypes.EXPECTED) {
			formattedPeriodRange = sprintf(__('%s to %s'), periodRange[0], periodRange[1]);
		} else {
			formattedPeriodRange = periodRange[0];
		}
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

	// Category definitions parallel to progressBars, for tooltip content
	const forecastCategories = buildForecastCategories(forecastType);

	const CN_RELEASE_DATE = [
		'-font-semibold',
		'-text-dark-purple',
		'-text-xs',
		'-tracking-wider',
		'-uppercase',
	];

	return (
		<>
			<LineTitleForecastSummary />
			<p className="mt-2">{progressBarsListFirstLine}</p>
			<ul className="mt-2 list-disc list-outside">
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
			<p className="mt-2">
				{__('relative to the 1991 to 2020 historical climatology.')}
			</p>
			<LineSkillLevel locationData={locationData} />
			<LineHistoricalMedianPrefixedWhen
				forecastType={forecastType}
				progressBars={progressBars}
			>
				{locationData && sprintf(
					__(
						'The historical median (%s) from the climatology provides an indication of typical past conditions.'
					),
					formatValue(
						locationData.historical_median_p50,
						unit,
						1,
						locale
					),
				)}
			</LineHistoricalMedianPrefixedWhen>
			<p className="mt-2">
				<S2DReleaseDate className={cn(CN_RELEASE_DATE)} tooltip={false} />
			</p>
			<p className="mt-2">
				{__('Consider checking back for updated forecasts!')}
			</p>
		</>
	);
};

ForecastSummaryContents.displayName = 'ForecastSummaryContents';

export type ForecastSummaryPopoverProps = ForecastSummaryContentsProps & ModalSummaryPopoverProps & {
};

export const ForecastSummaryPopover = (
	props: ForecastSummaryPopoverProps,
): React.ReactNode => {
	const {
		forecastType,
		progressBars,
		locationData,
	} = props;

	return (
		<ModalSummaryPopover
			buttonTitle={__('Forecast Summary')}
		>
			<ForecastSummaryContents
				forecastType={forecastType}
				progressBars={progressBars}
				locationData={locationData}
			/>
		</ModalSummaryPopover>
	);
};

ForecastSummaryPopover.displayName = 'ForecastSummaryPopover';
