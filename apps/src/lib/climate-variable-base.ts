import React from 'react';
import {
	AveragingType,
	ClimateVariableConfigInterface,
	ClimateVariableInterface,
	ColourType,
	CustomColourSchemes,
	DateRangeConfig,
	DownloadFile,
	DownloadType,
	FieldConfig,
	FieldValues,
	FileFormatType,
	ForecastDisplay,
	ForecastDisplays,
	ForecastType,
	ForecastTypes,
	FrequencyConfig,
	FrequencyType,
	GridCoordinates,
	GridRegion,
	InteractiveMode,
	InteractiveRegionConfig,
	InteractiveRegionOption,
	LegendConfig,
	LegendConfigSet,
	LocationModalContentParams,
	ScenariosConfig,
	ThresholdInterface,
} from '@/types/climate-variable-interface';
import { getDefaultFrequency, getFrequencyType, utc } from '@/lib/utils';
import { MapDisplayType, WMSParams } from '@/types/types';

/**
 * Preferred default emissions scenario per model version (CLIM-1096).
 *
 * The product requirement is that the map should default to SSP2-4.5 (cmip6)
 * or RCP4.5 (cmip5) whenever that scenario is applicable to the current
 * variable, rather than blindly picking the first scenario in the list.
 *
 * Data-driven descriptor (private source of truth): keyed by the version
 * string returned by {@link ClimateVariableBase.getVersion}. A version with no
 * entry here has no preferred scenario and falls back to the first available
 * scenario. A `Map` lets us look a version up with `.get()` and get
 * `string | undefined` natively — no key-narrowing cast needed.
 *
 * @see {@link ClimateVariableBase.getDefaultScenario}
 */
const DEFAULT_SCENARIO_BY_VERSION = new Map<string, string>([
	['cmip5', 'rcp45'],
	['cmip6', 'ssp245'],
]);

/**
 * Percentile suffix used by precalculated variables whose scenarios encode a
 * percentile (e.g. sea level, which exposes `rcp45-p50` rather than a bare
 * `rcp45`). Customer-confirmed median percentile for the default scenario.
 *
 * @see {@link ClimateVariableBase.getDefaultScenario}
 */
const DEFAULT_SCENARIO_PERCENTILE_SUFFIX = '-p50';

/**
 * Resolve the default scenario for a given version from a list of scenarios,
 * applying the CLIM-1096 preference cascade. Single implementation shared by
 * {@link ClimateVariableBase.getDefaultScenario} and
 * {@link ClimateVariableBase.getValidScenarioForVersion} so the lazy read and
 * the eager version-change reset never diverge.
 *
 * Cascade (always SSP2-4.5/RCP4.5 when available; never force an inapplicable
 * choice):
 * 1. No scenarios → `null` (null-safe for S2D/ahccd variables).
 * 2. No preferred scenario for this version → fall through to step 5.
 * 3. Preferred scenario is offered → return it (e.g. `rcp45`, `ssp245`).
 * 4. Preferred median percentile is offered → return it (e.g. `rcp45-p50`).
 * 5. Graceful fallback → first available scenario, or `null`.
 *
 * @param version - The model version the scenarios belong to, or `null`.
 * @param scenarios - The scenarios available for that version.
 *
 * @returns The preferred default scenario, or `null` when none applies.
 */
const resolveDefaultScenario = (
	version: string | null,
	scenarios: string[],
): string | null => {
	if (scenarios.length === 0) {
		return null;
	}
	const preferred = version ? DEFAULT_SCENARIO_BY_VERSION.get(version) : undefined;
	if (preferred === undefined) {
		return scenarios[0] ?? null;
	}
	if (scenarios.includes(preferred)) {
		return preferred;
	}
	const preferredPercentile = `${preferred}${DEFAULT_SCENARIO_PERCENTILE_SUFFIX}`;
	if (scenarios.includes(preferredPercentile)) {
		return preferredPercentile;
	}
	return scenarios[0] ?? null;
};

/**
 * A base class representing a climate variable and its configuration. This class provides methods
 * to retrieve different aspects of the climate variable configuration, such as versions, thresholds,
 * scenarios, and visualization properties.
 */
class ClimateVariableBase implements ClimateVariableInterface {
	private readonly _config: ClimateVariableConfigInterface;

	constructor(config: ClimateVariableConfigInterface) {
		this._config = config;
	}

	getClass(): string {
		return this._config.class ?? '';
	}

