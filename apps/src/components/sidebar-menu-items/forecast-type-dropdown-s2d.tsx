import React from 'react';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import Dropdown from '@/components/ui/dropdown';

import {
	ForecastType,
	ForecastTypes,
} from '@/types/climate-variable-interface';
import { getForecastTypeName } from '@/lib/s2d';

const ForecastTypeField = {
	key: 'forecast_types',
	label: __('Forecast Types'),
	options: [
		{ value: ForecastTypes.EXPECTED, label: getForecastTypeName(ForecastTypes.EXPECTED) },
		{ value: ForecastTypes.UNUSUAL, label: getForecastTypeName(ForecastTypes.UNUSUAL) },
	],
};

export interface ForecastTypeDropdownS2DProps {
	tooltip?: React.ReactNode;
}

export const ForecastTypeDropdownS2D = (
	props: ForecastTypeDropdownS2DProps
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

ForecastTypeDropdownS2D.displayName = 'ForecastTypeDropdownS2D';
ForecastTypeDropdownS2D.DEFAULT_VALUE = ForecastTypes.EXPECTED;
