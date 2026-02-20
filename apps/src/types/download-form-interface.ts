import React from 'react';
import { StepErrorMessage } from '@/lib/step-error-message';

/**
 * Interface for the payload returned when resetting a step's data
 */
export interface StepResetPayload {
	[key: string]: any;
}

/**
 * Interface for step components that need to validate their state
 * and provide reset functionality when navigating backwards
 */
export interface StepComponentRef {
	/** Returns the data that should be reset when navigating backwards */
	getResetPayload?: () => StepResetPayload;
	/** Execute any other operations to reset the step. */
	reset?: () => void;
}

/**
 * Type for a member of the "inputs" fields in a Finch request.
 */
export type FinchRequestInput = {
	id: string;
	data: string;
}

export interface StepSummaryData {
	title: string;
	content: React.ReactNode | null;
}

export type StepComponentProps = {
	onChangeValidity: (isValid: boolean) => void;
	onChangeErrorMessages: (messages: StepErrorMessage[]) => void;
};

export type StepComponent = React.ForwardRefExoticComponent<
	React.PropsWithoutRef<StepComponentProps> & React.RefAttributes<StepComponentRef>
>;
