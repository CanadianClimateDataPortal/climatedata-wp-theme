import { describe, expect, test } from 'vitest';
import {
	ForecastDisplays,
	ForecastTypes,
} from '@/types/climate-variable-interface';
import {
	assertIsForecastDisplay,
	assertIsForecastType,
	AssertionError,
} from '@/types/assertions';

describe('assertIsForecastType', () => {
	test.each(Object.values(ForecastTypes))(
		'does not throw for valid type (%s)',
		(forecastType) => {
			const testCallback = () => {
				assertIsForecastType(forecastType);
			};
			expect(testCallback).not.toThrowError(AssertionError);
		}
	);

	test('throws for invalid type', () => {
		const testCallback = () => {
			assertIsForecastType('invalid');
		};
		expect(testCallback).toThrowError(AssertionError);
	});
});

describe('assertIsForecastDisplay', () => {
	test.each(Object.values(ForecastDisplays))(
		'does not throw for valid type (%s)',
		(forecastDisplay) => {
			const testCallback = () => {
				assertIsForecastDisplay(forecastDisplay);
			};
			expect(testCallback).not.toThrowError(AssertionError);
		}
	);

	test('throws for invalid type', () => {
		const testCallback = () => {
			assertIsForecastDisplay('invalid');
		};
		expect(testCallback).toThrowError(AssertionError);
	});
});
