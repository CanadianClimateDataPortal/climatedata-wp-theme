import React from "react";
import { useI18n } from '@wordpress/react-i18n';
import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { AnalyzedDownloadFields } from "@/components/download/ui/analyzed-download-fields";
import { VersionDownloadFields } from "@/components/download/ui/version-download-fields";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { StepComponentRef, StepResetPayload } from '@/types/download-form-interface';
import { dateFormatCheck } from '@/lib/utils';

/**
 * Variable options step
 */
const StepVariableOptions = React.forwardRef<StepComponentRef>((_, ref) => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();

	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}

			const version = climateVariable.getVersion() ?? null;
			const fields = climateVariable.getAnalysisFields() ?? [];
			const values = climateVariable.getAnalysisFieldValues() ?? {};

			const validations = [
				...fields
					.filter(f => f.required !== false)
					.map(f => {
						const value = values?.[f.key];
						// If it's a date field with a format, check both existence and format validity
						if (f.type === 'input' && f.attributes?.type === 'date' && f.unit) {
							return (
								value != null &&
								value !== '' &&
								dateFormatCheck(f.unit).test(value)
							);
						}
						// Otherwise, just check existence
						return value != null && value !== '';
					})
			];

			if (climateVariable.getDatasetType() !== "ahccd") {
				validations.push(!!version)
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

			return payload;
		}
	}), [climateVariable]);

	// Determine if there are any analysis fields to display.
	const analysisFields = !!climateVariable?.getAnalysisFields()?.length;
	const version = !!climateVariable?.getVersions()?.length;

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				{__('Please set your variables options to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
				{version && climateVariable?.getDatasetType() !== "ahccd" && (
					<div className="mb-8">
						<VersionDownloadFields />
					</div>
				)}

				{analysisFields && (
					<div className="mb-8">
					<AnalyzedDownloadFields />
				</div>
				)}
			</div>
		</StepContainer>
	);
});
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
