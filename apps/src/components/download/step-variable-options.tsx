import React from "react";
import { __ } from '@/context/locale-provider';
import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { AnalyzedDownloadFields } from "@/components/download/ui/analyzed-download-fields";
import { VersionDownloadFields } from "@/components/download/ui/version-download-fields";
import { S2DForecastTypeFieldDropdown } from '@/components/fields/forecast';
import { DefinitionList, type DefinitionItem } from '@/components/ui/definition-list';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useS2D } from '@/hooks/use-s2d';
import { dateFormatCheck } from '@/lib/utils';

import { ClimateVariableInterface, ForecastTypes } from '@/types/climate-variable-interface';
import type { StepComponentRef, StepResetPayload } from '@/types/download-form-interface';
import { getForecastTypeName } from '@/lib/s2d';

const validateS2DVariable = (
	climateVariable: ClimateVariableInterface,
): unknown[] => {
	// Validate that forecastType is one of the valid ForecastType values
	const forecastType = climateVariable.getForecastType();
	const validForecastTypes = Object.values(ForecastTypes);
	const isValidForecastType = forecastType != null && validForecastTypes.includes(forecastType);
	return [isValidForecastType];
};

const validateRegularVariable = (
	climateVariable: ClimateVariableInterface,
): unknown[] => {
	const version = climateVariable.getVersion() ?? true;
	const fields = climateVariable.getAnalysisFields() ?? [];
	const values = climateVariable.getAnalysisFieldValues() ?? {};

	return [
		version,
		...fields
			.filter(f => f.required !== false)
			.map(f => {
				const value = values?.[f.key];
				// If it's a date field with a format, check both existence and format validity
				if (f.type === 'input' && f.attributes?.type === 'date' && f.format) {
					return (
						value != null &&
						value !== '' &&
						dateFormatCheck(f.format).test(value)
					);
				}
				// Otherwise, just check existence
				return value != null && value !== '';
			})
	];
}

const tooltipForecastType = __(
	'S2D forecasts are shown as probabilities for how conditions will ' +
	'compare to historical climate conditions between 1991 and 2020. ' +
	'“Expected conditions” show whether conditions are expected to be above, ' +
	'near or below normal. “Unusual conditions” show whether conditions are ' +
	'expected to be unusually high or low. Select a forecast type from the ' +
	'options in the dropdown menu.'
);

/**
 * Step 3.
 *
 * Variable options step
 */
const StepVariableOptions = React.forwardRef<StepComponentRef>((_, ref) => {
	const { climateVariable } = useClimateVariable();
	const { isS2DVariable } = useS2D();

	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}
			const validations = [];

			if (isS2DVariable) {
				validations.push(...validateS2DVariable(climateVariable));
			} else {
				validations.push(...validateRegularVariable(climateVariable));
			}

			return validations.every(Boolean);
		},
		getResetPayload: () => {
			if (!climateVariable) return {};

			const payload: StepResetPayload = {};

			if (climateVariable.getVersions()?.length) {
				payload.version = null;
			}

			if (climateVariable.getFrequencyConfig()) {
				payload.frequency = null;
			}

			if (climateVariable.getAveragingOptions()?.length) {
				payload.averagingType = null;
			}

			if (climateVariable.getAnalysisFields()?.length) {
				payload.analysisFieldValues = {};
			}

			if (isS2DVariable) {
				payload.forecastType = null;
			}

			return payload;
		},
	}), [
		climateVariable,
		isS2DVariable,
	]);

	// Determine if there are any analysis fields to display.
	const analysisFields = !!climateVariable?.getAnalysisFields()?.length;
	const version = !!climateVariable?.getVersions()?.length;

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				{__('Set options to adjust your variable to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
				{isS2DVariable ? (
					<div className="mb-8 sm:w-64">
						<S2DForecastTypeFieldDropdown
							tooltip={tooltipForecastType}
						/>
					</div>
				) : (
					<>
						{version && (
							<div className="mb-8">
								<VersionDownloadFields />
							</div>
						)}
						{analysisFields && (
							<div className="mb-8">
							<AnalyzedDownloadFields />
						</div>
						)}
					</>
				)}
			</div>
		</StepContainer>
	);
});
StepVariableOptions.displayName = 'StepVariableOptions';


/**
 * Extracts and formats summary data for the Variable Options step.
 */
export const StepSummaryVariableOptions = (): React.ReactNode | null => {
	const { climateVariable } = useClimateVariable();
	const { isS2DVariable } = useS2D();
	const items: DefinitionItem[] = [];

	if (!climateVariable) {
		return null;
	}

	// S2D Variables have a different summary format
	if (isS2DVariable) {
		const forecastType = climateVariable.getForecastType();

		if (!forecastType) {
			return null;
		}

		items.push(
			{
				term: __('Forecast Types'),
				details: getForecastTypeName(forecastType),
			}
		);

	} else {
		// Regular variables
		const version = climateVariable.getVersion?.();
		const analysisFields = climateVariable.getAnalysisFields?.() ?? [];
		const analysisFieldValues = climateVariable.getAnalysisFieldValues?.() ?? {};

		if (climateVariable.getVersions().length > 0) {
			items.push({
				term: __('Version'),
				details: version?.toUpperCase() ?? __('N/A'),
			});
		}

		items.push(
			...analysisFields.map(({ key, label }: { key: string; label: string }) => (
				{
					term: __(label),
					details: analysisFieldValues[key]?.toUpperCase() ?? '-',
				}
			))
		);
	}

	return (
		<DefinitionList
			items={items}
			className="download-summary-bullet list-disc list-inside text-sm"
			dtClassName="text-dark-purple font-medium"
			ddClassName="text-brand-blue"
			variant="ul"
		/>
	);
}

export default StepVariableOptions;
