import { useMemo } from 'react';
import { __ } from '@/context/locale-provider';
import { PencilLine } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';
import { useDownload } from '@/hooks/use-download';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// All <Step>Summary components
import { StepSummaryVariableOptions } from '@/components/download/step-variable-options';
import { StepSummaryLocation } from '@/components/download/step-location';
import { StepSummaryAdditionalDetails } from '@/components/download/step-additional-details';
import { StepSummarySendRequest } from '@/components/download/step-send-request';

// Type-only imports for JSDoc @see references - these enable IDE navigation to step components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepDataset } from '@/components/download/step-dataset';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepVariable } from '@/components/download/step-variable';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepVariableOptions } from '@/components/download/step-variable-options';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepLocation } from '@/components/download/step-location';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepAdditionalDetails } from '@/components/download/step-additional-details';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepSendRequest } from '@/components/download/step-send-request';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { default as StepResult } from '@/components/download/step-result';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { STEPS } from '@/components/download/config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { DownloadProvider } from '@/context/download-provider';

import type { StepSummaryData } from '@/types/download-form-interface';

/**
 * Summary on the side and visible throughout the download steps.
 *
 * This component displays a summary of user selections made in each step of the download form.
 * It filters and displays information based on which steps are currently active in the form flow.
 *
 * **How steps are referenced:**
 * - Steps are defined in {@link STEPS} array (see `@/components/download/config.ts`)
 * - Each step component has a `displayName` property (e.g., "StepDataset", "StepVariable")
 * - This component checks `stepNames.includes("StepDataset")` to determine if a step is active
 * - The active steps can vary based on the selected climate variable type (see {@link DownloadProvider})
 *
 * **Distinction between step components:**
 * - `step-dataset.tsx`, `step-variable.tsx`, etc. are the actual form step components
 * - `step-summary.tsx` (this file) is NOT a step - it's a sidebar that summarizes selections
 * - `steps.tsx` is the wrapper that renders the current active step component
 *
 * @see {@link StepDataset} - Step 1: Dataset selection
 * @see {@link StepVariable} - Step 2: Variable selection
 * @see {@link StepVariableOptions} - Step 3: Variable options (conditional)
 * @see {@link StepLocation} - Step 4: Location/area selection
 * @see {@link StepAdditionalDetails} - Step 5: Additional details (conditional)
 * @see {@link StepSendRequest} - Step 6: File parameters (conditional)
 * @see {@link StepResult} - Step 7: Result display
 */
const StepSummary = () => {
	const { locale } = useLocale();
	const { currentStep, goToStep, dataset, steps } = useDownload();

	const { climateVariable } = useClimateVariable();

	const summaryData = useMemo(() => {
		const stepNames = steps.map((step) => step.displayName)

		const summaryData: StepSummaryData[] = [];

		/**
		 * Dataset summary section
		 * @see {@link StepDataset} - The actual step component for dataset selection
		 */
		if (stepNames.includes("StepDataset")) {
			summaryData.push({
				title: __('Dataset'),
				content: [dataset?.title?.[locale] ?? ''],
			});
		}

		/**
		 * Variable summary section
		 * @see {@link StepVariable} - The actual step component for variable selection
		 */
		if (stepNames.includes("StepVariable")) {
			summaryData.push({
				title: __('Variable'),
				content: [__(climateVariable?.getTitle() ?? '')],
			});
		}

		/**
		 * Variable options summary section
		 * @see {@link StepVariableOptions} - The actual step component for variable options
		 */
		if (stepNames.includes("StepVariableOptions")) {
			summaryData.push({
				title: __('Variable options'),
				content: <StepSummaryVariableOptions />,
			});
		}

		/**
		 * Location summary section
		 * @see {@link StepLocation} - The actual step component for location/area selection
		 */
		if (stepNames.includes("StepLocation")) {
			summaryData.push({
				title: __('Location or area'),
				content: <StepSummaryLocation />,
			});
		}

		/**
		 * Additional details summary section
		 * @see {@link StepAdditionalDetails} - The actual step component for additional details
		 */
		if (stepNames.includes("StepAdditionalDetails")) {
			summaryData.push({
				title: __('Additional details'),
				content: <StepSummaryAdditionalDetails />,
			});
		}

		/**
		 * File parameters summary section
		 * @see {@link StepSendRequest} - The actual step component for file parameters and request sending
		 */
		if (stepNames.includes("StepSendRequest")) {
			summaryData.push({
				title: __('File parameters'),
				content: <StepSummarySendRequest />,
			});
		}

		return summaryData;

	},
	[
		steps,
		dataset?.title,
		locale,
		climateVariable,
	]);

	return (
		<Card
			className={cn(
				'rounded-none my-6 sm:my-0',
				currentStep === 1 ? 'invisible' : ''
			)}
		>
			<CardHeader className="py-4">
				<CardTitle className="text-xl font-semibold">
					{__('Summary')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{summaryData
					.filter((_, index) => index < currentStep - 1) // only show data up to the current step
					.map((item, index) => (
						<div
							key={index}
							className="flex items-start justify-between py-4 border-t border-soft-purple last:pb-0"
						>
							<div className="flex-1">
								<h3 className="text-xs font-semibold text-dark-purple tracking-wider leading-4 uppercase mb-1">
									{item.title}
								</h3>
								<div className="text-brand-blue">
									{item.content}
								</div>
							</div>
							<Button
								variant="ghost"
								className="w-4 h-4 p-0 hover:bg-white"
								onClick={() => goToStep(index + 1)}
							>
								<PencilLine className="text-brand-blue cursor-pointer" />
							</Button>
						</div>
					))}
			</CardContent>
		</Card>
	);
};

export default StepSummary;
