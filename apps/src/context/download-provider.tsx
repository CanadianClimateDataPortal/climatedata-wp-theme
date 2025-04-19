/**
 * DownloadContext and Provider
 *
 * Provides a context for managing the download map app.
 *
 * Allows for navigating through the steps of the form.
 */
import React, { createContext, useState, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { TaxonomyData } from '@/types/types';

const DownloadContext = createContext<{
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
	dataset: TaxonomyData | null;
} | null>(null);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(1);
	const dataset = useAppSelector((state) => state.download.dataset);

	const goToNextStep = useCallback(
		() => setCurrentStep((prev) => prev + 1),
		[]
	);
	const goToStep = useCallback((step: number) => setCurrentStep(step), []);

	const values = {
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
