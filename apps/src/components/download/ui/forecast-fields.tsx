import { useClimateVariable } from '@/hooks/use-climate-variable';

import {
	ForecastDisplays,
	ForecastTypes,
} from '@/types/climate-variable-interface';

import {
	ForecastDisplayFieldDropdown as BaseForecastDisplayFieldDropdown,
	ForecastTypeFieldDropdown as BaseForecastTypeFieldDropdown,
} from '@/components/fields/forecast';

export const ForecastTypeFieldDropdown = () => {
	const { climateVariable, setForecastType } = useClimateVariable();
	const forecastType =
		climateVariable?.getForecastType() ?? ForecastTypes.EXPECTED;

	return (
		<BaseForecastTypeFieldDropdown
			value={forecastType}
			onChange={setForecastType}
		/>
	);
};

export const ForecastDisplayFieldDropdown = () => {
	const { climateVariable, setForecastDisplay } = useClimateVariable();

	const forecastDisplay =
		climateVariable?.getForecastDisplay() ?? ForecastDisplays.FORECAST;

	return (
		<BaseForecastDisplayFieldDropdown
			value={forecastDisplay}
			onChange={setForecastDisplay}
		/>
	);
};
