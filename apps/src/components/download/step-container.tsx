import React from 'react';
import { __ } from '@/context/locale-provider';

import { useDownload } from '@/hooks/use-download';

/**
 * A Wrapper for each step's content.
 */
const StepContainer = ({
	title,
	isLastStep = false,
	children,
}: {
	title: string;
	isLastStep?: boolean;
	children: React.ReactNode;
}) => {
	const { currentStep } = useDownload();

	const stepText = isLastStep
		? __('Final Step')
		: __('Step') + ' ' + currentStep;

	return (
		<div className="step-container">
			<div className="flex items-center gap-2 mb-2">
				<div className="text-[40px] text-brand-blue font-bold font-serif leading-[43px] whitespace-nowrap">
					{stepText}:
				</div>
				<div className="text-2xl text-zinc-900 leading-6">{title}</div>
			</div>
			{children}
		</div>
	);
};
StepContainer.displayName = 'StepContainer';

const StepContainerDescription = ({
	children,
}: {
	children: React.ReactNode;
}) => <div className="text-sm text-cdc-black mb-6">{children}</div>;
StepContainerDescription.displayName = 'StepContainerDescription';

export { StepContainer, StepContainerDescription };
