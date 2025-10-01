import React, { useEffect, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { __ } from '@/context/locale-provider';
import { useAppDispatch } from '@/app/hooks';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

// other
import { cn } from '@/lib/utils';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { setTimePeriodEnd } from '@/features/map/map-slice';

const TimePeriodsControlForSeaLevel: React.FC = () => {
	const dispatch = useAppDispatch();
	const { climateVariable, setDateRange } = useClimateVariable();
	const scenario = climateVariable?.getScenario();
	const [sliderLabel, setSliderLabel] = useState<string>('');
	const [minYearLabel, setMinYearLabel] = useState<string>('');

	const enhancedScenario = 'rcp85plus65-p50';
	const fixedYearForEnhancedScenario = 2100;

	const { min, max, interval } = climateVariable?.getDateRangeConfig() ?? {
		min: 2020,
		max: 2100,
		interval: 10,
	};

	// Get date range from climate variable state
	const dateRange = climateVariable?.getDateRange();
	const year = dateRange?.[0] ?? "2040";

	// Use map state for the slider

	let sliderValue = [Number(year)];
	// Special scenario (2100 is the only option)
	if(scenario === enhancedScenario) {
		sliderValue = [fixedYearForEnhancedScenario];
	}

	const maxYear = Number(max);
	const minYear = Number(min);
	const intervalYears = interval;
	const sliderMinYear = Math.floor(minYear / intervalYears) * intervalYears;

	// Set initial values for fixed special case scenario
	useEffect(() => {
		// Special scenario (2100 is the only option)
		if(scenario === enhancedScenario) {
			dispatch(setTimePeriodEnd([fixedYearForEnhancedScenario]));
			setDateRange([
				fixedYearForEnhancedScenario.toString(),
				fixedYearForEnhancedScenario.toString(),
			]);
		}
	}, [scenario, fixedYearForEnhancedScenario, dispatch, intervalYears, setDateRange]);

	const handleChange = (values: number[]) => {
		// If we have a fixed year for this scenario, don't allow changes
		if(scenario === enhancedScenario) return;

		let newEnd = values[0];

		if (newEnd < minYear) {
			newEnd = minYear;
		}
		if (newEnd > maxYear) {
			newEnd = maxYear;
		}

		// Update both map state and climate variable state
		dispatch(setTimePeriodEnd([newEnd]));

		// Update climate variable state with the new date range
		setDateRange([
			newEnd.toString(),
			newEnd.toString(),
		]);
	};

	// Set min year label
	useEffect(() => {
		if (minYear) {
			setMinYearLabel(min.toString());
		}
	}, [climateVariable, min, minYear]);

	// Set slider label
	useEffect(() => {
		if (year) {
			if (scenario === enhancedScenario) {
				setSliderLabel(fixedYearForEnhancedScenario.toString());
			} else {
				if (year < min) {
					setSliderLabel(min.toString());
				} else {
					setSliderLabel(year);
				}
			}
		}
	}, [climateVariable, year, min, scenario]);

	return (
		<SidebarMenuItem>
			<div className="time-periods-control">
				<ControlTitle
					title={__('Time Periods')}
					tooltip={__('Move the slider to select your time period of interest.')}
				/>
				<Slider.Root
					className={cn(
						'relative flex items-center select-none mx-4',
						'mt-16 [touch-action:none]',
						scenario === enhancedScenario && 'opacity-50 cursor-not-allowed'
					)}
					value={sliderValue}
					onValueChange={handleChange}
					min={sliderMinYear}
					max={maxYear}
					step={10}
					disabled={scenario === enhancedScenario}
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
								'px-3 py-1.5',
								'flex items-center pointer-events-none'
							)}
						>
							{sliderLabel}
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
				<div className="flex justify-between mt-2.5 mx-4 text-sm">
					<span>{minYearLabel}</span>
					<span>{maxYear}</span>
				</div>
			</div>
		</SidebarMenuItem>
	);
};
TimePeriodsControlForSeaLevel.displayName = 'TimePeriodsControlForSeaLevel';

export { TimePeriodsControlForSeaLevel };
