import { sprintf } from '@wordpress/i18n';
import { S2D_FORECAST_CONVENTIONAL_NB_PERIODS } from '@/lib/constants';
import {
	FrequencyType,
	S2DFrequencyType,
	S2DFrequencyTypes,
} from '@/types/climate-variable-interface';
import { formatUTCDate, utc } from '@/lib/utils';
import { __ } from '@/context/locale-provider';
import { formatIntlDate } from '@/lib/format';
import type {
	PeriodRange,
} from './types';
import { isFrequencyTypeDecadal } from './utils';

type PeriodJumpUnit = 'month' | 'year';

/**
 * Describe how many units to "jump" ahead when describing time ranges.
 *
 * Allows to describe without ambiguity what we mean by "the end of the period"
 * for a given frequency type.
 *
 * For "monthly" frequency, the period end is the end of the same month.
 * For "seasonal", the period end is the end of the 3rd following month.
 * For "decadal" frequencies, the period end is the end of the 5th year.
 *
 * @param frequency - The frequency type for which to resolve the period end jump.
 * @returns A tuple containing the jump size and the jump unit. e.g. [3, 'month'] for seasonal frequency.
 * @throws An error if the frequency type is not supported.
 */
export const resolveFrequencyPeriodJump = (
	frequency: S2DFrequencyType,
): [number, PeriodJumpUnit] => {
	/**
	 * This is not the same as what's described in
	 * {@link S2D_FORECAST_CONVENTIONAL_NB_PERIODS} because it is
	 * about the actual length of the period ... in
	 * *number of a {@link PeriodJumpUnit}* and not
	 * *how many periods* of available data to look at.
	 * @TODO Improve comment
	 */
	let periodJumpSize = 1;
	/**
	 * Up to before supporting {@link S2DFrequencyTypes} of type "decadal",
	 * the period end was always calculated in months.
	 */
	let periodJumpSizeUnit: PeriodJumpUnit = 'month';
	if (frequency === S2DFrequencyTypes.SEASONAL) {
		// Because a season is 3 months long.
		periodJumpSize = 3;
	} else if (isFrequencyTypeDecadal(frequency)) {
		periodJumpSizeUnit = 'year';
		periodJumpSize = 5; // There might be some logic to adjust this here
	} else if (frequency === S2DFrequencyTypes.MONTHLY) {
		periodJumpSize = 1;
	} else {
		throw new Error(
			sprintf(
				__('Unsupported frequency type: %s'),
				frequency
			)
		);
	}

	return [
		periodJumpSize,
		periodJumpSizeUnit,
	];
};


/**
 * For a period start return the end date of the period based on the frequency.
 *
 * @TODO Improve comment
 *
 *
 * @param periodStart - The date representing the start of the period
 * @param frequency - The frequency for which we want the period end
 * @returns - The date for the end of the period
 */
const getPeriodEnd = (
	periodStart: Date,
	frequency: S2DFrequencyType,
): Date => {
	const [
		periodJumpSize,
		periodJumpSizeUnit,
	] = resolveFrequencyPeriodJump(frequency);
	const periodEnd = new Date(periodStart);
	if (periodJumpSizeUnit === 'year') {
		periodEnd.setUTCFullYear(periodStart.getUTCFullYear() + periodJumpSize);
	} else {
		periodEnd.setUTCMonth(periodStart.getUTCMonth() + periodJumpSize);
	}
	periodEnd.setUTCDate(0);
	return periodEnd;
};


/**
 * Return the time periods for a release date and specific frequency.
 *
 * The number and length of time periods depend on the frequency:
 * - Seasonal frequency: 10 x 3-month periods, at 1-month interval
 * - Monthly frequency: 3 x 1-month periods, at 1-month interval
 * - Decadal frequency: 2 x 5-year periods, at 5-year interval
 *
 * The first period starts on the same month as the release date. A period start
 * is always the first day of the month, and a period end is always the last
 * day of the month.
 *
 * All dates are in UTC time.
 *
 * @example
 * ```typescript
 * const releaseDate = new Date('2025-10-15');
 * const periods = getPeriods(releaseDate, S2DFrequencyTypes.MONTHLY);
 * // Returned periods are (as array of Date instances): [
 * //   [2025-10-01, 2025-10-31]
 * //   [2025-11-01, 2025-11-30]
 * //   [2025-12-01, 2025-12-31]
 * // ]
 * ```
 *
 * @param releaseDate - The release date of the data.
 * @param frequency - The frequency for which to get the periods.
 * @returns An array of [start, end] date instances for each period.
 */
