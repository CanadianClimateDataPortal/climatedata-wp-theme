import { __ } from '@/context/locale-provider';

import type { DefinitionItem } from '@/components/ui/definition-list';

import {
	ForecastTypes,
	type ForecastType,
} from '@/types/climate-variable-interface';

/**
 * Row labels for the multi-band legend, by forecast type.
 *
 * These strings stay untranslated on purpose. The legend passes each one
 * through __() when it renders the row.
 *
 * Keep them apart from buildForecastProbabilitiesCategories below. That
 * function returns the long forms, such as "Above normal". It also applies
 * __() itself. Merging the two would change the legend wording.
 */
export const LEGEND_ROW_LABELS: Record<ForecastType, string[]> = {
	[ForecastTypes.EXPECTED]: ['Above', 'Near', 'Below'],
	[ForecastTypes.UNUSUAL]: ['Unusually high', 'Unusually low'],
};

/**
 * Builds forecast category definitions for the given forecast type
 *
 * Used by both the map legend tooltip and the probability bars tooltip
 * to share consistent category names and percentile descriptions.
 */
export const buildForecastProbabilitiesCategories = (
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
