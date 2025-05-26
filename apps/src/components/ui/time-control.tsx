import { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import {
	SLIDER_YEAR_WINDOW_SIZE,
	SLIDER_STEP,
	SLIDER_MIN_YEAR,
	SLIDER_MAX_YEAR,
	SLIDER_DEFAULT_YEAR_VALUE,
} from '@/lib/constants';
import { __ } from '@/context/locale-provider';

export const TimeControl = () => {
	const defaultEnd = Math.min(
		SLIDER_DEFAULT_YEAR_VALUE + SLIDER_YEAR_WINDOW_SIZE,
		SLIDER_MAX_YEAR
	);
	const [endYear, setEndYear] = useState<number>(defaultEnd);

	const handleChange = (values: number[]) => {
		let newEnd = values[0];

		if (newEnd < SLIDER_MIN_YEAR + SLIDER_YEAR_WINDOW_SIZE) {
			newEnd = SLIDER_MAX_YEAR + SLIDER_YEAR_WINDOW_SIZE;
		}
		if (newEnd > SLIDER_MAX_YEAR) {
			newEnd = SLIDER_MAX_YEAR;
		}

		setEndYear(newEnd);
	};

	const startYear = endYear - SLIDER_YEAR_WINDOW_SIZE;

	return (
		// TODO: this has no actual inputs and we are not triggering any submit here, I think a form is unnecessary.
		<form>
			<div className="time-control-slider p-4">
				<Slider.Root
					className={cn(
						'relative flex items-center select-none',
						'h-[20px] [touch-action:none]'
					)}
					value={[endYear]}
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
						aria-label={__('Year Range')}
					>
						<div
							className={cn(
								'absolute bottom-[32px] left-1/2 -translate-x-1/2 transform',
								'bg-[hsl(var(--destructive-red))] text-white text-sm font-bold whitespace-nowrap',
								'px-3 py-1.5',
								'flex items-center pointer-events-none'
							)}
						>
							{startYear} - {endYear}
							<div
								className={cn(
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
		</form>
	);
};

export default TimeControl;
