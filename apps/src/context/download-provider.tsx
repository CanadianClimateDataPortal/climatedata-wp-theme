/**
 * Download Provider and Context
 *
 * This provider manages the multi-step form state and behavior for the download application.
 * It handles:
 * - Step navigation (forward and backward)
 * - Step validation state
 * - Dynamic step registration
 * - Data reset when navigating backwards
 *
 * Each step component must implement the StepComponentRef interface which includes:
 * - isValid(): boolean - Determines if the step's data is valid
 * - getResetPayload(): StepResetPayload - Returns the data that should be reset when navigating backwards
 *
 * Step Registration:
 * Steps are dynamically registered when they mount using the registerStepRef function.
 * This registration allows the provider to:
 * - Track which steps are currently mounted
 * - Access step-specific validation and reset logic
 * - Manage step-specific data resets when navigating backwards
 *
 * Data Reset Logic:
 * When navigating backwards (e.g., from step 5 to step 2):
 * 1. All steps after the target step are identified
 * 2. Their reset payloads are collected in order (lowest to highest step number)
 * 3. The combined reset payload is dispatched to update the climate variable state
 * This ensures that data from later steps is properly cleared when going back
 *
 * @example
 * // In a step component, implement the required interface
 * const StepComponent = React.forwardRef<StepComponentRef>((_, ref) => {
 *   React.useImperativeHandle(ref, () => ({
 *     isValid: () => boolean,
 *     getResetPayload: () => ({ field: null })
 *   }));
 *   ...
 * });
 */

import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { useDownloadUrlSync } from '@/hooks/use-download-url-sync';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { TaxonomyData } from '@/types/types';
import { StepComponentRef } from '@/types/download-form-interface';
import { updateClimateVariable } from '@/store/climate-variable-slice';
import { STEPS } from '@/components/download/config';
import { useClimateVariable } from '@/hooks/use-climate-variable';

interface DownloadContextValue {
	steps: typeof STEPS;
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
	dataset: TaxonomyData | null;
	registerStepRef: (step: number, ref: StepComponentRef | null) => void;
}

const DownloadContext = createContext<DownloadContextValue | null>(null);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { climateVariable } = useClimateVariable();
	// Initialize URL sync
	useDownloadUrlSync();

	const [steps, setSteps] = useState<typeof STEPS>([...STEPS]);
	// Start at step 2 if URL has variable parameter
	const params = new URLSearchParams(window.location.search);
	const hasVariable = params.has('var');
	const [currentStep, setCurrentStep] = useState<number>(hasVariable ? 2 : 1);
	const dataset = useAppSelector((state) => state.download.dataset);
	const dispatch = useAppDispatch();

	/** Map of step numbers to their component refs */
	const stepRefs = useRef(new Map<number, StepComponentRef>());

	/** 
	 * Update steps when the climate variable class or id change.
	 * - skip step 3 (variable options) if it's a station variable
	 * - skip step 5 (additional details) if it's a station variable (but not station variable)
	 * - skip step 6 (send request) when there's no file format to choose (for "Future Building Design Value Summaries" and "Short-duration Rainfall IDF Data")
	 */
	useEffect(() => {
		setSteps(() => {
			if (climateVariable?.getClass() === 'StationClimateVariable') {
				// skip step 3 (variable options) if it's a station variable
				const skipIndexes = [2];
				// skip step 5 (additional details) if it's a station variable (but not station variable)
				if(climateVariable?.getId() !== 'station_data') skipIndexes.push(4);
				// skip step 6 (send request) when there's no file format to chose (for "Future Building Design Value Summaries" and "Short-duration Rainfall IDF Data")
				if(climateVariable?.getId() === 'future_building_design_value_summaries' || climateVariable?.getId() === 'short_duration_rainfall_idf_data') skipIndexes.push(5);

				return STEPS.filter((_, index) => !skipIndexes.includes(index)) as unknown as typeof STEPS;
			}
			return [...STEPS];
		});
	}, [climateVariable?.getClass(), climateVariable?.getId()]);

	/**
	 * Registers or unregisters a step component's ref.
	 * This allows the provider to access step-specific validation and reset logic.
	 *
	 * @param step - The step number (1-based)
	 * @param ref - The step component's ref, or null to unregister
	 */
	const registerStepRef = useCallback((step: number, ref: StepComponentRef | null) => {
		if (ref) {
			stepRefs.current.set(step, ref);
		} else {
			stepRefs.current.delete(step);
		}
	}, []);

	/**
	 * Resets data for all steps after the target step.
	 * This ensures that when navigating backwards, any data entered in later steps
	 * is cleared to maintain form consistency.
	 *
	 * The reset process:
	 * 1. Identifies all steps after the target step
	 * 2. Sorts them to ensure proper reset order (earlier steps first)
	 * 3. Collects reset payloads from each step
	 * 4. Combines and dispatches the reset data
	 *
	 * @param targetStep - The step number being navigated to
	 */
	const resetStepsAfter = useCallback((targetStep: number) => {
		const stepsToReset = Array.from(stepRefs.current.entries())
			.filter(([step]) => step > targetStep)
			.sort(([stepA], [stepB]) => stepA - stepB);

		const resetPayload = stepsToReset.reduce((payload, [_, ref]) => {
			if (ref.getResetPayload) {
				return {
					...payload,
					...ref.getResetPayload()
				};
			}
			return payload;
		}, {});

		if (Object.keys(resetPayload).length > 0) {
			dispatch(updateClimateVariable(resetPayload));
		}
	}, [dispatch]);

	/**
	 * Navigates to the next step in the form.
	 */
	const goToNextStep = useCallback(
		() => setCurrentStep((prev) => prev + 1),
		[]
	);

	/**
	 * Navigates to a specific step in the form.
	 * If navigating backwards, triggers data reset for all subsequent steps.
	 *
	 * @param step - The target step number (1-based)
	 */
	const goToStep = useCallback((step: number) => {
		if (step < currentStep) {
			resetStepsAfter(step);
		}
		setCurrentStep(step);
	}, [currentStep, resetStepsAfter]);

	const values: DownloadContextValue = {
		steps,
		currentStep,
		goToNextStep,
		goToStep,
		dataset,
		registerStepRef,
	};

	return (
		<DownloadContext.Provider value={values}>
			{children}
		</DownloadContext.Provider>
	);
};

export { DownloadContext };
