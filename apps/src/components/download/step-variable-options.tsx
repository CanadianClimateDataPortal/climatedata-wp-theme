import React from "react";
import { __ } from '@/context/locale-provider';
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
	const { climateVariable } = useClimateVariable();

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
				{__('Set options to adjust your variable to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
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
			</div>
		</StepContainer>
	);
});
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
