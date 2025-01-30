import React from "react";
import { useI18n } from "@wordpress/react-i18n";

import { useDownloadContext } from "@/context/download-provider";

/**
 * A Wrapper for each step's content.
 */
const StepContainer = ({ title, isLastStep = false, children }: {
	title: string;
	isLastStep?: boolean;
	children: React.ReactNode;
}) => {
	const { __ } = useI18n();
	const { currentStep } = useDownloadContext();

	const stepText = isLastStep ? __('Final Step') : __('Step') + ' ' + currentStep;

	return (
		<div className="step-container">
			<div className="flex items-center gap-2 mb-2">
				<div className="text-4xl font-boldbold text-brand-blue whitespace-nowrap">{stepText}:</div>
				<div className="text-2xl text-zinc-900 leading-tight">{title}</div>
			</div>
			{children}
		</div>
	);
};
StepContainer.displayName = "StepContainer";

const StepContainerDescription = ({ children }: { children: React.ReactNode }) => (
	<div className="text-sm text-cdc-black font-medium mb-6">
		{children}
	</div>
);
StepContainerDescription.displayName = "StepContainerDescription";

export { StepContainer, StepContainerDescription };
