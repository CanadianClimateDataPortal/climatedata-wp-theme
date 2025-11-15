import { __ } from '@/context/locale-provider';
import {
	ForecastTypes,
	ForecastDisplays,
	FrequencyType,
} from '@/types/climate-variable-interface';

export const tooltipForecastTypes = __(
	'S2D forecasts are shown as probabilities for how conditions will compare to historical climate conditions between 1991 and 2020. ' +
		'“Expected conditions” show whether conditions are expected to be above, near or below normal. ' +
		'“Unusual conditions” show whether conditions are expected to be unusually high or low. ' +
		'Select a forecast type from the options in the dropdown menu.'
);

export const tooltipForecastDisplay = __(
	'S2D forecasts provide information on how future conditions may compare to historical conditions between 1991 and 2020. ' +
		'Use the dropdown menu to view the forecast or the historical climatology for 1991 to 2020.'
);

export const tooltipForecastDisplayLowSkill = __(
	'Forecasts at locations with no or low skill should be used with caution, or the climatology should be consulted instead. ' +
		'Click the box to apply cross-hatching over locations with no skill or low skill.'
);

export const tooltipFrequencies = __(
	'Forecasts are available for different frequencies, from a month to 5 years. ' +
		'The available time periods will change based on the frequency selected. ' +
		'Select a temporal frequency from the options in the dropdown menu. ' +
		'Note: Only the first three months are available individually, as skill tends to be low for later months.'
);

export const tooltipTimePeriods = __(
	'The available time periods will change if a different frequency is selected. ' +
		'Move the slider to select the forecast for your time period of interest.'
);

export const SelectAnOptionLabel = __('Select an option');

export const fieldForecastTypes = {
	key: 'forecast_types',
	label: __('Forecast Types'),
	options: [
		{ value: ForecastTypes.EXPECTED, label: __('Expected Conditions') },
		{ value: ForecastTypes.UNUSUAL, label: __('Unusual Conditions') },
	],
};

export const fieldForecastDisplay = {
	key: 'forecast_display',
	label: __('Forecast Display'),
	options: [
		{ value: ForecastDisplays.FORECAST, label: __('Forecast') },
		{ value: ForecastDisplays.CLIMATOLOGY, label: __('Climatology') },
	],
};

export const fieldFrequencies = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{ value: FrequencyType.MONTHLY, label: __('Monthly') },
		{ value: FrequencyType.SEASONAL, label: __('Seasonal (3 months)') },
	],
};
