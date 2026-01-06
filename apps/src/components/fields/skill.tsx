import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectLowSkillVisibility,
	setLowSkillVisibility,
} from '@/features/map/map-slice';
import { Checkbox } from '@/components/ui/checkbox';
import { __ } from '@/context/locale-provider';
import TooltipWidget from '@/components/ui/tooltip-widget';
import React from 'react';

export interface S2DForecastDisplaySkillFieldCheckboxProps {
	tooltip?: React.ReactNode;
}

export const MaskLowSkillField = (
	props: S2DForecastDisplaySkillFieldCheckboxProps,
) => {
	const dispatch = useAppDispatch();

	const checked = useAppSelector(selectLowSkillVisibility());
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
		...propsRest,
	};

	return (
		<div className="flex items-center space-x-2">
			<Checkbox
				id='mask-low-skill-checkbox'
				className="text-brand-red"
				{...fieldProps}
			/>
			<label
				htmlFor='mask-low-skill-checkbox'
				className="text-sm font-medium leading-none cursor-pointer"
			>
				{__('Mask Low Skill')}
			</label>
			<TooltipWidget tooltip={tooltip}/>
		</div>
	);
};

MaskLowSkillField.displayName = 'MaskLowSkillField';
