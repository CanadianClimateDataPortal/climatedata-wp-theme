import React from 'react';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import Dropdown from '@/components/ui/dropdown';

import {
	ForecastDisplay,
	ForecastDisplays,
} from '@/types/climate-variable-interface';

const ForecastDisplayField = {
	key: 'forecast_display',
	label: __('Forecast Display'),
	options: [
		{ value: ForecastDisplays.FORECAST, label: __('Forecast') },
		{ value: ForecastDisplays.CLIMATOLOGY, label: __('Climatology') },
	],
};

export interface ForecastDisplayDropdownS2DProps {
	tooltip?: React.ReactNode;
}

export const ForecastDisplayDropdownS2D = (
	props: ForecastDisplayDropdownS2DProps
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

ForecastDisplayDropdownS2D.displayName = 'ForecastDisplayDropdownS2D';
ForecastDisplayDropdownS2D.DEFAULT_VALUE = ForecastDisplays.FORECAST;
