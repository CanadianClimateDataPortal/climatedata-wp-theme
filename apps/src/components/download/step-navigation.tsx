import React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useDownload } from '@/hooks/use-download';

/**
 * Displays the current step and allows navigation between steps.
 * Includes proper rendering of "Step X of Y".
 */
const StepNavigation: React.FC<{ totalSteps: number }> = ({ totalSteps }) => {
	const { currentStep } = useDownload();

	// Array of step numbers [1...totalSteps]
	const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

	return (
		<div
			className={cn(
				'step-navigation flex justify-center sm:justify-start mt-2 mb-6',
				currentStep === 1 ? 'invisible' : ''
			)}
		>
			<div className="flex items-center gap-1 sm:gap-2">
				{steps.map((step, index) => {
					// Styling for steps (completed, current, upcoming)
					const isCompleted = step < currentStep;
					const isCurrent = step === currentStep;

					const currentStateClasses = isCompleted
						? 'bg-soft-purple text-brand-blue'
						: isCurrent
							? 'bg-brand-blue text-white'
							: 'bg-white text-zinc-900';

					return (
						<React.Fragment key={step}>
							<div
								className={cn(
									'flex items-center justify-center rounded-full shadow-sm w-10 h-10 text-xl',
									currentStateClasses
								)}
							>
								{isCompleted ? <Check /> : step}
							</div>

							{/* Line connector */}
							{index < steps.length - 1 && (
								<div
									className={cn(
										'h-[3px] w-4 sm:w-8',
										index < currentStep - 1
											? 'bg-brand-blue'
											: 'bg-soft-purple'
									)}
								/>
							)}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};
StepNavigation.displayName = 'StepNavigation';

export default StepNavigation;
