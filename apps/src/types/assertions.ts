import {
	ForecastDisplays,
	ForecastTypes,
	FrequencyTypes,
	S2DFrequencyTypes,
	type ForecastDisplay,
	type ForecastType,
	type FrequencyType,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';
import { AbstractError } from '@/lib/errors';

/**
 * Return a function that asserts that a value is one of the valid types.
 *
 * @param validTypes - Record where values are the valid types.
 * @param name - Name of the type to use in the error message.
 * @returns Assertion function that throws if value is not valid, otherwise narrows the type.
 */
function buildCorrectTypeAsserter<T>(
	validTypes: Record<string, T>,
	name: string
): (v: T | string) => asserts v is T {
	return (value: string | T) => {
		const validValues = Object.values(validTypes);

		if (!validValues.includes(value as T)) {
			throw new AssertionError(
				`Assertion error: '${value}' is not a valid ${name}`
			);
		}
	};
}

/**
 * Error class representing a failed assertion.
 *
 * @example
 * ```typescript
 * throw new AssertionError('Invalid type', { cause: originalError });
 * ```
 */
export class AssertionError extends AbstractError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'AssertionError';
	}
}

export const assertIsFrequencyType: (
	value: string
) => asserts value is FrequencyType = buildCorrectTypeAsserter<FrequencyType>(
	FrequencyTypes,
	'FrequencyType'
);

/**
 * @throws {AssertionError} if value is not a valid {@link S2DFrequencyType}
 */
export const assertIsS2DFrequencyType: (
	value: string
) => asserts value is S2DFrequencyType = buildCorrectTypeAsserter<S2DFrequencyType>(
	S2DFrequencyTypes,
	'S2DFrequencyType'
);

/**
 * Assert that a value is a valid ForecastType.
 *
 * @param value - The value to assert.
 * @throws {AssertionError} if value is not a valid {@link ForecastType}
 */
export const assertIsForecastType: (
	value: string
) => asserts value is ForecastType = buildCorrectTypeAsserter<ForecastType>(
	ForecastTypes,
	'ForecastType'
);

/**
 * Assert that a value is a valid ForecastDisplay.
 *
 * @param value - The value to assert.
 * @throws {AssertionError} if value is not a valid {@link ForecastDisplay}
 */
export const assertIsForecastDisplay: (
	value: string
) => asserts value is ForecastDisplay =
	buildCorrectTypeAsserter<ForecastDisplay>(
		ForecastDisplays,
		'ForecastDisplay'
	);

/**
 * Narrow an unknown frequency to one an S2D variable accepts.
 */
export const isFrequencyTypeS2D = (
	frequencyType?: FrequencyType | S2DFrequencyType | string | null,
): frequencyType is S2DFrequencyType => {
	let outcome = false;
	try {
		assertIsS2DFrequencyType(frequencyType ?? '');
		outcome = true;
	} catch {
		outcome = false;
	}

	return outcome;
};

/**
 * Tell whether a frequency is one of the decadal ones.
 *
 * The test is the `decadal-` prefix shared by every decadal slug, so a fourth
 * one can be added to `S2DFrequencyTypes` without editing any caller of this.
 */
export const isFrequencyTypeS2DDecadal = (
	frequencyType?: S2DFrequencyType | string | null,
): frequencyType is S2DFrequencyType => {
	if (isFrequencyTypeS2D(frequencyType)) {
		return /^decadal-/.test(frequencyType);
	}

	return false;
};
