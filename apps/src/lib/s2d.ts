import { S2D_NB_PERIODS } from '@/lib/constants';
import { FrequencyType } from '@/types/climate-variable-interface';
import { formatUTCDate, parseUTCDate } from '@/lib/utils';

export type PeriodRange = [Date, Date];

/**
 * For a data release date, get all the period dates for a specific frequency.
 *
 * The number of periods and their length depend on the frequency. The start
 * date of each period depends on the release date.
 *
 * The period start is always the first day of the month, and the period end is
 * always the last day of the month, both in UTC time.
 *
 * @see - S2D_NB_PERIODS in '@/lib/constants'
 * @param releaseDate - The release date of the data.
 * @param frequency - The frequency for which to get the periods.
 * @returns - An array of [start, end] dates for each period.
 */
export function getPeriods(
	releaseDate: Date,
	frequency: string
): PeriodRange[] {
	const nbPeriods = S2D_NB_PERIODS[frequency as keyof typeof S2D_NB_PERIODS];
	const periodLength = frequency === FrequencyType.SEASONAL ? 3 : 1;
	const periodInterval = 1;
	const periods: [Date, Date][] = [];
	const lastPeriod = new Date(
		// Set to the first day of the month
		Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), 1)
	);

	for (let i = 0; i < nbPeriods; i++) {
		const periodStart = new Date(lastPeriod);

		const periodEnd = new Date(lastPeriod);
		periodEnd.setUTCMonth(lastPeriod.getUTCMonth() + periodLength);
		periodEnd.setUTCDate(0);

		periods.push([periodStart, periodEnd]);

		lastPeriod.setUTCMonth(lastPeriod.getUTCMonth() + periodInterval);
	}

	return periods;
}

/**
 * Find the index of the period range that matches a date range.
 *
 * A date range is two strings of date, in UTC time, of the form 'YYYY-MM-DD'.
 *
 * In the date range, only the first date is used to search for a period
 * starting at the same date.
 *
 * @param dateRange - The date range to search for.
 * @param availablePeriods - The period ranges to search in.
 * @returns - The index of the period range that matches the date range, or
 *   null if not found.
 */
export function findPeriodIndexForDateRange(
	dateRange: string[],
	availablePeriods: PeriodRange[]
): number | null {
	const rangeStart = parseUTCDate(dateRange[0]);

	if (rangeStart === null) {
		return null;
	}

	const foundIndex = availablePeriods.findIndex(
		(period) => rangeStart.toDateString() === period[0].toDateString()
	);

	return foundIndex === -1 ? null : foundIndex;
}

/**
 * Transform a period range to a date range.
 *
 * A date range is two strings of date, in UTC time, of the form 'YYYY-MM-DD'.
 *
 * @param periodRange - The period range to transform.
 * @returns - The date range as an array of two dates in string.
 */
export function formatPeriodRange(periodRange: PeriodRange): [string, string] {
	const dateFormat = 'yyyy-MM-dd';
	const rangeStart = formatUTCDate(periodRange[0], dateFormat);
	const rangeEnd = formatUTCDate(periodRange[1], dateFormat);

	return [rangeStart, rangeEnd];
}
