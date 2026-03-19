import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectForecastDisplay,
	selectLowSkillVisibility,
	setLowSkillVisibility,
} from '@/features/map/map-slice';
import { Checkbox } from '@/components/ui/checkbox';
import { __ } from '@/context/locale-provider';
import TooltipWidget from '@/components/ui/tooltip-widget';
import React from 'react';

import { ForecastDisplays } from '@/types/climate-variable-interface';

export interface S2DForecastDisplaySkillFieldCheckboxProps {
	tooltip?: React.ReactNode;
}

/**
 * @see {@link selectLowSkillVisibility} — "skill" is an S2D-specific concept
 */
export const MaskLowSkillField = (
	props: S2DForecastDisplaySkillFieldCheckboxProps,
) => {
	const dispatch = useAppDispatch();

	const checked = useAppSelector(selectLowSkillVisibility());
	const forecastDisplay = useAppSelector(selectForecastDisplay());
	const isForecast = forecastDisplay === ForecastDisplays.FORECAST;

	const onCheckedChange = (checked: boolean) => {
		dispatch(setLowSkillVisibility({visible: checked}));
	};

	const {
		tooltip,
		...propsRest
	} = props;
	const fieldProps = {
		checked,
		onCheckedChange,
		disabled: !isForecast,
		...propsRest,
	};

	return (
		<div className="flex items-center space-x-2">
			<Checkbox
				id='mask-low-skill-checkbox'
				className="text-brand-red disabled:data-[state=checked]:bg-neutral-grey-medium disabled:data-[state=checked]:border-neutral-grey-medium"
				{...fieldProps}
			/>
			<label
				htmlFor='mask-low-skill-checkbox'
				className="text-sm font-medium leading-none cursor-pointer peer-disabled:opacity-50 peer-disabled:cursor-default"
			>
				{__('Mask Low Skill')}
			</label>
			<TooltipWidget tooltip={tooltip}/>
		</div>
	);
};

MaskLowSkillField.displayName = 'MaskLowSkillField';
