import React, { useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { __ } from '@/context/locale-provider';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

// other
import { cn } from '@/lib/utils';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { setTimePeriodEnd } from '@/features/map/map-slice';

const TimePeriodsControl: React.FC = () => {
	const dispatch = useAppDispatch();
	const { climateVariable, setDateRange } = useClimateVariable();
	const timePeriodEnd = useAppSelector(state => state.map.timePeriodEnd);

	const { min, max, interval } = climateVariable?.getDateRangeConfig() ?? {
		min: 1950,
		max: 2100,
		interval: 30,
	};

	// Get date range from climate variable state
	const dateRange = climateVariable?.getDateRange();
	const [startYear, endYear] = dateRange ?? ["2040", "2070"];
	// Use climate variable state for the slider
	const sliderValue = dateRange && dateRange.length > 1
		? [Number(dateRange[1])]
		: timePeriodEnd && timePeriodEnd.length > 0
			? timePeriodEnd
			: [Number(endYear)];

	// Keep map state in sync with climate variable on initial load
	useEffect(() => {
		if (dateRange && dateRange.length > 1 && timePeriodEnd && timePeriodEnd[0] !== Number(dateRange[1])) {
			dispatch(setTimePeriodEnd([Number(dateRange[1])]));
		}
	}, [dateRange, timePeriodEnd, dispatch]);

	const minYear = Number(min);
	const maxYear = Number(max);
	const intervalYears = interval;

	const handleChange = (values: number[]) => {
		let newEnd = values[0];

		if (newEnd < minYear + intervalYears) {
			newEnd = minYear + intervalYears;
		}
		if (newEnd > maxYear) {
			newEnd = maxYear;
		}

		// Update climate variable state
		setDateRange([
			(newEnd - intervalYears).toString(),
			newEnd.toString(),
		]);

		// Also update map state for backward compatibility
		dispatch(setTimePeriodEnd([newEnd]));
	};

	return (
		<SidebarMenuItem>
			<div className="time-periods-control">
				<ControlTitle
					title={__('Time Periods')}
					tooltip={__('Move the slider to select your time period of interest.')}
				/>
				<Slider.Root
					className={cn(
						'relative flex items-center select-none mx-9',
						'mt-16 [touch-action:none]'
					)}
					value={sliderValue}
					onValueChange={handleChange}
					min={minYear + intervalYears}
					max={maxYear}
					step={10}
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
						aria-label="Year Range"
					>
						<div
							className={cn(
								'absolute bottom-[32px] left-1/2 -translate-x-1/2 transform',
								'bg-[hsl(var(--destructive-red))] text-white text-sm font-bold whitespace-nowrap',
								'px-2 py-1.5',
								'flex items-center pointer-events-none'
							)}
						>
							{/* For display purposes we add 1, e.g. 2041 - 2070. */}
							{Number(startYear) + 1} - {endYear}
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
				<div className="flex justify-between mt-2.5 mx-6 text-sm">
					{/* For display purposes we add 1, e.g. 1951 - 2100. */}
					<span>{minYear + 1}</span>
					<span>{maxYear}</span>
				</div>
			</div>
		</SidebarMenuItem>
	);
};
TimePeriodsControl.displayName = 'TimePeriodsControl';

export { TimePeriodsControl };
