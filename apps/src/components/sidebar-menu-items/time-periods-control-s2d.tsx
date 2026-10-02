import React, { useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { __ } from '@/context/locale-provider';

import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

import { cn } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useS2D } from '@/hooks/use-s2d';
import { useLocale } from '@/hooks/use-locale';
import {
	formatPeriodRange,
	findPeriodIndexForDateRange,
	generateSliderLabels,
	getPeriods,
} from '@/lib/s2d';
import { isFrequencyTypeS2DDecadal } from '@/types/assertions';
import {
	type ForecastDisplay,
	ForecastDisplays,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';

export interface TimePeriodsControlS2DProps {
	tooltip?: React.ReactNode;
}


/**
 * Extra CSS class names for the slider of the `TimePeriodsControlS2D` component.
 *
 * Each field targets one part of the Radix slider. An absent field keeps the
 * base styling of that part. The values go last into `cn()`, so they override
 * any conflicting base class.
 */
type S2DTimePeriodsSliderClassNames = {
	rootClassName?: string;
	thumbClassName?: string;
	/**
	 * Classes for the active track: the part of the track from the minimum
	 * value to the thumb, as Material Design names it. Radix `Slider.Range`
	 * receives them.
	 *
	 * A decadal forecast hides the active track. Its red would mark the earlier
	 * half as included, while the pill already marks the selected half.
	 */
	activeTrackClassName?: string;
};

/**
 * Extra CSS class names for the slider of the `TimePeriodsControlS2D` component.
 *
 * Default, for every case except a decadal forecast: no extra classes.
 * - `rootClassName`: none. The Root keeps its base layout.
 * - `thumbClassName`: none. The thumb stays a 20px round handle.
 * - `activeTrackClassName`: none. The red active track runs from the minimum
 *   to the thumb.
 *
 * Decadal forecast: the slider always has two periods, two 5-year spans of
 * one decade.
 * - `rootClassName`: makes the Root an inline-size container. `50cqw` on the
 *   thumb measures the slider only through it. Without it, `cqw` falls back
 *   to the viewport.
 * - `thumbClassName`: the thumb becomes a pill as wide as half of the track,
 *   so each of its two positions covers its own period.
 * - `activeTrackClassName`: hides the active track. The field itself says why.
 *
 * @returns {@link S2DTimePeriodsSliderClassNames} object containing the extra CSS class names.
 */
const getS2DTimePeriodsSliderClassNames = (
	frequencyType: S2DFrequencyType | null,
	forecastDisplay: ForecastDisplay | null,
): S2DTimePeriodsSliderClassNames => {
	const isDecadal = isFrequencyTypeS2DDecadal(frequencyType);
	const isForecast = forecastDisplay === ForecastDisplays.FORECAST;
	const outcome: S2DTimePeriodsSliderClassNames = {
		activeTrackClassName: 'bg-[hsl(var(--destructive-red))]',
	};

	if (isDecadal && isForecast) {
		outcome.rootClassName = '[container-type:inline-size]';
		outcome.thumbClassName = 'w-[50cqw] rounded-full';
		outcome.activeTrackClassName = '';
	}

	return outcome;
};

/**
 * Time period selector for S2D variables.
 *
 * @constructor
 */
const TimePeriodsControlS2D: React.FC<TimePeriodsControlS2DProps> = ({
	tooltip,
}) => {
	const { climateVariable, setDateRange } = useClimateVariable();
	const { releaseDate } = useS2D();
	const { locale } = useLocale();

	const dateRange = climateVariable?.getDateRange();
	const frequencyType = (climateVariable?.getFrequency() ?? null) as null | S2DFrequencyType;
	const forecastDisplay = climateVariable?.getForecastDisplay() ?? null;
	const periods =
		releaseDate && frequencyType
			? getPeriods(releaseDate, frequencyType as S2DFrequencyType)
			: null;
	const isLoadingReleaseDate = releaseDate === null;

	let matchingDatePeriodIndex: number | null = null;
	let selectedPeriod = 0;

	if (dateRange && periods) {
		matchingDatePeriodIndex = findPeriodIndexForDateRange(
			dateRange as [string, string],
			periods
		);
		selectedPeriod = matchingDatePeriodIndex ?? 0;
	}

	const isDecadalClimatology =
		forecastDisplay === ForecastDisplays.CLIMATOLOGY &&
		isFrequencyTypeS2DDecadal(frequencyType ?? '');

	const {
		minimumLabel,
		maximumLabel,
		tickLabels,
	} = generateSliderLabels(
		periods,
		locale,
		forecastDisplay,
		frequencyType,
	);
	const tickLabel = periods ? tickLabels[selectedPeriod] : '...';
	const sliderClassNames = getS2DTimePeriodsSliderClassNames(frequencyType, forecastDisplay);

	let controlTooltip: React.ReactNode = __(
		'Move the slider to select your time period of interest.'
	);
	if (tooltip) {
		controlTooltip = tooltip;
	}

	/**
	 * Ensure the dateRange is synchronized with the selected period.
	 *
	 * A disynchronisation can occur when switching from another frequency or
	 * another variable that has a different date range. Can also occur if an
	 * invalid date range is supplied in the URL.
	 */
	useEffect(() => {
		if (!periods || matchingDatePeriodIndex === selectedPeriod) {
			return;
		}

		const period = periods[selectedPeriod];

		setDateRange(formatPeriodRange(period));
	}, [
		matchingDatePeriodIndex,
		selectedPeriod,
		periods,
		setDateRange,
	]);

	/**
	 * Update the date range to the selected value.
	 *
	 * Called when the slider value changes.
	 *
	 * @param values - Values of the slide. For this component, it has a single value.
	 */
	const handlePeriodChange = (values: number[]) => {
		const periodIndex = values[0];

		if (!periods || !periods[periodIndex]) {
			return;
		}

		const period = periods[periodIndex];

		setDateRange(formatPeriodRange(period));
	};

	if (isDecadalClimatology) {
		/**
		 * Climatology uses the same data for every time period, so a period
		 * such as '2026-2030' would suggest the values belong to those years.
		 *
		 * Hiding the whole control, and not only greying it, keeps the year
		 * values out of sight: title, tooltip, slider and endpoint labels.
		 *
		 * Same reasoning as for `DateRangeLine` in
		 * `components/map-layers/location-modal-s2d.tsx` in
		 * `LocationModalContentPart`.
		 */
		return null;
	}

	return (
		<SidebarMenuItem>
			<div className="time-periods-control">
				<ControlTitle
					title={__('Time Periods')}
					tooltip={controlTooltip}
				/>
				<Slider.Root
					className={cn(
						'relative flex items-center select-none mx-6',
						'mt-16 [touch-action:none]',
						isLoadingReleaseDate && 'opacity-50',
						sliderClassNames.rootClassName,
					)}
					min={0}
					max={periods ? periods.length - 1 : 0}
					value={[selectedPeriod]}
					onValueChange={handlePeriodChange}
					disabled={isLoadingReleaseDate}
				>
					<Slider.Track
						className={cn(
							'relative flex-grow rounded-full',
							'h-[6px] bg-[hsl(var(--cold-grey-005))]'
						)}
					>
						<Slider.Range
							className={cn(
								'absolute rounded-full h-full',
								sliderClassNames.activeTrackClassName,
							)}
						/>
					</Slider.Track>
					<Slider.Thumb
						className={cn(
							'relative block w-[20px] h-[20px]',
							'bg-white rounded-[10px]',
							'[box-shadow:0_2px_10px_hsl(var(--cold-grey-005))]',
							'hover:bg-white focus:outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--cold-grey-005))]',
							sliderClassNames.thumbClassName,
						)}
					>
						<div
							className={cn(
								'absolute bottom-[32px] left-1/2 -translate-x-1/2 transform',
								'bg-[hsl(var(--destructive-red))] text-white text-xs font-bold whitespace-nowrap uppercase',
								'px-2 py-1.5',
								'flex items-center pointer-events-none',
								isLoadingReleaseDate && 'hidden'
							)}
						>
							{tickLabel}
							<div
								className={cn(
									'slider-range-tooltip',
									'absolute top-full left-1/2 -translate-x-1/2 transform',
									'border-[6px] border-solid border-transparent',
									'[border-top-color:hsl(var(--destructive-red))]'
								)}
							/>
						</div>
					</Slider.Thumb>
				</Slider.Root>
				<div
					className={cn(
						'flex justify-between mt-2.5 mx-4 text-sm uppercase',
						isLoadingReleaseDate && 'hidden'
					)}
				>
					<span>{minimumLabel}</span>
					<span>{maximumLabel}</span>
				</div>
			</div>
		</SidebarMenuItem>
	);
};

TimePeriodsControlS2D.displayName = 'TimePeriodsControlS2D';

export { TimePeriodsControlS2D };
