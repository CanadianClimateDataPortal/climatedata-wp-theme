import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { useI18n } from '@wordpress/react-i18n';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

// other
import { cn } from '@/lib/utils';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { setTimePeriodEnd } from '@/features/map/map-slice';

// Configuration for special cases
const SPECIAL_CASES = {
	sea_level: {
		minYearOffset: -1, // Subtract one interval from min year
		forceEndYear: true, // Always use end year
		displayMinYear: true, // Display actual min year instead of min year +1
		fixedYearForScenario: {
			'rcp85plus65-p50': 2100 // Fixed year for this specific scenario
		} as Record<string, number>
	}
} as const;

const TimePeriodsControl: React.FC = () => {
	const { __ } = useI18n();
	const dispatch = useAppDispatch();
	const { climateVariable, setDateRange } = useClimateVariable();
	const scenario = climateVariable?.getScenario();
	const timePeriodEnd = useAppSelector(state => state.map.timePeriodEnd);
	const [sliderLabel, setSliderLabel] = useState<string>('');
	const [minYearLabel, setMinYearLabel] = useState<string>('');

	// Used for special cases
	const isSpecialCase = (id: string): id is keyof typeof SPECIAL_CASES => {
		return id in SPECIAL_CASES;
	};
	const getSpecialCaseConfig = () => {
		const id = climateVariable?.getId();
		return id && isSpecialCase(id) ? SPECIAL_CASES[id] : null;
	};

	const { min, max, interval } = climateVariable?.getDateRangeConfig() ?? {
		min: 1950,
		max: 2100,
		interval: 30,
	};

	// Get date range from climate variable state
	const dateRange = climateVariable?.getDateRange();
	const [startYear, endYear] = dateRange ?? ["2040", "2070"];

	// Use map state for the slider
	const specialCaseConfig = getSpecialCaseConfig();
	const fixedYearForScenario = scenario && specialCaseConfig?.fixedYearForScenario?.[scenario as string];
	
	const sliderValue = fixedYearForScenario 
		? [fixedYearForScenario]
		: specialCaseConfig?.forceEndYear 
			? [Number(endYear)]
			: timePeriodEnd && timePeriodEnd.length > 0
				? timePeriodEnd
				: [Number(endYear)];

	let minYear = Number(min);
	const maxYear = Number(max);
	const intervalYears = interval;
	
	// Special case offset if needed
	if (specialCaseConfig?.minYearOffset) {
		minYear = Math.floor(minYear / intervalYears) * intervalYears + (intervalYears * specialCaseConfig.minYearOffset);
	}

	// Set initial values for fixed special case scenario
	useEffect(() => {
		if (fixedYearForScenario) {
			dispatch(setTimePeriodEnd([fixedYearForScenario]));
			setDateRange([
				(fixedYearForScenario - intervalYears).toString(),
				fixedYearForScenario.toString(),
			]);
		}
	}, [fixedYearForScenario, dispatch, intervalYears, setDateRange]);

	const handleChange = (values: number[]) => {
		// If we have a fixed year for this scenario, don't allow changes
		if (fixedYearForScenario) return;

		let newEnd = values[0];

		if (newEnd < minYear + intervalYears) {
			newEnd = minYear + intervalYears;
		}
		if (newEnd > maxYear) {
			newEnd = maxYear;
		}

		let newEndStr = newEnd.toString();
		// Handle special case where end year is below min
		if (newEnd < Number(min)) {
			newEndStr = min.toString();
		}

		// Update both map state and climate variable state
		dispatch(setTimePeriodEnd([newEnd]));

		// Update climate variable state with the new date range
		setDateRange([
			(newEnd - intervalYears).toString(),
			newEndStr,
		]);
	};

	// Set min year label
	useEffect(() => {
		if (minYear) {
			if (specialCaseConfig?.displayMinYear) {
				setMinYearLabel(min.toString());
			} else {
				/* For display purposes we add 1, e.g. 1951 - 2100. */
				setMinYearLabel((minYear + 1).toString());
			}
		}
	}, [climateVariable, min, minYear, specialCaseConfig]);

	// Set slider label
	useEffect(() => {
		if (startYear && endYear) {
			if (scenario === 'rcp85plus65-p50') {
				setSliderLabel('2100');
			} else if (specialCaseConfig?.displayMinYear) {
				if (endYear < min) {
					setSliderLabel(min.toString());
				} else {
					setSliderLabel(endYear);
				}
			} else {
				/* For display purposes we add 1, e.g. 1951 - 2100. */
				setSliderLabel(`${(Number(startYear) + 1)} - ${endYear}`);
			}
		}
	}, [climateVariable, startYear, endYear, min, specialCaseConfig, scenario]);

	return (
		<SidebarMenuItem>
			<div className="time-periods-control p-4">
				<ControlTitle
					title={__('Time Periods')}
					tooltip={__('Time periods tooltip')}
				/>
				<Slider.Root
					className={cn(
						'relative flex items-center select-none',
						'mt-14 [touch-action:none]',
						fixedYearForScenario && 'opacity-50 cursor-not-allowed'
					)}
					value={sliderValue}
					onValueChange={handleChange}
					min={minYear + intervalYears}
					max={maxYear}
					step={10}
					disabled={!!fixedYearForScenario}
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
				<div className="flex justify-between mt-2.5 text-sm">
					<span>{minYearLabel}</span>
					<span>{maxYear}</span>
				</div>
			</div>
		</SidebarMenuItem>
	);
};
TimePeriodsControl.displayName = 'TimePeriodsControl';

export { TimePeriodsControl };
