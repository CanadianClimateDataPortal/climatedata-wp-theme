/**
 * DownloadContext and Provider
 *
 * Provides a context for managing the download map app.
 * Allows for navigating through a form and keeps state of
 * the different data variables to setup the download.
 *
 */
import React, { createContext, useContext, useState } from "react";

// Define the DownloadContext
const DownloadContext = createContext<{
	currentStep: number;
	goToNextStep: () => void;
	goToStep: (step: number) => void;
} | null>(null);

// Provider component
export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [currentStep, setCurrentStep] = useState<number>(1);

	const goToNextStep = () => setCurrentStep((prev) => prev + 1);
	const goToStep = (step: number) => setCurrentStep(step);

	const values = {
		currentStep,
		goToNextStep,
		goToStep
	}

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
