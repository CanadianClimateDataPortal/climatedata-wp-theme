/**
 * Download Provider and Context
 *
 * This provider manages the multi-step form state and behavior for the download application.
 * It handles:
 * - Step navigation (forward and backward)
 * - Data reset when navigating backwards
 *
 * Data Reset Logic:
 * When navigating backwards (e.g., from step 5 to step 2), `resetStepsAfter`
 * resets every step after the target step, independent of which step
 * components are currently mounted:
 * 1. The combined reset payload is derived from the climate-variable instance
 *    by {@link buildResetPayloadForStepsAfter} and dispatched as one
 *    `updateClimateVariable`.
 * 2. The cross-slice side-effects (variable selection, selection mode,
 *    request state, captcha, shapefile state, file format) are fired here,
 *    each gated on the step being after the target AND applicable for the
 *    current variable ({@link determineStepApplicable}), reproducing the
 *    skip semantics of the step list.
 *
 * Step components receive only `StepComponentProps` (`onChangeValidity`,
 * `onChangeErrorMessages`); they expose no imperative reset handles — reset is
 * derived here from the climate-variable instance.
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
	resolveFullStepOrdinal,
} from '@/lib/download';

interface DownloadContextValue {
	steps: typeof STEPS;
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
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

	/**
	 * Recompute the visible steps whenever the climate variable changes.
	 *
	 * Which steps apply for a given variable is decided in one place —
	 * {@link determineStepApplicable} (keyed by 1-based {@link DOWNLOAD_STEPS}
	 * ordinal) — so this effect just keeps the steps it marks applicable. The
	 * `index + 1` is the only 0-based (array) to 1-based (ordinal) bridge.
	 */
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
	 *
	 * @param targetStep - The step number being navigated to
	 */
	const resetStepsAfter = useCallback(
		(targetStep: number) => {
			// Fire the step reset side-effects independent of which step
			// components are mounted.
			// Gated in the same way as the payload derivation
			// (step > targetStep AND the step is applicable for this variable)
			// so a skipped step contributes nothing.
			const isVariableStepReset =
				DOWNLOAD_STEPS.variable > targetStep &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.variable);
			if (isVariableStepReset) {
				dispatch(setClimateVariable(null));
			}

			const isLocationStepReset =
				DOWNLOAD_STEPS.location > targetStep &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.location);
			if (isLocationStepReset) {
				dispatch(setSelectionMode('cells'));
				resetShapefile();
			}

			const isSendRequestStepReset =
				DOWNLOAD_STEPS.sendRequest > targetStep &&
				determineStepApplicable(climateVariable, DOWNLOAD_STEPS.sendRequest);
			if (isSendRequestStepReset) {
				resetFileFormat();
				dispatch(resetRequestState());
				dispatch(setCaptchaValue(''));
			}

			const resetPayload = buildResetPayloadForStepsAfter(
				climateVariable,
				targetStep
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
	 * Navigate to a specific step; going backwards also resets the steps after it.
	 *
	 * `step` counts positions in the variable-filtered `steps` list (what
	 * `currentStep` and rendering use); `resetStepsAfter` counts full
	 * `DOWNLOAD_STEPS` ordinals. The two differ once a variable skips steps, so
	 * {@link resolveFullStepOrdinal} converts before the reset — otherwise the reset
	 * would wipe the very step being navigated to.
	 *
	 * @param step - Target step, 1-based within the filtered `steps` list.
	 */
	const goToStep = useCallback(
		(step: number) => {
			if (step < currentStep) {
				setCurrentStepLocal(step);
				const fullStepOrdinal = resolveFullStepOrdinal(
					STEPS,
					steps,
					step
				);
				resetStepsAfter(fullStepOrdinal);
			} else {
				setCurrentStepLocal(step);
			}
		},
		[currentStep, resetStepsAfter, steps]
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
