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

import type { StepComponentRef, StepResetPayload } from '@/types/download-form-interface';
import type { ForecastType } from "@/types/climate-variable-interface";

/**
 * Step 3.
 *
 * Variable options step
 */
const StepVariableOptions = React.forwardRef<StepComponentRef>((_, ref) => {
	const { climateVariable, setForecastType } = useClimateVariable();

	const { isS2DVariable } = useS2D();

	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}

			const version = climateVariable.getVersion() ?? true;
			const fields = climateVariable.getAnalysisFields() ?? [];
			const values = climateVariable.getAnalysisFieldValues() ?? {};

			const validations = [
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

			if (isS2DVariable) {
				/**
				 * In S2DClimateVariable's parent (ClimateVariableBase) getForecastType() method
				 * always return 'expected' if it isn't set.
				 */
				const forecastTypeValue = climateVariable.getForecastType() as ForecastType;
				const hasForecastType = forecastTypeValue != null;
				validations.push(hasForecastType);
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
				// I doubt that this should be done this way since we have setForecastType always returning a default value
				payload.forecastType = S2DForecastTypeFieldDropdown.DEFAULT_VALUE;
			}

			return payload;
		},
		reset: () => {
			setForecastType(S2DForecastTypeFieldDropdown.DEFAULT_VALUE);
		}
	}), [
		climateVariable,
		isS2DVariable,
		setForecastType,
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
					<div className="mb-8">
						<S2DForecastTypeFieldDropdown />
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

	if (!climateVariable) return null;

	// S2D Variables have different summary format
	if (isS2DVariable) {
		const forecastType = climateVariable.getForecastType() ?? '';
		const formattedValue = forecastType.substring(0, 1).toUpperCase() + forecastType.substring(1).toLowerCase();

		const items: DefinitionItem[] = [
			{
				term: __('Forecast Type'),
				details: __(formattedValue),
			}
		];
		return (
			<DefinitionList
				items={items}
				className="download-summary-bullet list-disc list-inside text-sm"
				dtClassName="text-dark-purple"
				ddClassName="text-brand-blue uppercase"
				variant="ul"
			/>
		);
	}

	// Regular variables
	const version = climateVariable.getVersion?.();
	const analysisFields = climateVariable.getAnalysisFields?.() ?? [];
	const analysisFieldValues = climateVariable.getAnalysisFieldValues?.() ?? {};

	return (
		<ul className="download-summary-bullet list-disc list-inside">
			{climateVariable.getVersions().length > 0 && (
				<li key={version}>
					<span className='text-dark-purple text-sm'>Version:</span>{' '}
					<span className="uppercase">{version || 'N/A'}</span>
				</li>
			)}
			{analysisFields.map(({ key, label }: { key: string; label: string }) => {
				const value = analysisFieldValues[key] ?? '-';

				return (
					<li className="summary-item" key={key}>
						<span className='text-gray-600 text-sm'>{__(label)}</span>:{' '}
						<span className="uppercase">{value}</span>
					</li>
				);
			})}
		</ul>
	);
}

export default StepVariableOptions;
