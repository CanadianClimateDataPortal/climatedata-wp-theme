import React, { useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { __ } from '@/context/locale-provider';

import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

import { cn } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useS2D } from '@/hooks/use-s2d';
import {
	formatPeriodRange,
	findPeriodIndexForDateRange,
	getPeriods,
	PeriodRange,
} from '@/lib/s2d';
import { getShortMonthName } from '@/lib/format';
import { S2DFrequencyType } from '@/types/climate-variable-interface';

export interface TimePeriodsControlS2DProps {
	tooltip?: React.ReactNode;
}

type SliderLabels = {
	minimumLabel: string;
	maximumLabel: string;
	tickLabels: string[];
};

/**
 * Generate the labels to be used on the slider, based on the provided periods.
 *
 * @param periods - The periods to show on the slider.
 */
function generateSliderLabels(periods: PeriodRange[] | null): SliderLabels {
	if (!periods) {
		return {
			minimumLabel: '',
			maximumLabel: '',
			tickLabels: [],
		};
	}

	const firstAndLastPeriods = [periods[0][0], periods[periods.length - 1][1]];
	const [minimumLabel, maximumLabel] = firstAndLastPeriods.map(
		(period) =>
			`${getShortMonthName(period.getUTCMonth())} ${period.getUTCFullYear()}`
	);

	const tickLabels = periods.map((period) => {
		const labelParts = [];
		labelParts.push(getShortMonthName(period[0].getUTCMonth()));

		if (period[0].getUTCMonth() != period[1].getUTCMonth()) {
			labelParts.push(getShortMonthName(period[1].getUTCMonth()));
		}
		return labelParts.join('-');
	});

	return {
		minimumLabel,
		maximumLabel,
		tickLabels,
	};
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

	const dateRange = climateVariable?.getDateRange();
	const frequency = climateVariable?.getFrequency() ?? null;
	const periods =
		releaseDate && frequency
			? getPeriods(releaseDate, frequency as S2DFrequencyType)
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

	const { minimumLabel, maximumLabel, tickLabels } =
		generateSliderLabels(periods);
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
	}, [matchingDatePeriodIndex, selectedPeriod, periods, setDateRange]);

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
