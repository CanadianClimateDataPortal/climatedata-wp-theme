import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { useI18n } from '@wordpress/react-i18n';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from '@/components/ui/control-title';

// other
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setTimePeriodEnd } from '@/features/map/map-slice';
import { cn } from '@/lib/utils';
import {
	SLIDER_YEAR_WINDOW_SIZE,
	SLIDER_STEP,
	SLIDER_MIN_YEAR,
	SLIDER_MAX_YEAR,
} from '@/lib/constants.ts';

const TimePeriodsControl: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();

	const { timePeriodEnd } = useAppSelector((state) => state.map);

	const handleChange = (values: number[]) => {
		let newEnd = values[0];

		if (newEnd < SLIDER_MIN_YEAR + SLIDER_YEAR_WINDOW_SIZE) {
			newEnd = SLIDER_MAX_YEAR + SLIDER_YEAR_WINDOW_SIZE;
		}
		if (newEnd > SLIDER_MAX_YEAR) {
			newEnd = SLIDER_MAX_YEAR;
		}

		dispatch(setTimePeriodEnd([newEnd]));
	};

	const startYear = timePeriodEnd[0] - SLIDER_YEAR_WINDOW_SIZE;

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
						'mt-14 [touch-action:none]'
					)}
					value={timePeriodEnd}
					onValueChange={handleChange}
					min={SLIDER_MIN_YEAR + SLIDER_YEAR_WINDOW_SIZE}
					max={SLIDER_MAX_YEAR}
					step={SLIDER_STEP}
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
							{startYear} - {timePeriodEnd}
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
					<span>{SLIDER_MIN_YEAR}</span>
					<span>{SLIDER_MAX_YEAR}</span>
				</div>
			</div>
		</SidebarMenuItem>
	);
};
TimePeriodsControl.displayName = 'TimePeriodsControl';

export { TimePeriodsControl };
