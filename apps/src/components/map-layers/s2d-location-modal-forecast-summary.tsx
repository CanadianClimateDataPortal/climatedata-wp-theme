import React from 'react';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';

import { useClimateVariable } from '@/hooks/use-climate-variable';

import {
	buildForecastCategories,
} from '@/components/map-layers/s2d-build-forecast-categories';

import {
	type ProgressBarProps,
} from '@/components/ui/progress-bar';

import {
	type ForecastType,
} from '@/types/climate-variable-interface';

type ForecastTypeAndProgressBars = {
	forecastType: ForecastType;
	progressBars: ProgressBarProps[];
};

type ForecastSummaryContentsProps = ForecastTypeAndProgressBars & {
};

export const ForecastSummaryContents = ({
	forecastType,
	progressBars,
}: ForecastSummaryContentsProps): React.ReactNode => {
	const { climateVariable } = useClimateVariable();

	const variableId = climateVariable?.getId();
	const variableName = climateVariable?.getTitle() ?? '';

	// A single sprintf template can't produce correct French for both variables:
	// "Les précipitations totales ont" (plural) vs "La température moyenne a" (singular).
	const tooltipOpeningLineVariants = {
		s2d_precip_accum: __('The total precipitation has a') /* from climate-variables.config.ts */,
		s2d_air_temp: __('The mean temperature has a')        /* from climate-variables.config.ts */,
		fallback: sprintf(__('The %s has a'), variableName.toLowerCase()),
	};

	const tooltipOpeningLine = Reflect.has(
		tooltipOpeningLineVariants,
		variableId ?? 'fallback'
	)
		? Reflect.get(tooltipOpeningLineVariants, variableId ?? 'fallback')
		: Reflect.get(tooltipOpeningLineVariants, 'fallback');

	// Category definitions parallel to progressBars, for tooltip content
	const forecastCategories = buildForecastCategories(forecastType);

	return (
		<div className="p-1">
			<p className="mt-2">{tooltipOpeningLine}</p>
			<ul className="mt-2 list-disc list-outside">
				{progressBars.map((bar, idx) => (
					<li key={idx} className="mt-2 ml-4">
						{sprintf(
							__('%d%% probability of being %s (%s)'),
							Math.round(bar.percent),
							forecastCategories[idx].term.toLowerCase(),
							bar.labelTooltipCutoff,
						)}
					</li>
				))}
			</ul>
			<p className="mt-2">
				{__('relative to the 1991 to 2020 historical climatology.')}
			</p>
			<p className="mt-2">
				{__('The probabilities may not add exactly to 100% due to rounding.')}
			</p>
		</div>
	);
};

ForecastSummaryContents.displayName = 'ForecastSummaryContents';
