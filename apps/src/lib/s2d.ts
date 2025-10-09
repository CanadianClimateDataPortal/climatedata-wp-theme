import { S2D_NB_PERIODS } from '@/lib/constants';
import { FrequencyType } from '@/types/climate-variable-interface';
import { formatUTCDate, parseUTCDate } from '@/lib/utils';

export type PeriodRange = [Date, Date];

/**
 * Return the time periods for a release date and specific frequency.
 *
 * The number, length and start of time periods depend on the frequency and the
 * release date. See `S2D_NB_PERIODS` in '@/lib/constants'
 *
 * For example, for a frequency of 'monthly', we have 3 time periods of one
 * month. They are for the first three months starting from the release date's
 * month.
 *
 * ```
 * const releaseDate = new Date('2025-10-15');
 * const periods = getPeriods(releaseDate, FrequencyType.MONTHLY);
 * // Returned periods are (as array of Date instances): [
 * // [2025-10-01, 2025-10-31]
 * // [2025-11-01, 2025-11-30]
 * // [2025-12-01, 2025-12-31]
 * ```
 *
 * A period start is always the first day of the month, and a period end is
 * always the last day of the month. All dates are in UTC time.
 *
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
 * Find the index of the period range that matches a string date range.
 *
 * A date range is an array of two strings representing a date, in UTC time.
 * Each string must be of the form 'YYYY-MM-DD'. The date range is generally
 * created from the `dateRange` URL parameter.
 *
 * To find the matching period, only the first date of the date range is used.
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
 * Transform a period range (Date instances) to a date range (strings).
 *
 * A date range is two strings representing dates in UTC time. The strings are
 * of the form 'YYYY-MM-DD'.
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
