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
	ForecastDisplays,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';

export interface TimePeriodsControlS2DProps {
	tooltip?: React.ReactNode;
}

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
						isLoadingReleaseDate && 'opacity-50'
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
								'bg-[hsl(var(--destructive-red))]'
							)}
						/>
					</Slider.Track>
					<Slider.Thumb
						className={cn(
							'relative block w-[20px] h-[20px]',
							'bg-white rounded-[10px]',
							'[box-shadow:0_2px_10px_hsl(var(--cold-grey-005))]',
							'hover:bg-white focus:outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--cold-grey-005))]'
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
