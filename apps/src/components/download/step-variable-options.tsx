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
						if (f.type === 'input' && f.attributes?.type === 'date' && f.attributes?.format) {
							if(value != null && value !== '' && f.attributes?.format === 'MM-DD') {
								// Regex test if month between 01 and 12 and if day between 01 and 31
								const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
								if (!regex.test(value)) return false;

								// Test if the day is consistent with the month
								const [monthStr, dayStr] = value.split("-");
								const month = parseInt(monthStr, 10);
								const day = parseInt(dayStr, 10);
								const thirtyDaysMonths = [4, 6, 9, 11];
								if (month === 2) return day <= 29; // For february
								if (thirtyDaysMonths.includes(month)) return day <= 30;

								return true;
							}

							return value != null && value !== '';
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
				{__('Please set your variables options to your needs.')}
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
