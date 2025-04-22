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
	/** Determines if the step's data is valid */
	isValid: () => boolean;
	/** Returns the data that should be reset when navigating backwards */
	getResetPayload?: () => StepResetPayload;
} 