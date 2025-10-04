import { S2D_NB_PERIODS } from '@/lib/constants';
import { FrequencyType } from '@/types/climate-variable-interface';

export type PeriodRange = [Date, Date];

/**
 * For a data release date, get all the period dates for a specific frequency.
 *
 * The number of periods and their length depend on the frequency. The start
 * date of each period depends on the release date.
 *
 * The period start is always the first day of the month, and the period end is
 * always the last day of the month.
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

export function getPeriodIndexForDateRange(
	dateRange: string[],
	availablePeriods: PeriodRange[]
): number | null {
	const rangeStart = parseReleaseDate(dateRange[0]);

	if (rangeStart === null) {
		return null;
	}

	const foundIndex = availablePeriods.findIndex(
		(period) => rangeStart.toDateString() === period[0].toDateString()
	);

	return foundIndex === -1 ? null : foundIndex;
}

// TODO: cette fonction devrait sans doute être ailleurs, car utilisée pour parser le release date et le date range
//  aussi, devrait peut-être pouvoir parser des dates partielles ?
export function parseReleaseDate(dateString: string): Date | null {
	const [yearPart, monthPart, dayPart] = dateString.split('-');
	const year = parseInt(yearPart);
	const month = parseInt(monthPart);
	const day = parseInt(dayPart);

	if (isNaN(year) || isNaN(month) || isNaN(day)) {
		return null;
	}

	const date = new Date(Date.UTC(year, month - 1, day));

	if (isNaN(date.valueOf())) {
		return null;
	}

	return date;
}