	getId(): string {
		return this._config.id;
	}

	getPostId(): number | undefined {
		return this._config.postId ?? undefined;
	}

	getTitle(locale?: string): string | null {
		const title = this._config.title;

		if (title && typeof title !== 'string' && 'en' in title) {

				if (locale === 'fr' && title.fr) {
						return title.fr;
				}
				return title.en;
		}

		return title as string || null;
	}

	getDatasetType(): string | null {
		return this._config.datasetType ?? null;
	}

	getVersions(): string[] {
		return this._config.versions ?? [];
	}

	getVersion(): string | null {
		return this._config.version || this.getVersions()?.[0] || null;
	}

	getThresholds(): ThresholdInterface[] {
		return this._config.thresholds ?? [];
	}

	getThreshold(): string | null {
		return this._config.threshold || this._config.thresholds?.[0]?.value || null;
	}

	getScenariosConfig(): ScenariosConfig | null {
		return this._config.scenarios ?? null;
	}

	getScenarios(): string[] {
		// Only retrieve scenarios matching the current version.
		const scenariosConfig = this.getScenariosConfig() ?? {};
		const version = this.getVersion() || Object.keys(scenariosConfig)[0];
		return version ? scenariosConfig?.[version] ?? [] : [];
	}

	getScenario(): string | null {
		// Check if the current scenario actually belongs to the current version.
		// An explicit, valid selection (e.g. `?scen=` in the URL) always wins.
		const currentScenario = this._config.scenario;
		if (currentScenario && this.getScenarios().includes(currentScenario)) {
			return currentScenario;
		}
		// Otherwise default to the preferred scenario (CLIM-1096), not blindly
		// the first one in the list.
		return this.getDefaultScenario();
	}

	/**
	 * Resolve the default scenario to display when none is explicitly selected.
	 *
	 * Implements the CLIM-1096 preference: the map should default to SSP2-4.5
	 * (cmip6) or RCP4.5 (cmip5) whenever that scenario is applicable, and never
	 * force an inapplicable choice. Delegates the cascade to
	 * {@link resolveDefaultScenario}, which both this method and
	 * {@link ClimateVariableBase.getValidScenarioForVersion} share so the lazy
	 * read and the eager version-change reset agree.
	 *
	 * @returns The preferred default scenario for the current version, or
	 *   `null` when the variable exposes no scenarios (e.g. S2D, AHCCD).
	 */
	getDefaultScenario(): string | null {
		const version = this.getVersion();
		const scenarios = this.getScenarios();
		return resolveDefaultScenario(version, scenarios);
	}

	getValidScenarioForVersion(version: string): string | null {
		// Get scenarios for the specified version, then apply the same
		// CLIM-1096 preference cascade as getDefaultScenario so the eager
		// version-change reset and the lazy read never diverge.
		const scenariosConfig = this.getScenariosConfig() ?? {};
		const scenarios = scenariosConfig[version] ?? [];
		return resolveDefaultScenario(version, scenarios);
	}

	getScenarioCompare(): boolean {
		// Return if scenario comparison is checked or not.
		return this._config.scenarioCompare ?? false;
	}

	getScenarioCompareTo(): string | null {
		// Check if the scenarioCompareTo actually belongs to the current version
		// If not, return null, as we don't want this to be the same as the current scenario.
		const scenarioCompareTo = this._config.scenarioCompareTo;
		if (scenarioCompareTo && this.getScenarios().includes(scenarioCompareTo)) {
			return scenarioCompareTo;
		}
		return null;
	}

	getAnalyzeScenarios(): string[] {
		return this._config.analyzeScenarios ?? [];
	}

	getLayerStyles(): string {
		return this._config.layerStyles ?? '';
	}

	getUnit(): string {
		return this._config.unit ?? '';
	}

	getUnitDecimalPlaces(): number {
		return this._config.unitDecimalPlaces ?? 0;
	}

	getUnitLegend(): string {
		return this._config.unitLegend ?? this.getUnit();
	}

	getLegendConfigs(): LegendConfigSet {
		return this._config.legendConfigs ?? {};
	}

	getLegendConfig(type: MapDisplayType): LegendConfig | null {
		const configs = this.getLegendConfigs();
		return configs?.[type] || null;
	}

	getInteractiveMode(): InteractiveMode {
		return this._config.interactiveMode ?? 'region';
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return this._config.interactiveRegionConfig ?? null;
	}

