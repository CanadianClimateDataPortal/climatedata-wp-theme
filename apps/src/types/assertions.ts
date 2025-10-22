import {
	ForecastDisplay,
	ForecastDisplays,
	ForecastType,
	ForecastTypes,
} from '@/types/climate-variable-interface';

/**
 * Return a function that asserts that a value is one of the valid types.
 *
 * @param validTypes - Record where values are the valid types.
 * @param name - Name of the type to use in the error message.
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
 */
export class AssertionError extends Error {}

/**
 * Assert that a value is a valid ForecastType.
 *
 * @param value - The value to assert.
 */
export const assertIsForecastType: (
	value: string
) => asserts value is ForecastType = buildCorrectTypeAsserter<ForecastType>(
	ForecastTypes,
	'forecast type'
);

/**
 * Assert that a value is a valid ForecastDisplay.
 *
 * @param value - The value to assert.
 */
export const assertIsForecastDisplay: (
	value: string
) => asserts value is ForecastDisplay =
	buildCorrectTypeAsserter<ForecastDisplay>(
		ForecastDisplays,
		'forecast display'
	);
