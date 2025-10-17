import { describe, expect, test } from 'vitest';
import {
	findPeriodIndexForDateRange,
	getPeriods,
	PeriodRange,
} from '@/lib/s2d';
import {
	FrequencyType,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';
import { utc } from '@/lib/utils';
import { S2D_NB_PERIODS } from '@/lib/constants';

/**
 * Return the difference in month number from dateA to dateB.
 *
 * Doesn't return the number of complete months (counting days), only returns
 * the difference in the month number, taking the year difference (if any) into
 * consideration.
 */
function monthNumberDiff(dateA: Date, dateB: Date): number {
	return (
		(dateB.getUTCFullYear() - dateA.getUTCFullYear()) * 12 +
		(dateB.getUTCMonth() - dateA.getUTCMonth())
	);
}

/**
 * Return the number of days in the current month of a given date.
 */
function nbDaysInMonth(date: Date): number {
	// By increasing the month but setting the date to 0, we get the last day of the month
	const lastDayDate = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
	);
	return lastDayDate.getUTCDate();
}

describe('getPeriods', () => {
	describe.each([
		[FrequencyType.SEASONAL, 3],
		[FrequencyType.MONTHLY, 1],
	] as [S2DFrequencyType, number][])(
		'with "%s" frequency',
		(frequency, periodLength) => {
			const releaseDate = utc('2025-08-05') as Date;
			const periods = getPeriods(releaseDate, frequency);
			const nbPeriods = S2D_NB_PERIODS[frequency];

			test(`generates correct number of periods (${nbPeriods})`, () => {
				expect(periods).toHaveLength(nbPeriods);
			});

			test(`all periods have correct lengths (${periodLength} month(s))`, () => {
				periods.forEach(([start, end]) => {
					const diff = monthNumberDiff(start, end);
					expect(diff).toEqual(periodLength - 1);
				});
			});

			test('all periods start on the first day of the month', () => {
				periods.forEach(([start]) => {
					expect(start.getUTCDate()).toBe(1);
				});
			});

			test('all periods end on the last day of the month', () => {
				periods.forEach(([, end]) => {
					expect(end.getUTCDate()).toBe(nbDaysInMonth(end));
				});
			});

			test('the periods shift by 1 month each', () => {
				for (let i = 1; i < periods.length; i++) {
					const currentStart = periods[i][0];
					const previousStart = periods[i - 1][0];
					const diff = monthNumberDiff(previousStart, currentStart);
					expect(diff).toBe(1);
				}
			});

			test('the first period starts in the release month', () => {
				expect(periods[0][0].getUTCMonth()).toBe(
					releaseDate.getUTCMonth()
				);
				expect(periods[0][0].getUTCFullYear()).toBe(
					releaseDate.getUTCFullYear()
				);
			});

			test('sets all times to 00:00:00', () => {
				periods.forEach((period) => {
					for (let i = 0; i < period.length; i++) {
						const date = period[i];
						const expectedDate = new Date(
							Date.UTC(
								date.getUTCFullYear(),
								date.getUTCMonth(),
								date.getUTCDate(),
								0,
								0,
								0
							)
						);
						expect(date.getTime()).toEqual(expectedDate.getTime());
					}
				});
			});
		}
	);

	test('"seasons" correctly handles leap year and varying month lengths', () => {
		const releaseDate = utc('2023-08-05') as Date;
		const expectedPeriods = [
			[utc('2023-08-01'), utc('2023-10-31')],
			[utc('2023-09-01'), utc('2023-11-30')],
			[utc('2023-10-01'), utc('2023-12-31')],
			[utc('2023-11-01'), utc('2024-01-31')],
			[utc('2023-12-01'), utc('2024-02-29')], // 29 days in February
			[utc('2024-01-01'), utc('2024-03-31')],
			[utc('2024-02-01'), utc('2024-04-30')],
			[utc('2024-03-01'), utc('2024-05-31')],
			[utc('2024-04-01'), utc('2024-06-30')],
			[utc('2024-05-01'), utc('2024-07-31')],
		];
		const actualPeriods = getPeriods(releaseDate, FrequencyType.SEASONAL);

		actualPeriods.forEach((actualPeriod, index) => {
			const expectedPeriod = expectedPeriods[index] as PeriodRange;
			expect(actualPeriod[0]).toBeSameDate(expectedPeriod[0]);
			expect(actualPeriod[1]).toBeSameDate(expectedPeriod[1]);
		});
	});

	test('"months" correctly handles leap year and varying month lengths', () => {
		const releaseDate = utc('2024-01-05') as Date;
		const expectedPeriods = [
			[utc('2024-01-01'), utc('2024-01-31')],
			[utc('2024-02-01'), utc('2024-02-29')], // 29 days in February
			[utc('2024-03-01'), utc('2024-03-31')],
		];
		const actualPeriods = getPeriods(releaseDate, FrequencyType.MONTHLY);

		actualPeriods.forEach((actualPeriod, index) => {
			const expectedPeriod = expectedPeriods[index] as [Date, Date];
			expect(actualPeriod[0]).toBeSameDate(expectedPeriod[0]);
			expect(actualPeriod[1]).toBeSameDate(expectedPeriod[1]);
		});
	});

	test('returns an empty array for an unsupported frequency', () => {
		const releaseDate = utc('2025-10-5 10:12:34') as Date;
		// @ts-expect-error - Testing an unsupported frequency
		const actualPeriods = getPeriods(releaseDate, FrequencyType.ANNUAL);
		expect(actualPeriods).toHaveLength(0);
	});
});

describe('findPeriodIndexForDateRange', () => {
	test('returns the correct index if there is a match', () => {
		const dateRange: [string, string] = ['2025-12-01', '2025-12-31'];
		const periods = [
			[utc('2025-11-01'), utc('2025-11-30')],
			[utc('2025-12-01'), utc('2025-12-31')],
			[utc('2026-01-01'), utc('2026-01-31')],
		] as PeriodRange[];
		const actualIndex = findPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBe(1);
	});

	test('returns null if there is no match', () => {
		const dateRange: [string, string] = ['2025-10-01', '2025-10-31'];
		const periods: PeriodRange[] = [
			[new Date(Date.UTC(2025, 10, 1)), new Date(Date.UTC(2025, 10, 30))],
			[new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2025, 11, 31))],
		];
		const actualIndex = findPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBeNull();
	});

	test('returns null for incorrect date range', () => {
		const dateRange: [string, string] = ['invalid', '2025-10-31'];
		const periods: PeriodRange[] = [];
		const actualIndex = findPeriodIndexForDateRange(dateRange, periods);
		expect(actualIndex).toBeNull();
	});
});
