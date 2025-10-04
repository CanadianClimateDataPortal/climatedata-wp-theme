import { describe, expect, test } from 'vitest';
import {
	getPeriodIndexForDateRange,
	getPeriods,
	parseReleaseDate,
	PeriodRange,
} from '@/lib/s2d';
import { FrequencyType } from '@/types/climate-variable-interface';

describe('getPeriods', () => {
	test('returns correct periods for monthly frequency', () => {
		const releaseDate = new Date(Date.UTC(2025, 10, 5, 10, 12, 34));
		const expectedPeriods = [
			[new Date(Date.UTC(2025, 10, 1)), new Date(Date.UTC(2025, 10, 30))],
			[new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2025, 11, 31))],
			[new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 31))],
		];
		const actualPeriods = getPeriods(releaseDate, FrequencyType.MONTHLY);

		expect(actualPeriods).toHaveLength(expectedPeriods.length);

		actualPeriods.forEach((actualPeriod, index) => {
			const expectedPeriod = expectedPeriods[index];
			expect(actualPeriod[0]).toBeSameDate(expectedPeriod[0]);
			expect(actualPeriod[1]).toBeSameDate(expectedPeriod[1]);
		});
	});

	test('returns correct periods for seasonal frequency', () => {
		const releaseDate = new Date(Date.UTC(2025, 7, 5, 10, 12, 34));
		const expectedPeriods = [
			[new Date(Date.UTC(2025, 7, 1)), new Date(Date.UTC(2025, 9, 31))],
			[new Date(Date.UTC(2025, 8, 1)), new Date(Date.UTC(2025, 10, 30))],
			[new Date(Date.UTC(2025, 9, 1)), new Date(Date.UTC(2025, 11, 31))],
			[new Date(Date.UTC(2025, 10, 1)), new Date(Date.UTC(2026, 0, 31))],
			[new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2026, 1, 28))],
			[new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 2, 31))],
			[new Date(Date.UTC(2026, 1, 1)), new Date(Date.UTC(2026, 3, 30))],
			[new Date(Date.UTC(2026, 2, 1)), new Date(Date.UTC(2026, 4, 31))],
			[new Date(Date.UTC(2026, 3, 1)), new Date(Date.UTC(2026, 5, 30))],
			[new Date(Date.UTC(2026, 4, 1)), new Date(Date.UTC(2026, 6, 31))],
		];
		const actualPeriods = getPeriods(releaseDate, FrequencyType.SEASONAL);

		expect(actualPeriods).toHaveLength(expectedPeriods.length);

		actualPeriods.forEach((actualPeriod, index) => {
			const expectedPeriod = expectedPeriods[index];
			expect(actualPeriod[0]).toBeSameDate(expectedPeriod[0]);
			expect(actualPeriod[1]).toBeSameDate(expectedPeriod[1]);
		});
	});

	test('returns an empty array for an unsupported frequency', () => {
		const releaseDate = new Date(Date.UTC(2025, 10, 5, 10, 12, 34));
		const actualPeriods = getPeriods(releaseDate, FrequencyType.ANNUAL);
		expect(actualPeriods).toHaveLength(0);
	});
});

describe('getPeriodIndexForDateRange', () => {
	test('returns the correct index if there is a match', () => {
		const dateRange = ['2025-12-01', '2025-12-31'];
		const periods: PeriodRange[] = [
			[new Date(Date.UTC(2025, 10, 1)), new Date(Date.UTC(2025, 10, 30))],
			[new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2025, 11, 31))],
			[new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 1, 31))],
		];
		const actualIndex = getPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBe(1);
	});

	test('returns null if there is no match', () => {
		const dateRange = ['2025-10-01', '2025-10-31'];
		const periods: PeriodRange[] = [
			[new Date(Date.UTC(2025, 10, 1)), new Date(Date.UTC(2025, 10, 30))],
			[new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2025, 11, 31))],
		];
		const actualIndex = getPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBeNull();
	});

	test('returns null for incorrect date range', () => {
		const dateRange = ['invalid', '2025-10-31'];
		const periods: PeriodRange[] = [];
		const actualIndex = getPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBeNull();
	});
});

describe('parseReleaseDate', () => {
	test.each(['invalid', '2020-12'])(
		'returns null for incorrect format (%s)',
		(dateString: string) => {
			const actual = parseReleaseDate(dateString);
			expect(actual).toBeNull();
		}
	);

	test.each([
		['2025-01-01', [2025, 0, 1]],
		['2025-12-31', [2025, 11, 31]],
	])(
		'returns the correct date for correct format (%s)',
		(dateString: string, expectedParts: number[]) => {
			const expected = new Date(
				Date.UTC(expectedParts[0], expectedParts[1], expectedParts[2])
			);
			const actual = parseReleaseDate(dateString) as Date;
			expect(actual).toBeSameDate(expected);
		}
	);
});
