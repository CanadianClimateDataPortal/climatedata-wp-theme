import React from 'react';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectLowSkillVisibility,
	setLowSkillVisibility,
} from '@/features/map/map-slice';

import TooltipWidget from '@/components/ui/tooltip-widget';
import Dropdown from '@/components/ui/dropdown';
import { Checkbox } from '@/components/ui/checkbox';

import {
	ForecastDisplay,
	ForecastDisplays,
	ForecastType,
	ForecastTypes,
} from '@/types/climate-variable-interface';

const ForecastTypeField = {
	key: 'forecast_types',
	label: __('Forecast Types'),
	options: [
		{ value: ForecastTypes.EXPECTED, label: __('Expected Conditions') },
		{ value: ForecastTypes.UNUSUAL, label: __('Unusual Conditions') },
	],
};

const ForecastDisplayField = {
	key: 'forecast_display',
	label: __('Forecast Display'),
	options: [
		{ value: ForecastDisplays.FORECAST, label: __('Forecast') },
		{ value: ForecastDisplays.CLIMATOLOGY, label: __('Climatology') },
	],
};

export interface S2DForecastTypeFieldDropdownProps {
	tooltip?: React.ReactNode;
}

export const S2DForecastTypeFieldDropdown = (
	props: S2DForecastTypeFieldDropdownProps
) => {
	const {
		climateVariable,
		setForecastType,
	} = useClimateVariable();

	const value =
		climateVariable?.getForecastType() ?? ForecastTypes.EXPECTED;

	const fieldProps = {
		label: ForecastTypeField.label,
		onChange: setForecastType,
		options: ForecastTypeField.options,
		value,
		...props,
	};

	return (
		<Dropdown<ForecastType>
			key={ForecastTypeField.key}
			placeholder={__('Select an option')}
			{...fieldProps}
		/>
	);
};

S2DForecastTypeFieldDropdown.displayName = 'S2DForecastTypeFieldDropdown';
S2DForecastTypeFieldDropdown.DEFAULT_VALUE = ForecastTypes.EXPECTED;

export interface S2DForecastDisplayFieldDropdownProps {
	tooltip?: React.ReactNode;
}

export const S2DForecastDisplayFieldDropdown = (
	props: S2DForecastDisplayFieldDropdownProps
) => {
	const {
		climateVariable,
		setForecastDisplay,
	} = useClimateVariable();

	const value =
		climateVariable?.getForecastDisplay() ?? ForecastDisplays.FORECAST;

	const fieldProps = {
		label: ForecastDisplayField.label,
		onChange: setForecastDisplay,
		options: ForecastDisplayField.options,
		value,
		...props,
	};

	return (
		<Dropdown<ForecastDisplay>
			key={ForecastDisplayField.key}
			placeholder={__('Select an option')}
			{...fieldProps}
		/>
	);
};

S2DForecastDisplayFieldDropdown.displayName = 'S2DForecastDisplayFieldDropdown';
S2DForecastDisplayFieldDropdown.DEFAULT_VALUE = ForecastDisplays.FORECAST;

export interface S2DForecastDisplaySkillFieldCheckboxProps {
	tooltip?: React.ReactNode;
}

export const S2DForecastDisplaySkillFieldCheckbox = (
	props: S2DForecastDisplaySkillFieldCheckboxProps
) => {
	const dispatch = useAppDispatch();

	const checked = !useAppSelector(selectLowSkillVisibility());
	const onCheckedChange = (checked: boolean) => {
		const isVisible = !checked; // "checked" means "hide low skill"
		dispatch(setLowSkillVisibility({ visible: isVisible }));
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
				id={ForecastDisplayField.key + '_compare'}
				className="text-brand-red"
				{...fieldProps}
			/>
			<label
				htmlFor={ForecastDisplayField.key + '_compare'}
				className="text-sm font-medium leading-none cursor-pointer"
			>
				{__('Mask Low Skill')}
			</label>
			<TooltipWidget tooltip={tooltip} />
		</div>
	);
};

S2DForecastDisplaySkillFieldCheckbox.displayName = 'S2DForecastDisplaySkillFieldCheckbox';
