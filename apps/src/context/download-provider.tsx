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
import React, { createContext, useState, useEffect, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	initialState,
	setCenter,
	setDataset,
	setDecimalPlace,
	setDegrees,
	setEmail,
	setEmissionScenarios,
	setEndYear,
	setFormat,
	setFrequency,
	setInteractiveRegion,
	setPercentiles,
	setSelection,
	setSelectionCount,
	setStartYear,
	setSubscribe,
	setVariable,
	setVersion,
	setZoom,
} from '@/features/download/download-slice';
import { DownloadState, PostData, TaxonomyData } from '@/types/types';
import { isValidEmail } from '@/lib/utils';
import { LatLngExpression } from 'leaflet';

const DownloadContext = createContext<{
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
	isStepValid: () => boolean;
	fields: DownloadState;
} | null>(null);

// keep track of which fields are required for each step
// @todo rework since the fields in a step can be dynamic.
//  This must be checked from inside the step.
const stepValues: Record<number, (keyof DownloadState)[]> = {
	1: ['dataset'],
	2: ['variable'],
	3: ['version', 'degrees'],
	4: [],
	5: [],
	6: ['format'], // TODO: do we want the step to also require the `subcribe` box to be checked?
};

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(1);

	// using download provider as a bridge between components and redux
	const dispatch = useAppDispatch();
	const state = useAppSelector((state) => state.download);

	// TODO: once data is fetched from the API, we will likely need to replace this because
	//  not all variables will have the same options
	// helper method used to reset step fields when moving back to a previous step
	const setField = useCallback(
		<K extends keyof DownloadState>(key: K, value: DownloadState[K]) => {
			switch (key) {
				case 'dataset':
					dispatch(setDataset(value as TaxonomyData));
					break;
				case 'variable':
					dispatch(setVariable(value as PostData));
					break;
				case 'version':
					dispatch(setVersion(value as string));
					break;
				case 'degrees':
					dispatch(setDegrees(value as number));
					break;
				case 'interactiveRegion':
					dispatch(setInteractiveRegion(value as string));
					break;
				case 'startYear':
					dispatch(setStartYear(value as number));
					break;
				case 'endYear':
					dispatch(setEndYear(value as number));
					break;
				case 'frequency':
					dispatch(setFrequency(value as string));
					break;
				case 'emissionScenarios':
					dispatch(setEmissionScenarios(value as string[]));
					break;
				case 'selection':
					dispatch(setSelection(value as number[]));
					break;
				case 'selectionCount':
					dispatch(setSelectionCount(value as number));
					break;
				case 'zoom':
					dispatch(setZoom(value as number));
					break;
				case 'center':
					dispatch(setCenter(value as LatLngExpression));
					break;
				case 'percentiles':
					dispatch(setPercentiles(value as string[]));
					break;
				case 'decimalPlace':
					dispatch(setDecimalPlace(value as number));
					break;
				case 'format':
					dispatch(setFormat(value as string));
					break;
				case 'email':
					dispatch(setEmail(value as string));
					break;
				case 'subscribe':
					dispatch(setSubscribe(value as boolean));
					break;
				default:
					break;
			}
		},
		[dispatch]
	);

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
	}, [currentStep, setField]);

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

			// a zero is valid for number types, except in step 4 where selection are required
			if (typeof value === 'number' && key !== 'selection') {
				return true;
			}

			// any other value/key condition should be truthy
			return !!value;
		});
	}, [currentStep, state]);

	const goToNextStep = useCallback(
		() => setCurrentStep((prev) => prev + 1),
		[]
	);
	const goToStep = useCallback((step: number) => setCurrentStep(step), []);

	const values = {
		currentStep,
		goToNextStep,
		goToStep,
		isStepValid,
		fields: state, // expose all state fields to keep things simple
	};

	return (
		<DownloadContext.Provider value={values}>
			{children}
		</DownloadContext.Provider>
	);
};

export { DownloadContext };
