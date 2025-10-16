import {
  type TemperatureUnit,
} from '@/lib/value-temperature';

export interface S2DVariableValuesModalSection {
	value?: number;
	label?: string;
	labelTooltip?: string;
	/**
	 * Bits of information we write in between parenthesis
	 */
	parens?: string[];
}

type DateRange = [Date, Date];

/**
 * Component Props for S2DVariableValues
 */
export interface S2DVariableValuesComponentProps {
	dateRange: DateRange;
	temperatureRange: null | [number, number];
	skill: S2DVariableValuesModalSection;
	historicalMedian: S2DVariableValuesModalSection;
	temperatureUnit: TemperatureUnit;
}

export interface CreateS2DVariableValuesFactory {
	dateRange: DateRange;
	skill: number;
	historicalMedian: number;
	temperatureUnit?: TemperatureUnit;
	temperatureRange?: S2DVariableValuesComponentProps['temperatureRange'];
}

/**
 * CSS class name mappings for S2DVariableValues
 */
export interface S2DVariablesValuesClassNames extends Record<string, string>{
	/**
	 * The gray text right under the information point that's in big letters.
	 */
	smallSubTitleUnderEmphasis: string;

	/**
	 * The information point in emphasis letters.
	 */
	emphasisText: string;
}

/**
 * Data model outside of a class for testability.
 * Some quick example to start from.
 */

export const S2D_FALLBACK_TEMPERATURE_UNIT: TemperatureUnit = 'celsius';

export const S2D_HARDCODED_SKILL_VALUE = 2;

export const S2D_HARDCODED_HISTORICAL_MEDIAN_VALUE = 1.3;

export const S2D_HARDCODED_TEMPERATURE_RANGE_VALUE = [ 17.1, 18.7 ] as S2DVariableValuesComponentProps['temperatureRange'];

const toUTC = (input: unknown): Date => {
	const date = new Date(`${input}T00:00:00Z`);
	if (Number.isNaN(date.getDate())) {
		throw new Error(String(date));
	}
	return date;
};

const HARDCODED_DATE_RANGE: DateRange = [
	toUTC('1991-07-01'),
	toUTC('2020-09-30'),
];

// Testability. Plilze!
export const createPropsForS2DVariableValues = ({
	dateRange = HARDCODED_DATE_RANGE,
	skill = void 0,
	historicalMedian = void 0,
	temperatureRange = null,
	temperatureUnit = S2D_FALLBACK_TEMPERATURE_UNIT,
}: Partial<CreateS2DVariableValuesFactory>): S2DVariableValuesComponentProps => {
	const yearTuples = dateRange.map((i) => String(i.getFullYear()));
	const out: S2DVariableValuesComponentProps = {
		dateRange,
		temperatureUnit,
		temperatureRange,
		skill: {
			value: skill,
			parens: [],
		},
		historicalMedian: {
			value: historicalMedian,
			parens: yearTuples,
		},
	};

	return out;
};
