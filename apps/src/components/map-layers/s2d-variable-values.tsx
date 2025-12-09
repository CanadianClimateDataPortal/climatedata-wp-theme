import { useEffect, useRef, useState } from 'react';
import { sprintf } from '@wordpress/i18n';
import L from 'leaflet';

import { __ } from '@/context/locale-provider';
import { useLocale } from '@/hooks/use-locale';
import { useS2D } from '@/hooks/use-s2d';
import { useColorMap } from '@/hooks/use-color-map';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { FetchError, fetchS2DLocationData } from '@/services/services';

import { formatValue } from '@/lib/format';
import { cn, findCeilingIndex, utc } from '@/lib/utils';
import { getPeriodEnd, LocationS2DData } from '@/lib/s2d';
import { ColourMap } from '@/types/types';
import {
	ForecastDisplay,
	ForecastDisplays,
	ForecastType,
	ForecastTypes,
	FrequencyType,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';

import TooltipWidget from '@/components/ui/tooltip-widget';
import StarRating from '@/components/ui/star-rating';
import ProgressBar, { ProgressBarProps } from '@/components/ui/progress-bar';
import S2DReleaseDate from '@/components/s2d-release-date';
import { Spinner } from '@/components/ui/spinner';

interface S2DVariableValuesProps {
	latlng: Pick<L.LatLng, 'lat' | 'lng'>;
}

interface PopupContentProps {
	locationData: LocationS2DData | null;
	dateRangeStart: string | null;
	frequency: S2DFrequencyType;
	forecastType: ForecastType;
	forecastDisplay: ForecastDisplay;
	variableName: string;
	unit: string;
}

interface ProbabilitiesPartProps {
	locationData: LocationS2DData | null;
	forecastType: ForecastType;
	frequency: S2DFrequencyType;
	variableName: string;
	unit: string;
}

interface SkillLevelPartProps {
	locationData: LocationS2DData | null;
}

interface ForecastValuesPartProps {
	locationData: LocationS2DData | null;
	unit: string;
}

interface ClimatologyValuesPartProps {
	locationData: LocationS2DData | null;
	forecastType: ForecastType;
	unit: string;
}

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

const tooltipClimatology = __(
	'The historical climatology contains data corresponding to the month, ' +
		'season, or decadal time period of interest for the 30 years between ' +
		'1991 and 2020. The historical median and near-normal range provide ' +
		'context for typical past conditions at this location. The cutoff ' +
		'values provide the exact values that define the forecast outcomes ' +
		'for this location.'
);

const SKILL_LEVEL_LABELS = [
	__('No skill'),
	__('Low'),
	__('Medium'),
	__('High'),
];

const FREQUENCY_LABEL = {
	[FrequencyType.MONTHLY]: __('Monthly'),
	[FrequencyType.SEASONAL]: __('Seasonal'),
} as const;

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

/**
 * Generate a period range label for a given date range and frequency.
 *
 * @param dateRangeStart - Start date of the period. Example: 2025-08-01
 * @param frequency - Frequency type
 * @param locale - Locale to use for formatting
 */
const generatePeriodRangeLabel = (
	dateRangeStart: string,
	frequency: S2DFrequencyType,
	locale: string
): string | null => {
	const periodStart = utc(dateRangeStart);

	if (!periodStart) {
		return null;
	}

	const periodStartLabel = Intl.DateTimeFormat(locale, {
		month: 'long',
		timeZone: 'UTC',
	}).format(periodStart);

	if (frequency === FrequencyType.MONTHLY) {
		return periodStartLabel;
	}

	const periodEnd = getPeriodEnd(periodStart, frequency);
	const periodEndLabel = Intl.DateTimeFormat(locale, {
		month: 'long',
		timeZone: 'UTC',
	}).format(periodEnd);

	return sprintf(__('%s to %s'), periodStartLabel, periodEndLabel);
};

/**
 * Return true if two numbers are in the same thousand.
 */
const isSameThousand = (valueA: number, valueB: number): boolean =>
	Math.floor(valueA / 1000) === Math.floor(valueB / 1000);

/**
 * Return true if the given RGB colour code is white.
 *
 * @param colour - The colour code, prefixed with `#`.
 */
const isWhite = (colour: `#${string}`): boolean =>
	colour.toUpperCase() === '#FFFFFF' || colour.toUpperCase() === '#FFF';

/**
 * Given a colour map, returns the colour for a specific percentage and outcome.
 *
 * @param outcome - Index number of the outcome (e.g. 0 for "above", 1 for "below", ...)
 * @param percentage - Percentage for which to get the colour
 * @param colorMap - The colour map containing the colours
 */
export const getProbabilityColour = (
	outcome: number,
	percentage: number,
	colorMap: ColourMap
): `#${string}` => {
	const colours = colorMap.colours as `#${string}`[];
	const defaultColor = '#909090';

	// The "quantity" associated with this percentage and outcome. For example,
	// an outcome of 0 (e.g. "above") and a percentage of 23 would be 1023.
	// eslint-disable-next-line prefer-const
	let queryQuantity = 1000 * (outcome + 1) + Math.round(percentage);

	/**
	 * For `colourIndex` out of `findCeilingIndex`, we might need to increase the
	 * by one.
	 */
	const CLIM_1234_ADJUSTMENT_FACTOR = 0.001;
	if(Math.round(percentage) < 100) {
		queryQuantity += CLIM_1234_ADJUSTMENT_FACTOR;
	}

	const colourIndex = findCeilingIndex(colorMap.quantities, queryQuantity);

	// If the percentage/outcome is bigger than the highest value
	if (colourIndex === -1) {
		return defaultColor;
	}

	// If the next colour is not in the same outcome
	if (!isSameThousand(colorMap.quantities[colourIndex], queryQuantity)) {
		return defaultColor;
	}

	let colour = colours[colourIndex];

	// If the colour is white, we find the next none-white colour
	if (isWhite(colour)) {
		// First, set the colour to a default "grey", in case we don't find
		// another replacement colour.
		colour = defaultColor;

		for (let i = colourIndex + 1; i < colours.length; i++) {
			// Stop if we are now in the next outcome's colours
			if (!isSameThousand(colorMap.quantities[i], queryQuantity)) {
				break;
			}

			const nextColour = colours[i];
			if (!isWhite(nextColour)) {
				colour = nextColour;
				break;
			}
		}
	}

	return colour;
};

/**
 * Main component for the location popup of a S2D variable. Wrapper containing
 * the logic, around the actual component.
 */
export const S2DVariableValues = ({ latlng }: S2DVariableValuesProps) => {
	const { releaseDate } = useS2D();
	const { climateVariable } = useClimateVariable();

	// If we have everything we need to start loading the location's data
	const readyToLoad = !!(releaseDate && climateVariable);
	const [locationData, setLocationData] =
		useState<LocationS2DData | null>(null);
	const lastLoadingRef = useRef<string | null>(null);

	const hasDataLoaded = !!(locationData && releaseDate);

	const variableId = climateVariable?.getId() ?? '';
	const variableName = climateVariable?.getTitle() ?? '';
	const unit = climateVariable?.getUnit() ?? '';
	const frequency = (climateVariable?.getFrequency() ??
		FrequencyType.MONTHLY) as S2DFrequencyType;
	const forecastType =
		climateVariable?.getForecastType() ?? ForecastTypes.UNUSUAL;
	const forecastDisplay =
		climateVariable?.getForecastDisplay() ?? ForecastDisplays.FORECAST;
	const dateRange = climateVariable?.getDateRange();
	const dateRangeStart = dateRange ? dateRange[0] : null;

	useEffect(() => {
		const loadingKey = `${latlng.lat}-${latlng.lng}-${variableId}-${frequency}-${dateRangeStart}`;
		const period = dateRangeStart ? utc(dateRangeStart) : null;

		if (!readyToLoad || !period || lastLoadingRef.current === loadingKey) {
			return;
		}

		const abortController = new AbortController();

		const loadLocationData = async () => {
			try {
				const loadedLocationData = await fetchS2DLocationData(
					latlng,
					variableId,
					frequency,
					period,
					{ signal: abortController.signal }
				);

				lastLoadingRef.current = null;

				if (!loadedLocationData || abortController.signal.aborted) {
					return;
				}

				setLocationData(loadedLocationData);
			} catch (error) {
				if (error instanceof FetchError) {
					// In case of a fetch error, we show it in the console, but
					// we don't propagate it to avoid blocking the rest of the
					// app.
					console.error(error);
				} else {
					const originalError = error as Error;
					throw new Error(originalError.message, { cause: error });
				}
			}
		};

		lastLoadingRef.current = loadingKey;
		setLocationData(null);
		loadLocationData();

		return () => {
			lastLoadingRef.current = null;
			abortController.abort();
		};
	}, [
		latlng,
		readyToLoad,
		variableId,
		frequency,
		dateRangeStart,
		forecastType,
		forecastDisplay,
		setLocationData,
	]);

	// Until both the location data and the release date are loaded, we pass
	// `null` as location data to the component.
	const effectiveLocationData = hasDataLoaded ? locationData : null;

	return (
		<PopupContent
			locationData={effectiveLocationData}
			dateRangeStart={dateRangeStart}
			frequency={frequency}
			forecastType={forecastType}
			forecastDisplay={forecastDisplay}
			variableName={variableName}
			unit={unit}
		/>
	);
};

S2DVariableValues.displayName = 'S2DVariableValues';

export default S2DVariableValues;

/**
 * Component to display a loading spinner, where a text is expected.
 */
const TextLoader = () => {
	// The &nbsp; is there to make sure that the same vertical space is used
	// as the text that will be shown.
	return (
		<div className="flex flex-row items-center">
			<Spinner />
			<span>&nbsp;</span>
		</div>
	);
};

/**
 * Component for the skill level section.
 *
 * @param locationData - The loaded location data. Can be null while loading.
 */
const SkillLevelPart = ({ locationData }: SkillLevelPartProps) => {
	const { locale } = useLocale();

	const skillLevel = locationData?.skill_level;
	const hasSkillLevel = skillLevel != null;
	const skillCRPSS = locationData?.skill_CRPSS;

	const tooltipSkillLevel = hasSkillLevel ? (
		<>
			<p className="mb-2">{SKILL_LEVEL_TOOLTIP[skillLevel]}</p>
			<p>{tooltipSkillLevelSuffix}</p>
		</>
	) : null;

	const SkillLevelLine =
		skillCRPSS && hasSkillLevel ? (
			<>
				{SKILL_LEVEL_LABELS[skillLevel]}
				{' - '}
				<abbr
					lang="en"
					title="Continuous Ranked Probability Skill Score"
				>
					CRPSS
				</abbr>
				{': '}
				{formatValue(skillCRPSS, '', 2, locale)}
			</>
		) : (
			__('Loading...')
		);

	return (
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
					{tooltipSkillLevel && (
						<TooltipWidget tooltip={tooltipSkillLevel} />
					)}
				</div>
				<div className="text-xs text-neutral-grey-medium">
					({SkillLevelLine})
				</div>
			</dt>
			<dd
				className={cn(
					'mb-2 mt-1 text-xs uppercase text-neutral-grey-medium',
					!hasSkillLevel ? 'opacity-25' : ''
				)}
			>
				<StarRating value={skillLevel ?? 0} maxStars={3} />
			</dd>
		</div>
	);
};

/**
 * Component for the section showing the "Forecast" values.
 *
 * @param locationData - The loaded location data. Can be null while loading.
 * @param unit - The climate variable's unit
 */
const ForecastValuesPart = ({
	locationData,
	unit,
}: ForecastValuesPartProps) => {
	const { locale } = useLocale();
	const nearNormalRange: number[] | null = locationData
		? [
				locationData.cutoff_below_normal_p33,
				locationData.cutoff_above_normal_p66,
			]
		: null;
	const medianValue = locationData
		? locationData.historical_median_p50
		: null;

	const HistoricalMedianLine = medianValue ? (
		<data value={medianValue}>
			{formatValue(medianValue, unit, 0, locale)}
		</data>
	) : (
		<TextLoader />
	);

	const NearNormalRangeLine = nearNormalRange ? (
		<data value={nearNormalRange.join(',')}>
			{sprintf(
				__('%s to %s'),
				// We don't show the unit for the range start
				formatValue(nearNormalRange[0], '', 0, locale),
				formatValue(nearNormalRange[1], unit, 0, locale)
			)}
		</data>
	) : (
		<TextLoader />
	);

	return (
		<>
			{/* Skill Level */}
			<SkillLevelPart locationData={locationData} />

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
						1991-2020
					</div>
				</dt>
				<dd className="mb-1 text-2xl font-semibold text-brand-blue">
					{HistoricalMedianLine}
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
						1991-2020
					</div>
				</dt>
				<dd className="mb-1 text-2xl font-semibold text-brand-blue">
					{NearNormalRangeLine}
				</dd>
			</div>
		</>
	);
};

/**
 * Component for the section showing the "Climatology" values.
 *
 * @param locationData - The loaded location data. Can be null while loading.
 * @param forecastType - The type of forecast (expected or unusual)
 * @param unit - The climate variable's unit
 */
const ClimatologyValuesPart = ({
	locationData,
	forecastType,
	unit,
}: ClimatologyValuesPartProps) => {
	const { locale } = useLocale();
	let lowValue = 0;
	let highValue = 0;
	let medianValue = 0;

	if (locationData) {
		lowValue =
			forecastType === ForecastTypes.EXPECTED
				? locationData.cutoff_below_normal_p33
				: locationData.cutoff_unusually_low_p20;

		highValue =
			forecastType === ForecastTypes.EXPECTED
				? locationData.cutoff_above_normal_p66
				: locationData.cutoff_unusually_high_p80;

		medianValue = locationData.historical_median_p50;
	}

	const highLabel =
		forecastType === ForecastTypes.EXPECTED
			? __('Above normal cutoff')
			: __('Unusually high cutoff');

	const lowLabel =
		forecastType === ForecastTypes.EXPECTED
			? __('Below normal cutoff')
			: __('Unusually low cutoff');

	const HighCutoffLine = locationData ? (
		<data value={lowValue}>
			{formatValue(highValue, unit, 0, locale)}
		</data>
	) : (
		<TextLoader />
	);

	const LowCutoffLine = locationData ? (
		<data value={lowValue}>
			{formatValue(lowValue, unit, 0, locale)}
		</data>
	) : (
		<TextLoader />
	);

	const HistoricalMedianLine = locationData ? (
		<data value={medianValue}>
			{formatValue(medianValue, unit, 0, locale)}
		</data>
	) : (
		<TextLoader />
	);

	return (
		<>
			<div role="group" className="col-span-2 flex flex-col gap-3 mt-3">
				<div className=" flex flex-row items-center gap-2">
					<span className="text-base font-semibold">
						{__('Climatology (1991 to 2020)')}
					</span>
					<TooltipWidget tooltip={tooltipClimatology} />
				</div>

				{/* Above normal/unusual high */}
				<div
					className="flex flex-col-reverse"
					role="group"
					aria-labelledby="historical-high-cutoff-label"
				>
					<dt id="historical-high-cutoff-label">
						<div className="flex flex-row gap-2">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{highLabel}
							</span>
						</div>
					</dt>
					<dd className="text-2xl font-semibold text-brand-blue">
						{HighCutoffLine}
					</dd>
				</div>

				{/* Historical median */}
				<div
					className="flex flex-col-reverse"
					role="group"
					aria-labelledby="historical-median-label"
				>
					<dt id="historical-median-label">
						<div className="flex flex-row gap-2">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{__('Historical Median')}
							</span>
						</div>
					</dt>
					<dd className="text-2xl font-semibold text-brand-blue">
						{HistoricalMedianLine}
					</dd>
				</div>

				{/* Below normal/unusual low */}
				<div
					className="flex flex-col-reverse"
					role="group"
					aria-labelledby="historical-low-cutoff-label"
				>
					<dt id="historical-low-cutoff-label">
						<div className="flex flex-row gap-2">
							<span className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
								{lowLabel}
							</span>
						</div>
					</dt>
					<dd className="text-2xl font-semibold text-brand-blue">
						{LowCutoffLine}
					</dd>
				</div>
			</div>
		</>
	);
};

/**
 * Component for the probabilities section.
 *
 * @param locationData - The loaded location data. Can be null while loading.
 * @param forecastType - The type of forecast (expected or unusual)
 * @param frequency - The frequency of the forecast (e.g. monthly or seasonal)
 * @param variableName - The climate variable's name
 * @param unit - The climate variable's unit
 * @constructor
 */
const ProbabilitiesPart = ({
	locationData,
	forecastType,
	frequency,
	variableName,
	unit,
}: ProbabilitiesPartProps) => {
	const { locale } = useLocale();
	const { colorMap } = useColorMap();
	const nbProgressBars = forecastType === ForecastTypes.EXPECTED ? 3 : 2;
	const isLoaded = !!(locationData && colorMap);
	// Initialize the progress bars to the correct number of "empty progress bars"
	let progressBars: ProgressBarProps[] = Array.from(
		{ length: nbProgressBars },
		() => ({
			label: '',
			percent: 0,
			fillHexCode: '#fff',
		})
	);

	if (isLoaded) {
		if (forecastType === ForecastTypes.EXPECTED) {
			const belowValue = locationData.cutoff_below_normal_p33;
			const aboveValue = locationData.cutoff_above_normal_p66;
			const belowPercentage = locationData.prob_below_normal;
			const nearPercentage = locationData.prob_near_normal;
			const abovePercentage = locationData.prob_above_normal;

			progressBars = [
				{
					label: sprintf(
						__('Above %s'),
						formatValue(aboveValue, unit, 0, locale)
					),
					percent: Math.round(abovePercentage),
					fillHexCode: getProbabilityColour(
						0,
						abovePercentage,
						colorMap
					),
				},
				{
					label: sprintf(
						__('%s to %s'),
						// No unit for the first value of the range
						formatValue(belowValue, '', 0, locale),
						formatValue(aboveValue, unit, 0, locale)
					),
					percent: Math.round(nearPercentage),
					fillHexCode: getProbabilityColour(
						1,
						nearPercentage,
						colorMap
					),
				},
				{
					label: sprintf(
						__('Below %s'),
						formatValue(belowValue, unit, 0, locale)
					),
					percent: Math.round(belowPercentage),
					fillHexCode: getProbabilityColour(
						2,
						belowPercentage,
						colorMap
					),
				},
			];
		} else {
			const lowerValue = locationData.cutoff_unusually_low_p20;
			const higherValue = locationData.cutoff_unusually_high_p80;
			const lowerPercentage = locationData.prob_unusually_low;
			const higherPercentage = locationData.prob_unusually_high;

			progressBars = [
				{
					label: sprintf(
						__('Higher than %s'),
						formatValue(higherValue, unit, 0, locale)
					),
					percent: Math.round(higherPercentage),
					fillHexCode: getProbabilityColour(
						0,
						higherPercentage,
						colorMap
					),
				},
				{
					label: sprintf(
						__('Lower than %s'),
						formatValue(lowerValue, unit, 0, locale)
					),
					percent: Math.round(lowerPercentage),
					fillHexCode: getProbabilityColour(
						1,
						lowerPercentage,
						colorMap
					),
				},
			];
		}
	}

	const TitleLine = sprintf(
		frequency === FrequencyType.MONTHLY
			? __('Monthly %s probability:')
			: __('Seasonal %s probability:'),
		variableName
	);

	return (
		<section aria-labelledby="probability-heading" className="mt-9">
			<h3
				id="probability-heading"
				className="mb-3 text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium"
			>
				{TitleLine}
			</h3>
			<div className="border-x border-cold-grey-2 relative">
				<div className="absolute h-full top-0 border-l border-cold-grey-2 left-1/4"></div>
				<div className="absolute h-full top-0 border-l border-cold-grey-2 left-1/2"></div>
				<div className="absolute h-full top-0 border-l border-cold-grey-2 left-3/4"></div>
				{!isLoaded && (
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<Spinner />
					</div>
				)}
				{/*
				Even if the data is not yet loaded, we show the progress bars (but invisible) to
				make it take its space.
				*/}
				<div className={cn(isLoaded ? '' : 'invisible')}>
					{progressBars.map((props, idx) => (
						<ProgressBar
							key={`${forecastType}_${idx}`}
							{...props}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

/**
 * Actual content component of the popup.
 *
 * @param locationData - The loaded location data. Can be null while loading.
 * @param dateRangeStart - The start date of the forecast period.
 * @param frequency - The frequency of the forecast (e.g. monthly or seasonal)
 * @param forecastType - The type of forecast (expected or unusual)
 * @param forecastDisplay - The display mode (forecast or climatology)
 * @param variableName - The climate variable's name
 * @param unit - The climate variable's unit
 */
const PopupContent = ({
	locationData,
	dateRangeStart,
	frequency,
	forecastType,
	forecastDisplay,
	variableName,
	unit,
}: PopupContentProps) => {
	const { locale } = useLocale();
	const isForecast = forecastDisplay === ForecastDisplays.FORECAST;

	if (!(frequency in FREQUENCY_LABEL)) {
		throw new Error(`Unknown frequency: ${frequency}`);
	}

	const DateRangeLine = dateRangeStart
		? generatePeriodRangeLabel(dateRangeStart, frequency, locale)
		: null;
	const FrequencyNameLine = FREQUENCY_LABEL[frequency];

	return (
		<div className="mt-4">
			<dl className="relative grid grid-cols-2 mb-3 gap-x-4 gap-y-3 items-start">
				{/* Date Range */}
				<div
					className={cn(
						'flex flex-col-reverse mb-1',
						!isForecast ? 'col-span-2' : ''
					)}
				>
					<dt className="text-xs font-semibold tracking-wider uppercase text-neutral-grey-medium">
						{FrequencyNameLine}
					</dt>
					<dd className="mb-1 text-2xl font-semibold text-brand-blue first-letter:capitalize">
						{DateRangeLine}
					</dd>
				</div>
				{isForecast ? (
					<ForecastValuesPart
						locationData={locationData}
						unit={unit}
					/>
				) : (
					<ClimatologyValuesPart
						locationData={locationData}
						forecastType={forecastType}
						unit={unit}
					/>
				)}
			</dl>

			{isForecast && (
				<ProbabilitiesPart
					locationData={locationData}
					forecastType={forecastType}
					frequency={frequency}
					variableName={variableName}
					unit={unit}
				/>
			)}

			<section className="mt-9">
				<S2DReleaseDate />
			</section>
		</div>
	);
};

PopupContent.displayName = 'Content';
