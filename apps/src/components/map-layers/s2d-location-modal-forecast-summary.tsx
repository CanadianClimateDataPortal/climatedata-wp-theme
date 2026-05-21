import React from 'react';
import { sprintf } from '@wordpress/i18n';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	type PopoverContentSide,
} from '@/components/ui/popover';

import { __ } from '@/context/locale-provider';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';
import { useCurrentLocationTitle } from '@/hooks/use-current-location';

import S2DReleaseDate from '@/components/s2d-release-date';

import { buildForecastCategories } from '@/components/map-layers/s2d-build-forecast-categories';

import { type ProgressBarProps } from '@/components/ui/progress-bar';

import {
	ForecastTypes,
	S2DFrequencyType,
	type ForecastType,
} from '@/types/climate-variable-interface';

import { type LocationS2DData } from '@/lib/s2d';
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

type MaybePrefixWhenProps = ForecastTypeAndProgressBars & WithChildren;

type MaybePrefixWhenAllAreLessThan = {
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
	MaybePrefixWhenAllAreLessThan
>([
	[
		// CLIM-1367 requirements: For Expected Conditions, (...) is shown if all probabilities are less than 40%:
		ForecastTypes.EXPECTED,
		{
			threshold: 40,
			preamble: __(
				'As all probabilities are lower than 40%, there is no clear forecast outcome.'
			),
		},
	],
	[
		// CLIM-1367 requirements: For Unusual Conditions, (...) is shown if both probabilities are less than 30%
		ForecastTypes.UNUSUAL,
		{
			threshold: 30,
			preamble: __(
				'As both probabilities are lower than 30%, there is no clear forecast outcome.'
			),
		},
	],
]);

const MaybePrefixWhen = ({
	forecastType,
	progressBars,
	children,
}: MaybePrefixWhenProps): React.ReactNode => {
	const currentCondition = OUTCOME_PROBABILITIES_PREAMBLE.get(forecastType);
	if (!currentCondition) {
		return null;
	}

	const childNodes =
		children && Array.isArray(children) ? children : [children]; // I miss Vue.

	// CLIM-1367 requirements: (...) [shown when] ALL probabilities are less than (...)
	const allPercent = progressBars.map(({ percent }) => percent);
	const allAreSmallerThan = allPercent.map(
		(percent) => Math.floor(percent) < currentCondition.threshold
	);
	let historicalMedianPreamble = '';
	if (allAreSmallerThan.includes(false)) {
		// In other words; not "all percents smaller than threshold"
		historicalMedianPreamble = '';
	} else {
		if (forecastType === ForecastTypes.EXPECTED) {
			historicalMedianPreamble = currentCondition.preamble;
		} else if (forecastType === ForecastTypes.UNUSUAL) {
			historicalMedianPreamble = currentCondition.preamble;
		}
		historicalMedianPreamble += ' ';
	}

	return (
		<p className="mt-2">
			{historicalMedianPreamble}
			{...childNodes}
		</p>
	);
};

MaybePrefixWhen.displayName = 'MaybePrefixWhen';

const LineTitleForecastSummary = (): React.ReactNode => {
	let outcome: React.ReactNode = null;
	const currentLocationTitle = useCurrentLocationTitle();
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
		fallback: sprintf(__('The %s %s has a'), variableName.toLowerCase(), formattedPeriodRange),
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
			<MaybePrefixWhen
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
			</MaybePrefixWhen>
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

const CN_BUTTON_EFFECTS = [
	`bg-brand-blue`,
	`focus:outline-none`,
	`focus:ring-brand-blue/90`,
	`focus:ring`,
	`focus:bg-brand-blue`,
	`hover:bg-brand-blue/75`,
	`rounded-full`,
	`transition-colors`,
] as const;

const CN_ROUNDED_BIG_BUTTON_TEXT = [
	`font-bold`,
	`hover:text-white`,
	`text-md`,
	`text-white`,
	`tracking-[0.8px]`,
	`uppercase`,
] as const;

export type ForecastSummaryPopoverProps = ForecastSummaryContentsProps & {
	className?: string;
	popoverContentSide?: PopoverContentSide;
};

export const ForecastSummaryPopover = (
	props: ForecastSummaryPopoverProps,
): React.ReactNode => {
	const {
		forecastType,
		progressBars,
		locationData,
		className,
		popoverContentSide = 'top',
	} = props;

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							'mr-1',
							CN_BUTTON_EFFECTS,
							CN_ROUNDED_BIG_BUTTON_TEXT,
						)}
					>
						{__('Forecast Summary')}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className={cn('w-auto', className)}
					side={popoverContentSide ?? undefined}
					sideOffset={1}
				>
					<ForecastSummaryContents
						forecastType={forecastType}
						progressBars={progressBars}
						locationData={locationData}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
};

ForecastSummaryPopover.displayName = 'ForecastSummaryPopover';
