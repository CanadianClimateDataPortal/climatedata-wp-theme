/**
 * DownloadContext and Provider
 *
 * Provides a context for managing the download map app.
 *
 * Allows for navigating through a form and keeps state of
 * the different data variables to setup the download.
 *
 * It also acts as a bridge between the redux store and the components, making
 * it easier to manage the state of the app and keeping both components and store clean.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setValue, initialState } from "@/features/download/download-slice";
import { DownloadState } from "@/types/types";
import { isValidEmail } from "@/lib/utils";

// Define the DownloadContext
const DownloadContext = createContext<{
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
	isStepValid: () => boolean;
	setField: <K extends keyof DownloadState>(key: K, value: DownloadState[K]) => void;
	fields: DownloadState;
} | null>(null);

// Provider component
export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [currentStep, setCurrentStep] = useState<number>(1);

	// using download provider as a bridge between components and redux
	const dispatch = useAppDispatch();
	const state = useAppSelector((state) => state.download);

	// keep track of which fields are required for each step
	const stepValues: Record<number, (keyof DownloadState)[]> = {
		1: ['dataset'],
		2: ['variable'],
		3: ['version', 'degrees'],
		4: ['selectedCells'],
		5: ['startYear', 'endYear', 'frequency', 'emissionScenarios', 'percentiles', 'decimalPlace'],
		6: ['format', 'email'], // TODO: do we want the step to also require the `subcribe` box to be checked?
	};

	// clear fields when moving back to a previous step
	useEffect(() => {
		Object.keys(stepValues)
		.map(Number) // convert keys to numbers
		.filter((step) => step > currentStep) // get the steps AFTER the current step
		.forEach((step) => {
			stepValues[step].forEach((key) => {
				setField(key, initialState[key]); // reset to initial default value
			});
		});
	}, [currentStep]);

	const isStepValid = useCallback((): boolean => {
		const requiredValues = stepValues[currentStep] || [];

		return requiredValues.every((key) => {
			const value = state[key];

			// array type values should have at least one item
			if (Array.isArray(value)) {
				return value.length > 0;
			}

			// we need some custom validation for some values

			// email should be valid
			if (key === 'email') {
				return isValidEmail(String(value));
			}

			// a zero is valid for number types, except in step 4 where selectedCells are required
			if (typeof value === 'number' && key !== 'selectedCells') {
				return true;
			}

			// any other value/key condition should be truthy
			return !!value;
		});
	}, [currentStep, state]);

	const goToNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
	const goToStep = useCallback((step: number) => setCurrentStep(step), []);

	const setField = useCallback(
		<K extends keyof DownloadState>(key: K, value: DownloadState[K]) => {
			dispatch(setValue({ key, value }));
		},
		[dispatch]
	);

	const values = {
		currentStep,
		goToNextStep,
		goToStep,
		isStepValid,
		setField,
		fields: state // expose all state fields to keep things simple
	};

	return (
		<DownloadContext.Provider value={values}>
			{children}
		</DownloadContext.Provider>
	);
};

export const useDownloadContext = () => {
	const context = useContext(DownloadContext);
	if (! context) {
		throw new Error("useDownloadContext must be used within a DownloadProvider");
	}

	return context;
};