import { cn } from '@/lib/utils';
import { ControlTitle } from '@/components/ui/control-title';
import { useAppSelector } from '@/app/hooks';
import { __ } from '@/context/locale-provider';
import { setOpacity } from '@/features/map/map-slice';
import { useAppDispatch } from '@/app/hooks';
import { MapItemsOpacity } from '@/types/types';
import { SliderLabelsMap } from '@/types/types';
import * as Slider from '@radix-ui/react-slider';
import { ReactElement } from 'react';

/**
 * LayerOpacities Component
 * ---------------------------
 * A React component that renders a slider control for adjusting the opacity of map layers.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <LayerOpacities />
 */

const LayerOpacities = (): ReactElement => {
	const { opacity } = useAppSelector((state) => state.map);
	const opacityMap = Object.entries(opacity) as [
		keyof SliderLabelsMap,
		number,
	][];
	const dispatch = useAppDispatch();

	const sliderLabelsMap: SliderLabelsMap = {
		mapData: __('Data'),
		labels: __('Labels'),
	};

	const handleChange = (values: number[], key: keyof MapItemsOpacity) => {
		if (values.length && values[0]) {
			dispatch(
				setOpacity({
					value: values[0],
					key,
				})
			);
		}
	};

	return (
		<div className="layer-opacity-slider px-2">
			<ControlTitle title={__('Layer opacities')} />
			<div className="flex flex-col gap-y-3">
				{opacityMap.map(([key, value]) => (
					<div key={key}>
						<span className="text-sm text-dark-purple mb-2">
							{sliderLabelsMap[key]}
						</span>
						<Slider.Root
							className={cn(
								'relative flex items-center select-none',
								'h-[20px] [touch-action:none]'
							)}
							value={[value * 100]}
							onValueChange={(value) => handleChange(value, key)}
							min={0}
							max={100}
							step={1}
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
							></Slider.Thumb>
						</Slider.Root>
					</div>
				))}
			</div>
		</div>
	);
};

LayerOpacities.displayName = 'LayerOpacities';

export default LayerOpacities;