	getInteractiveRegion(): InteractiveRegionOption | null {
		const interactiveRegionConfig = this.getInteractiveRegionConfig();

		// If we have a region and is valid.
		if (this._config.interactiveRegion && interactiveRegionConfig?.[this._config.interactiveRegion]) {
			return this._config.interactiveRegion;
		}

		// Get the first region that's active.
		if (interactiveRegionConfig) {
			for (const [key, value] of Object.entries(interactiveRegionConfig)) {
				if (value) {
					return key as InteractiveRegionOption;
				}
			}
		}

		return null;
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return this._config.frequencyConfig ?? null;
	}

	getFrequency(): string | null {
		return this._config.frequency ?? null;
	}

	getGridType(): string | null {
		return this._config.gridType ?? null
	}

	hasDelta(): boolean | undefined {
		return this._config.hasDelta;
	}

	getDataValue(): string | null {
		return this._config.dataValue ?? null;
	}

	getCustomColourSchemes(): CustomColourSchemes | null {
		return this._config.customColourSchemes ?? null;
	}

	getColourScheme(): string | null {
		return this._config.colourScheme ?? null
	}

	getColourOptionsStatus(): boolean {
		return this._config.enableColourOptions ?? true;
	}

	getColourType(): string | null {
		return this._config.colourType ?? ColourType.CONTINUOUS;
	}

	getAnalysisFields(): FieldConfig[] {
		return this._config.analysisFields ?? [];
	}

	getAnalysisFieldValues(): FieldValues {
		return this._config.analysisFieldValues ?? {};
	}

	getAnalysisFieldValue(key: keyof FieldValues): string | null {
		return this._config.analysisFieldValues?.[key] ?? null;
	}

	getSelectedPeriods(): Date[] {
		const periodStrings = this._config.selectedPeriods ?? [];
		return periodStrings.map(periodString => utc(periodString) as Date);
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return this._config.dateRangeConfig ?? null;
	}

	getDownloadDateRangeConfig(): DateRangeConfig | null {
		return this._config.downloadDateRangeConfig ?? this.getDateRangeConfig();
	}

	getDateRange(): string[] | null {
		return this._config.dateRange ?? this.getDefaultDateRange();
	}

	getDefaultDateRange(): string[] | null {
		return this._config.defaultDateRange ?? [
			"2040",
			"2070",
		];
	}

	isTimePeriodARange(): boolean {
		return this._config.isTimePeriodARange ?? true;
	}

	getAveragingOptions(): AveragingType[] {
		return this._config.averagingOptions ?? [];
	}

	getAveragingType(): AveragingType | null {
		if (this._config.averagingType) {
			return this._config.averagingType;
		} else {
			return this.getAveragingOptions()?.[0] ?? null;
		}
	}

	getPercentileOptions(): string[] {
		return this._config.percentileOptions ?? [];
	}

	getPercentiles(): string[] {
		return this._config.percentiles ?? [];
	}

	getMissingDataOptions(): string[] {
		return this._config.missingDataOptions ?? [];
	}

	getMissingData(): string | null {
		return this._config.missingData ?? this.getMissingDataOptions()?.[0] ?? null;
	}

	getModelOptions(): string[] {
		return this._config.modelOptions ?? [];
	}

	getModel(): string | null {
		return this._config.model ?? this.getModelOptions()?.[0] ?? null;
	}

	getFileFormatTypes(): FileFormatType[] {
		return this._config.fileFormatTypes ?? [];
	}

	getFileFormat(): FileFormatType | null {
		return this._config.fileFormat || this.getFileFormatTypes()?.[0] || null;
	}

	getMaxDecimals(): number {
		return this._config.maxDecimals ?? 0;
	}

	getDecimalPlace(): number {
		return this._config.decimalPlace ?? 0;
	}

	getDownloadType(): DownloadType | null {
		return this._config.downloadType ?? null;
	}

	hasMultipleDownloadUrls(): boolean {
		return this._config.hasMultipleDownloadUrls ?? false;
	}

	getDownloadUrls(): string[] {
		return this._config.downloadUrls ?? [];
	}

	async getDownloadUrl(): Promise<string | null> {
		return this._config.downloadUrl ?? null;
	}

	getStationDownloadFiles(): Promise<DownloadFile[]> {
		return Promise.resolve([]);
	}

