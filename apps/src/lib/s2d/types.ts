export type PeriodRange = [Date, Date];

/**
 * Location-specific S2D forecast data from the API.
 *
 * Cutoffs are raw values in the variable's unit (°C, mm/day).
 * Probabilities are 0–100 percentages.
 */
export interface LocationS2DData {
	/** 20th percentile cutoff, e.g. `5.0` → "< 5.0 °C" */
	cutoff_unusually_low_p20: number;
	/** 33rd percentile cutoff, e.g. `1.8` → "Below 1.8 °C" */
	cutoff_below_normal_p33: number;
	historical_median_p50: number;
	/** 66th percentile cutoff, e.g. `5.3` → "Above 5.3 °C" */
	cutoff_above_normal_p66: number;
	/** 80th percentile cutoff, e.g. `6.9` → "> 6.9 °C" */
	cutoff_unusually_high_p80: number;
	/** 0–100, e.g. `4` → "4% probability of being unusually low" */
	prob_unusually_low: number;
	/** 0–100, e.g. `37` → "37% probability of being below normal" */
	prob_below_normal: number;
	/** 0–100, e.g. `38` → "38% probability of being near normal" */
	prob_near_normal: number;
	/** 0–100, e.g. `26` → "26% probability of being above normal" */
	prob_above_normal: number;
	/** 0–100, e.g. `5` → "5% probability of being unusually high" */
	prob_unusually_high: number;
	skill_level: number;
	skill_CRPSS: number;
}

/**
 * The extracted S2D filename components from a climate variable that's based on
 * internal IDs into human relatable strings.
 */
export interface ExtractS2DDownloadStepFilenameComponent {
	/**
	 * The filename component used to represent the climate variable.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_VARIABLE_ID}
	 */
	variableId: string;
	/**
	 * The filename component used to describe the forecast type.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FORECAST_TYPE}
	 */
	forecastType: string;
	/**
	 * The filename component used to describe the frequency.
	 * @see {@link S2D_DOWNLOAD_FILENAME_MAP_FREQUENCY_TYPE}
	 */
	frequencyType: string;
}

export interface SkillLevelData {
	skillLevel: number | null;
	skillCRPSS: number | null;
	skillLevelLabel: string;
}