export const getPeriods = (
	releaseDate: Date,
	frequency: S2DFrequencyType,
): PeriodRange[] => {
	// nbPeriods: In other words; how long the list will be
	const nbPeriods = S2D_FORECAST_CONVENTIONAL_NB_PERIODS[frequency];
	const periods: PeriodRange[] = [];
	const lastPeriod = new Date(
		// Set to the first day of the month
		Date.UTC(releaseDate.getUTCFullYear(), releaseDate.getUTCMonth(), 1)
	);

	try {
		const [
			periodJumpSize,
			periodJumpSizeUnit,
		] = resolveFrequencyPeriodJump(frequency);

		for (let i = 0; i < nbPeriods; i++) {
			const periodStart = new Date(lastPeriod);
			const periodEnd = getPeriodEnd(periodStart, frequency);
			periods.push([periodStart, periodEnd]);
			if (periodJumpSizeUnit === 'month') {
				/**
				 * "moving window" of months.
				 * The line below makes it so that for a given {@link nbPeriods} list length
				 * each item cover more than one month, and we move one month at a time.
				 * @TODO Improve comment
				 */
				lastPeriod.setUTCMonth(lastPeriod.getUTCMonth() + 1 /* "window of months", moving by 1 month at a time */);
			} else {
				// In contrast to a "moving window" of months, we do not want years to overlap.
				lastPeriod.setUTCFullYear(lastPeriod.getUTCFullYear() + periodJumpSize);
			}
		}
	} catch (error) {
		console.error(
			`Error calculating periods for frequency "${frequency}":`,
			error
		);
	}


	return periods;
};

/**
 * Find the index of the period range that matches a string date range.
 *
 * A date range is an array of exactly two strings representing a date, in UTC
 * time. Each string must be of the form 'YYYY-MM-DD'. The date range is
 * generally created from the `dateRange` URL parameter.
 *
 * To find the matching period, only the first date of the date range is used.
 *
 * @param dateRange - The date range to search for. An array of exactly two
 *   strings.
 * @param availablePeriods - The period ranges to search in.
 * @returns - The index of the period range that matches the date range, or
 *   null if not found.
 */
export function findPeriodIndexForDateRange(
	dateRange: [string, string],
	availablePeriods: PeriodRange[]
): number | null {
	const rangeStart = utc(dateRange[0]);

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
 * @param dateFormat - The format to use for the date strings.
 * @returns - The date range as an array of two dates in string.
 */
export const formatPeriodRange = (
	periodRange: PeriodRange,
	dateFormat = 'yyyy-MM-dd',
): [string, string] => {
	const rangeStart = formatUTCDate(periodRange[0], dateFormat);
	const rangeEnd = formatUTCDate(periodRange[1], dateFormat);

	return [rangeStart, rangeEnd];
};

/**
 * Generate a period range label for a given date range and frequency.
 *
 * @param dateRangeStart - Start date of the period. Example: 2025-08-01
 * @param frequency - Frequency type
 * @param locale - Locale to use for formatting
 */
export const generatePeriodRangeLabel = (
	dateRangeStart: string,
	frequency: S2DFrequencyType,
	locale: string
): string | null => {
	const periodStart = utc(dateRangeStart);

	const isDecadalFrequencyType = isFrequencyTypeDecadal(frequency);

	if (!periodStart) {
		return null;
	}

	const periodStartLabel = isDecadalFrequencyType
		? formatIntlDate(periodStart, locale, { year: 'numeric' })
		: formatIntlDate(periodStart, locale, { month: 'long' });

	if (frequency === FrequencyType.MONTHLY) {
		return periodStartLabel;
	}

	const periodEnd = getPeriodEnd(periodStart, frequency);
	const periodEndLabel = isDecadalFrequencyType
		? formatIntlDate(periodEnd, locale, { year: 'numeric' })
		: formatIntlDate(periodEnd, locale, { month: 'long' });

	return sprintf(__('%s to %s'), periodStartLabel, periodEndLabel);
};
