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
 * `onChangeErrorMessages`); they no longer expose imperative reset handles.
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
		hasVariable ? 2 : 1
	);
	const dataset = useAppSelector((state) => state.download.dataset);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(setCurrentStep(currentStep));
	}, [currentStep, dispatch]);

	/**
	 * Update steps when the climate variable class or id change.
	 * - skip step 3 (variable options) if it's a station variable
	 * - skip step 5 (additional details) if it's a station variable (but not station variable)
	 * - skip step 6 (send request) when there's no file format to choose (for "Future Building Design Value Summaries" and "Short-duration Rainfall IDF Data")
	 */
	useEffect(() => {
		setSteps(() => {
			// If no climate variable is selected yet (like when first loading), use all steps
			if (!climateVariable) {
				return [...STEPS];
			}

			if (
				climateVariable?.getClass() === 'StationClimateVariable' ||
				climateVariable?.getClass() === 'StationDataClimateVariable'
			) {
				// skip step 3 (variable options) if it's a station variable
				const skipIndexes = [2];
				// skip step 5 (additional details) if it's a station variable (but not station variable)
				if (climateVariable?.getId() !== 'station_data')
					skipIndexes.push(4);
				// skip step 6 (send request) when there's no file format to chose (for "Future Building Design Value Summaries" and "Short-duration Rainfall IDF Data")
				if (
					climateVariable?.getId() ===
						'future_building_design_value_summaries' ||
					climateVariable?.getId() ===
						'short_duration_rainfall_idf_data'
				)
					skipIndexes.push(5);

				return STEPS.filter(
					(_, index) => !skipIndexes.includes(index)
				) as unknown as typeof STEPS;
			}
			return [...STEPS];
		});
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
			// components are currently mounted. Gated EXACTLY like the
			// payload derivation (step > targetStep AND the step is applicable
			// for this variable) so a skipped step contributes nothing — the
			// same behaviour as the former per-step imperative handles, which
			// a skipped step never registered.
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

			// Derive the combined reset payload from the climate variable itself,
			// independent of which step components are currently mounted.
			const resetPayload = buildResetPayloadForStepsAfter(
				climateVariable,
				targetStep
			);

			if (Object.keys(resetPayload).length > 0) {
				dispatch(updateClimateVariable(resetPayload));
			}
		},
		[climateVariable, dispatch, resetFileFormat, resetShapefile]
	);

	/**
	 * Navigates to the next step in the form.
	 */
	const goToNextStep = useCallback(
		() => setCurrentStepLocal((prev) => prev + 1),
		[]
	);

	/**
	 * Navigates to a specific step in the form.
	 * If navigating backwards, triggers data reset for all subsequent steps.
	 *
	 * @param step - The target step number (1-based)
	 */
	const goToStep = useCallback(
		(step: number) => {
			if (step < currentStep) {
				setCurrentStepLocal(step);
				resetStepsAfter(step);
			} else {
				setCurrentStepLocal(step);
			}
		},
		[currentStep, resetStepsAfter]
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
