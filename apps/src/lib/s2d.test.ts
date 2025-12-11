import { beforeEach, describe, expect, test } from 'vitest';
import {
	buildSkillLayerName, buildSkillLayerTime,
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
import S2DClimateVariable from '@/lib/s2d-climate-variable';

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

describe('buildSkillLayerName', () => {
	let climateVariable: S2DClimateVariable;
	let releaseDate: Date;

	beforeEach(() => {
		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
		releaseDate = utc('2025-08-05') as Date;
	});

	describe.each([
		[FrequencyType.SEASONAL, 'seasonal'],
		[FrequencyType.MONTHLY, 'monthly'],
	])('with frequency %s', (frequency, frequencyName) => {

		beforeEach(() => {
			climateVariable.getFrequency = () => frequency;
		});

		test('starts with "CDC:s2d-skill-"', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[0]).toEqual('CDC:s2d');
			expect(layerParts[1]).toEqual('skill');
		});

		test.each([
			['s2d_air_temp', 'air_temp'],
			['s2d_precip_accum', 'precip_accum'],
			// As a fail-safe, return the id as is for other variables
			['other_s2d_var', 'other_s2d_var'],
		])('layer value contains variable (%s)', (variableId, expectedName) => {
			climateVariable.getId = () => variableId;
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[2]).toEqual(expectedName);
		});

		test('layer has the correct frequency', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[3]).toEqual(frequencyName);
		});

		test.each([
			['2024-03-01', '03'],
			['2025-01-12', '01'],
			['2020-12-31', '12'],
		])('layer has the correct reference period', (date, expectedRefPeriod) => {
			releaseDate = utc(date) as Date;
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[4]).toEqual(expectedRefPeriod);
		});

		test('has the correct number of parts', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts).toHaveLength(5);
		});
	});

	test('returns null if an unsupported frequency is selected', () => {
		climateVariable.getFrequency = () => FrequencyType.ANNUAL;
		const layer = buildSkillLayerName(climateVariable, releaseDate);
		expect(layer).toBeNull();
	});
});

describe('buildSkillLayerTime', () => {
	let climateVariable: S2DClimateVariable;
	let releaseDate: Date;

	beforeEach(() => {
		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
		releaseDate = utc('2025-04-05') as Date;
	});

	test.each([
		['2025-08-01', '1991-08-01'],
		['2025-12-01', '1991-12-01'],
		['2026-01-01', '1992-01-01'], // Next year, so 1992
		['2028-04-01', '1994-04-01'], // 3 year later, so 1994
	])('year always based on 1991, relative to release date (%s)', (rangeStart, expectedDate) => {
		climateVariable.getDateRange = () => [rangeStart, rangeStart];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual(`${expectedDate}T00:00:00Z`);
	});

	test('date based on the beginning of the selected date range', () => {
		climateVariable.getDateRange = () => ['2025-08-01', '2025-11-31'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual('1991-08-01T00:00:00Z');
	});

	test('date is the first day of the month', () => {
		climateVariable.getDateRange = () => ['2025-05-14', '2025-06-23'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual('1991-05-01T00:00:00Z');
	});

	test('returns null if invalid date range', () => {
		climateVariable.getDateRange = () => ['invalid', '2025-06-23'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toBeNull();
	});

	test('returns null if no date range', () => {
		climateVariable.getDateRange = () => null;
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toBeNull();
	});
});
