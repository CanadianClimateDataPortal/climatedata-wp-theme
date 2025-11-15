import React from 'react';

import { __ } from '@/context/locale-provider';

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

export interface ForecastTypeFieldDropdownProps {
	tooltip?: React.ReactNode;
	value: ForecastType;
	onChange: (value: ForecastType) => void;
}

export const ForecastTypeFieldDropdown = (
	props: ForecastTypeFieldDropdownProps
) => {
	return (
		<Dropdown<ForecastType>
			key={ForecastTypeField.key}
			placeholder={__('Select an option')}
			options={ForecastTypeField.options}
			label={ForecastTypeField.label}
			{...props}
		/>
	);
};

ForecastTypeFieldDropdown.displayName = 'ForecastTypeFieldDropdown';
ForecastTypeFieldDropdown.DEFAULT_VALUE = ForecastTypes.EXPECTED;

export interface ForecastDisplayFieldDropdownProps {
	tooltip?: React.ReactNode;
	value: ForecastDisplay;
	onChange: (value: ForecastDisplay) => void;
}

export const ForecastDisplayFieldDropdown = (
	props: ForecastDisplayFieldDropdownProps
) => {
	return (
		<Dropdown<ForecastDisplay>
			key={ForecastDisplayField.key}
			placeholder={__('Select an option')}
			options={ForecastDisplayField.options}
			label={ForecastDisplayField.label}
			{...props}
		/>
	);
};

ForecastDisplayFieldDropdown.displayName = 'ForecastDisplayFieldDropdown';
ForecastDisplayFieldDropdown.DEFAULT_VALUE = ForecastDisplays.FORECAST;

export interface ForecastDisplaySkillFieldCheckboxProps {
	tooltip?: React.ReactNode;
	value: boolean;
	onCheckedChange: (value: boolean) => void;
}

export const ForecastDisplaySkillFieldCheckbox = (
	props: ForecastDisplaySkillFieldCheckboxProps
) => {
	return (
		<div className="flex items-center space-x-2">
			<Checkbox
				id={ForecastDisplayField.key + '_compare'}
				className="text-brand-red"
				checked={props.value}
				onCheckedChange={props.onCheckedChange}
			/>
			<label
				htmlFor={ForecastDisplayField.key + '_compare'}
				className="text-sm font-medium leading-none cursor-pointer"
			>
				{__('Mask Low Skill')}
			</label>
			<TooltipWidget tooltip={props.tooltip} />
		</div>
	);
};

ForecastDisplaySkillFieldCheckbox.displayName =
	'ForecastDisplaySkillFieldCheckbox';
