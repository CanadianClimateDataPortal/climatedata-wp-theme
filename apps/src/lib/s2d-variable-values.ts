type DateRange = [Date, Date];

export interface S2DVariableValuesModalSection {
	value?: number;
}

export interface S2DVariableValuesModalSkillSection
	extends S2DVariableValuesModalSection {
	crpss: number;
}

/**
 * Component Props for S2DVariableValues
 */
export interface S2DVariableValuesComponentProps {
	dateRange: DateRange;
	dateRangeYears: [number, number];
	skill: S2DVariableValuesModalSkillSection;
	historicalMedian: S2DVariableValuesModalSection;
	nearNormalTemperatureRange?: [number, number];
}

export interface CreateS2DVariableValuesFactory {
	dateRange: DateRange;
	skill: number;
	crpss: number;
	historicalMedian: number;
	nearNormalTemperatureRange?: S2DVariableValuesComponentProps['nearNormalTemperatureRange'];
}

/**
 * @deprecated Let's figure out how to resolve this value
 */
export const S2D_HARDCODED_SKILL_CRPSS = 0.18;

/**
 * @deprecated Let's figure out how to resolve this value
 */
export const S2D_HARDCODED_SKILL_VALUE = 2;

/**
 * @deprecated Let's figure out how to resolve this value
 */
export const S2D_HARDCODED_HISTORICAL_MEDIAN_VALUE = 1.3;

/**
 * @deprecated Let's figure out how to resolve this value
 */
export const S2D_HARDCODED_TEMPERATURE_RANGE_VALUE = [
	17.1, 18.7,
] as NonNullable<S2DVariableValuesComponentProps['nearNormalTemperatureRange']>;

/**
 * @deprecated Let's figure out how to resolve this value
 */
export const S2D_HARDCODED_1991_2020_DATE_RANGE: DateRange = [
	new Date(`1991-07-01T00:00:00Z`),
	new Date(`2020-09-30T00:00:00Z`),
];

/**
 * @remark Let's figure out the HARDCODED values here and remove this comment.
 */
export const createPropsForS2DVariableValues = ({
	dateRange = S2D_HARDCODED_1991_2020_DATE_RANGE,
	skill = S2D_HARDCODED_SKILL_VALUE,
	crpss = S2D_HARDCODED_SKILL_CRPSS,
	historicalMedian = S2D_HARDCODED_HISTORICAL_MEDIAN_VALUE,
	nearNormalTemperatureRange = S2D_HARDCODED_TEMPERATURE_RANGE_VALUE,
}: Partial<CreateS2DVariableValuesFactory>): S2DVariableValuesComponentProps => {
	const dateRangeYears = dateRange.map((i) => i.getFullYear()) as [
		number,
		number,
	];
	const out: S2DVariableValuesComponentProps = {
		dateRange,
		dateRangeYears,
		nearNormalTemperatureRange,
		skill: {
			value: skill,
			crpss,
		},
		historicalMedian: {
			value: historicalMedian,
		},
	};

	return out;
};