	getAnalysisUrl(): string | null {
		let analysisUrl = '/providers/finch/processes/';

		// If frequency is daily, it turns into analyze
		if (this.getFrequency() === FrequencyType.DAILY) {
			if (this.getSelectedRegion()) {
				analysisUrl += 'subset_bbox_dataset';
			} else {
				analysisUrl += 'subset_grid_point_dataset';
			}
		} else {
			// If projection
			if (this.getDatasetType() === 'projection') {
				// The endpoint is different for user custom (i.e. shapefile)
				// requests
				const isUserRegion = this.getInteractiveRegion() === InteractiveRegionOption.USER;
				analysisUrl += isUserRegion ?
					'ensemble_polygon_' :
					'ensemble_grid_point_';
			}

			// Add climate variable finch
			analysisUrl += this.getFinch();
		}

		analysisUrl += '/jobs';

		return analysisUrl;
	}

	getFinch(): string {
		return this._config.finch ?? this.getId();
	}

	getFinchDataset(): string | null {
		const version = this.getVersion();
		const frequency = this.getFrequency();
		const finchID = this.getFinch();
		const scenarios = this.getAnalyzeScenarios();

		if (finchID === 'hxmax_days_above') {
			return 'humidex-daily';
		}

		if (
			version === 'cmip6' &&
			(scenarios.includes('ssp370') || frequency === 'daily')
		) {
			return 'candcs-m6-24';
		}

		if (version === 'cmip5') {
			return 'candcs-u5';
		}

		if (version === 'cmip6') {
			return 'candcs-m6';
		}

		return version;
	}

	getAhccdDownloadRequiredVariables(): string[] {
		return this._config.ahccdDownloadRequiredVariables ?? [];
	}

	getSelectedPoints(): GridCoordinates | null {
		return this._config.selectedPoints ?? null;
	}

	getSelectedPointsCount(): number {
		return Object.keys(this._config.selectedPoints ?? {}).length;
	}

	getSelectedRegion(): GridRegion | null {
		return this._config.selectedRegion ?? null;
	}

	toObject(): ClimateVariableConfigInterface {
		return {
			...this._config,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getLocationModalContent(_params: LocationModalContentParams): React.ReactNode | null {
		return null;
	}

	getLayerValue(scenario: string | null | undefined, section?: string): string {
		const version = this.getVersion() === 'cmip5' ? '' : this.getVersion();
		const threshold = this.getThreshold();

		let frequency = this.getFrequency() ?? null;

		// If there's no frequency set, try to get the default value from the config.
		const frequencyConfig = this.getFrequencyConfig() ?? null;
		if (!frequency && frequencyConfig && section) {
			frequency = getDefaultFrequency(frequencyConfig, section) ?? null;
		}

		// Fallback to annual.
		if (!frequency) {
			frequency = FrequencyType.ANNUAL;
		}

		const frequencyCode = getFrequencyType(frequency);
		let frequencyName = frequency;

		if (frequency === FrequencyType.ANNUAL_JUL_JUN) {
			// Special case: the YS-JUL and YS have the same frequency name (but different codes)
			frequencyName = FrequencyType.ANNUAL;
		}

		const valuesArr = [
			version,
			threshold,
			frequencyCode as string || '',
			scenario,
		];

		// If the percentile is not already in the scenario name, we need to add it.
		if (scenario && ! /-p\d+$/.test(scenario)) {
			valuesArr.push('p50');
		}

		valuesArr.push(
			frequencyName,
			'30year',
			this.getDataValue() === 'delta' ? 'delta7100' : ''
		);

		return 'CDC:' + valuesArr.filter(Boolean).join('-');
	}

	getStationTypeFilter(): string[] {
		return this._config.stationTypeFilter ?? ['T', 'P', 'B'];
	}

	/**
	 * Update the WMS parameters of the data layer.
	 *
	 * Can be used to update, add, or delete parameters specifically for this variable.
	 *
	 * By default, simply returns the parameters unchanged.
	 *
	 * @param params WMS parameters used for the data layer request
	 * @param isComparisonMap If true, the parameters will be used to render the comparison map
	 * @return Updated WMS parameters
	 */
	// @ts-expect-error The `isComparisonMap` is not used here, but it's used in implementations
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateMapWMSParams(params: WMSParams, isComparisonMap: boolean): WMSParams {
		return params;
	}

	getForecastType(): ForecastType {
		return this._config.forecastType ?? ForecastTypes.EXPECTED;
	}

	getForecastDisplay(): ForecastDisplay {
		return this._config.forecastDisplay ?? ForecastDisplays.FORECAST;
	}
}

export default ClimateVariableBase;
