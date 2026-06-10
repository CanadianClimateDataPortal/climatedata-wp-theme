import React from 'react';
import { StepErrorMessage } from '@/lib/step-error-message';

/**
 * Interface for the payload returned when resetting a step's data
 */
export interface StepResetPayload {
	[key: string]: any;
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

export type StepComponent = React.FC<StepComponentProps>;
