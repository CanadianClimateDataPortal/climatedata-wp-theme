import React, { useEffect } from 'react';
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
import type { StepComponent } from '@/types/download-form-interface';
import { getForecastTypeName } from '@/lib/s2d';
import { ThresholdSelect } from '@/components/download/ui/threshold-select';

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
	const version = climateVariable.getVersion();
	const hasVersions = climateVariable.getVersions().length > 0;
	const analysisFields = climateVariable.getAnalysisFields() ?? [];
	const values = climateVariable.getAnalysisFieldValues() ?? {};
	const thresholdPossibleValues = climateVariable.getThresholds() ?? [];
	const selectedThresholdValue = climateVariable.getThreshold();

	const hasAnalysisFields = analysisFields.length > 0;
	// We cannot have both analysis fields and a threshold field
	const hasThresholdField = !hasAnalysisFields && thresholdPossibleValues.length > 0;

	const versionIsValid = !hasVersions || !!version;
	const analysisFieldsAreValid = analysisFields
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
		});
	const thresholdIsValid = !hasThresholdField || selectedThresholdValue != null;

	return [
		versionIsValid,
		...analysisFieldsAreValid,
		thresholdIsValid,
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
const StepVariableOptions: StepComponent = ({ onChangeValidity }) => {
	const { climateVariable } = useClimateVariable();
	const { isS2DVariable } = useS2D();

	/**
	 * Step validation
	 */
	useEffect(() => {
		const isValid = () => {
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
		}
		onChangeValidity(isValid())
	}, [climateVariable, isS2DVariable, onChangeValidity]);

	// Determine if there are any analysis fields to display.
	const hasAnalysisFields = !!climateVariable?.getAnalysisFields()?.length;
	// Determine if there are any threshold fields to display. A variable can
	// have analysis fields or threshold fields, but not both.
	const hasThreshold = !hasAnalysisFields && !!climateVariable?.getThresholds()?.length;
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
						{hasAnalysisFields && (
							<div className="mb-8">
								<AnalyzedDownloadFields />
							</div>
						)}
						{hasThreshold && (
							<div className="mb-8">
								<ThresholdSelect />
							</div>
						)}
					</>
				)}
			</div>
		</StepContainer>
	);
};
// Explicit string literal — step-summary.tsx branches on these names, and a
// derived function name would not survive minification.
StepVariableOptions.displayName = 'StepVariableOptions';

/**
 * Extracts and formats summary data for the Variable Options step.
 */
export const StepSummaryVariableOptions = (): React.ReactNode | null => {
	const { climateVariable } = useClimateVariable();
	const { isS2DVariable } = useS2D();
	const items: DefinitionItem[] = [];
	const isReturnPeriod = climateVariable?.getClass() === 'ReturnPeriodClimateVariable';

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
		const selectedThresholdValue = climateVariable.getThreshold?.();
		const thresholdPossibleValues = climateVariable.getThresholds?.() ?? [];

		const hasAnalysisFields = analysisFields.length > 0;
		// We cannot have both analysis fields and a threshold field
		const hasThresholdField = !hasAnalysisFields && thresholdPossibleValues.length > 0;

		if (climateVariable.getVersions().length > 0) {
			items.push({
				term: __('Version'),
				details: version?.toUpperCase() ?? __('N/A'),
			});
		}

		if (hasAnalysisFields) {
			items.push(
				...analysisFields.map(({ key, label }: { key: string; label: string }) => (
					{
						term: __(label),
						details: analysisFieldValues[key]?.toUpperCase() ?? '-',
					}
				))
			);
		}

		if (hasThresholdField && selectedThresholdValue != null) {
			const label = thresholdPossibleValues.find((t) => t.value === selectedThresholdValue)?.label;
			if (label) {
				items.push({
					term: __(isReturnPeriod ? 'Return Period' : 'Threshold'),
					details: __(label),
				});
			}
		}
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
