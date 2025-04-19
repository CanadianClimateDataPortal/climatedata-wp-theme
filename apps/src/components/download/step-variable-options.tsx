import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';

import { useClimateVariable } from "@/hooks/use-climate-variable";
import { AnalyzedDownloadFields } from "@/components/download/ui/analyzed-download-fields";
import {
	VersionDownloadFields
} from "@/components/download/ui/version-download-fields";

/**
 * Variable options step
 */
const StepVariableOptions = React.forwardRef((_, ref) => {
	const { __ } = useI18n();

	const { climateVariable } = useClimateVariable();

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
