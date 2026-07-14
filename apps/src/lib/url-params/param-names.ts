/**
 * Registry of URL search-parameter names shared by both SPAs (Map and Download).
 *
 * Single source of truth for the short parameter keys written to (and read from)
 * the window URL by the url-sync hooks, and re-used by the language switcher when
 * it reconstructs the current query. Both apps persist the *same* configuration
 * vocabulary; Download currently exercises only a subset (`dataset`, `var`) and
 * can grow into more of it (`ver`, `th`, `scen`, `dateRange`, …) without new keys.
 * Genuinely heavy state (map points / selected areas) is intentionally NOT
 * URL-persisted — it would exceed the URL length budget. Kept as a `const` map so
 * the string-literal types flow through `params.set(URL_PARAMS.X, …)`.
 */
export const URL_PARAMS = {
	VARIABLE_ID: 'var',
	VERSION: 'ver',
	THRESHOLD: 'th',
	FREQUENCY: 'freq',
	SCENARIO: 'scen',
	DO_COMPARE: 'cmp',
	COMPARE_TO: 'cmpTo',
	INTERACTIVE_REGION: 'region',
	DATA_VALUE: 'dataVal',
	COLOUR_SCHEME: 'clr',
	COLOUR_TYPE: 'clrType',
	AVERAGING_TYPE: 'avg',
	DATE_RANGE: 'dateRange',
	FORECAST_TYPE: 'fcastType',
	FORECAST_DISPLAY: 'fcastDisp',
	LOW_SKILL_MASKED: 'maskLowSkill',
	DATASET: 'dataset',
	DATA_OPACITY: 'dataOpacity',
	LABEL_OPACITY: 'labelOpacity',
	PERIOD: 'period',
	LATITUDE: 'lat',
	LONGITUDE: 'lng',
	ZOOM_LEVEL: 'zoom',
} as const;
