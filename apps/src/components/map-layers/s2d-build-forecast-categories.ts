import { __ } from '@/context/locale-provider';

import type { DefinitionItem } from '@/components/ui/definition-list';

import {
	ForecastTypes,
	type ForecastType,
} from '@/types/climate-variable-interface';

/**
 * Builds forecast category definitions for the given forecast type.
 *
 * Used by both the map legend tooltip and the probability bars tooltip
 * to share consistent category names and percentile descriptions.
 */
export const buildForecastCategories = (
	forecastType: ForecastType,
): DefinitionItem[] => {
	if (forecastType === ForecastTypes.EXPECTED) {
		return [
			{
				term: __('Above normal'),
				details: __('Above the 66th percentile (upper third of historical data)'),
			},
			{
				term: __('Near normal'),
				details: __('Between the 33rd and 66th percentiles (middle third of historical data)'),
			},
			{
				term: __('Below normal'),
				details: __('Below the 33rd percentile (lower third of historical data)'),
			},
		];
	}

	return [
		{
			term: __('Unusually high'),
			details: __('Above the 80th percentile (top fifth of historical data)'),
		},
		{
			term: __('Unusually low'),
			details: __('Below the 20th percentile (bottom fifth of historical data)'),
		},
	];
};
