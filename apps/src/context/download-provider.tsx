/**
 * Download Provider and Context
 *
 * This provider manages the multi-step form state and behavior for the download application.
 *
 * It handles:
 * - Step navigation (forward and backward)
 * - Data reset when returning to a past choice
 *
 * Data Reset Logic:
 * When returning to a past choice backwards (e.g., from step 5 to step 2),
 * using the pencil icon, `resetStepsAfter` runs:
 *
 * 1. The combined reset payload is derived from the `climateVariable` instance
 *    with {@link buildResetPayloadForStepsAfter} and dispatched as one
 *    {@link updateClimateVariable}.
 * 2. The cross-slice side-effects that reset the state later steps depend on
 *    are fired here, each gated on the step being after the target AND
 *    applicable for the current variable ({@link determineStepApplicable}),
 *    reproducing the skip semantics of the step list.
 *
 * Step components receive only {@link StepComponentProps} (`onChangeValidity`,
 * `onChangeErrorMessages`); Which is how we "reset" based on the current
 * internal state of the `climateVariable` instance.
 */

import React, {
	createContext,
	useState,
	useCallback,
	useEffect,
} from 'react';
import { useDownloadUrlSync } from '@/hooks/use-download-url-sync';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { TaxonomyData } from '@/types/types';
import { useShapefile } from '@/hooks/use-shapefile';
import {
	setClimateVariable,
	updateClimateVariable,
} from '@/store/climate-variable-slice';
import {
	resetRequestState,
	setCaptchaValue,
	setCurrentStep,
	setSelectionMode,
} from '@/features/download/download-slice';
import { STEPS } from '@/components/download/config';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	buildResetPayloadForStepsAfter,
	determineStepApplicable,
	DOWNLOAD_STEPS,
	resolveStepNumberInFullFlow,
} from '@/lib/download';

interface DownloadContextValue {
	steps: typeof STEPS;
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (targetStepViewNumber: number) => void;
	dataset: TaxonomyData | null;
}

const DownloadContext = createContext<DownloadContextValue | null>(null);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { climateVariable, resetFileFormat } = useClimateVariable();
	const { reset: resetShapefile } = useShapefile();
	// Initialize URL sync
	useDownloadUrlSync();

	const [steps, setSteps] = useState<typeof STEPS>([...STEPS]);
	// Start at step 2 if URL has variable parameter
	const params = new URLSearchParams(window.location.search);
	const hasVariable = params.has('var');
	const [currentStep, setCurrentStepLocal] = useState<number>(
		hasVariable ? DOWNLOAD_STEPS.variable : DOWNLOAD_STEPS.dataset,
	);
	const dataset = useAppSelector((state) => state.download.dataset);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(setCurrentStep(currentStep));
	}, [currentStep, dispatch]);

	useEffect(() => {
		setSteps(
			() =>
				STEPS.filter((_, index) =>
					determineStepApplicable(climateVariable, index + 1)
				) as unknown as typeof STEPS
		);
	}, [climateVariable]);

	/**
	 * Resets data for all steps after the target step.
	 * This ensures that when navigating backwards, any data entered in later steps
	 * is cleared to maintain form consistency.
	 *
	 * Reset works off the climate-variable instance — independent of which step
	 * components are currently mounted — in two halves: the cross-slice
	 * side-effects fired here, and one combined `updateClimateVariable` payload
	 * derived by {@link buildResetPayloadForStepsAfter}.
	 */
	const resetStepsAfter = useCallback(
		(
			/** The step number in the full flow being navigated to */
			targetStepNumberInFullFlow: number,
		) => {
			// Fire the step reset side-effects independent of which step components are mounted.
			const isVariableStepReset =
				DOWNLOAD_STEPS.variable > targetStepNumberInFullFlow &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.variable);
			if (isVariableStepReset) {
				dispatch(setClimateVariable(null));
			}

			const isLocationStepReset =
				DOWNLOAD_STEPS.location > targetStepNumberInFullFlow &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.location);
			if (isLocationStepReset) {
				dispatch(setSelectionMode('cells'));
				resetShapefile();
			}

			const isSendRequestStepReset =
				DOWNLOAD_STEPS.sendRequest > targetStepNumberInFullFlow &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.sendRequest);
			if (isSendRequestStepReset) {
				resetFileFormat();
				dispatch(resetRequestState());
				dispatch(setCaptchaValue(''));
			}

			const resetPayload = buildResetPayloadForStepsAfter(
				climateVariable,
				targetStepNumberInFullFlow
			);

			if (Object.keys(resetPayload).length > 0) {
				dispatch(updateClimateVariable(resetPayload));
			}
		},
		[
			climateVariable,
			dispatch,
			resetFileFormat,
			resetShapefile,
		]
	);

	/**
	 * Navigates to the next step in the form.
	 */
	const goToNextStep = useCallback(
		() => setCurrentStepLocal((prev) => prev + 1),
		[]
	);

	/**
	 * Navigate to a specific step; going "back" also resets the steps after it.
	 *
	 * `targetStepViewNumber` counts step views in the visible step views list
	 * `resetStepsAfter` counts full `DOWNLOAD_STEPS` step numbers.
	 *
	 * The two differ once a variable hides steps, so {@link resolveStepNumberInFullFlow}
	 * converts before the reset — otherwise the reset would wipe the very step being
	 * navigated to.
	 */
	const goToStep = useCallback(
		(
			/** counts step views in the visible step views list */
			targetStepViewNumber: number,
		) => {
			if (targetStepViewNumber < currentStep) {
				setCurrentStepLocal(targetStepViewNumber);
				const stepNumberInFullFlow = resolveStepNumberInFullFlow(
					STEPS,
					steps,
					targetStepViewNumber
				);
				/** counts full `DOWNLOAD_STEPS` step numbers */
				resetStepsAfter(stepNumberInFullFlow);
			} else {
				setCurrentStepLocal(targetStepViewNumber);
			}
		},
		[
			currentStep,
			resetStepsAfter,
			steps,
		]
	);

	const values: DownloadContextValue = {
		steps,
		currentStep,
		goToNextStep,
		goToStep,
		dataset,
	};

	return (
		<DownloadContext.Provider value={values}>
			{children}
		</DownloadContext.Provider>
	);
};

export { DownloadContext };
