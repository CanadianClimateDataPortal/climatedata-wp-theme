import React from "react";
import {
	AveragingType,
	ClimateVariableConfigInterface,
	ClimateVariableInterface,
	DateRangeConfig,
	DownloadType,
	FieldConfig,
	FieldValues,
	FileFormatType,
	FrequencyConfig,
	GridCoordinates,
	InteractiveRegionConfig,
	InteractiveRegionOption, ScenariosConfig,
	ThresholdInterface,
} from "@/types/climate-variable-interface";
import RasterMap from "@/components/raster-map";
import RasterDownloadMap from "@/components/download/raster-download-map";

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
		// If not, return the first scenario that belongs to the current version.
		const currentScenario = this._config.scenario;
		if (currentScenario && this.getScenarios().includes(currentScenario)) {
			return currentScenario;
		}
		return this.getScenarios()[0] || null;
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

	getColourScheme(): string[] {
		return this._config.colourScheme ?? this._config.defaultColourScheme ?? [];
	}

	getColourOptionsStatus(): boolean {
		return this._config.enableColourOptions ?? false;
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

	getDateRangeConfig(): DateRangeConfig | null {
		return this._config.dateRangeConfig ?? null;
	}

	getDateRange(): string[] | null {
		return this._config.dateRange ?? [
			"2040",
			"2070",
		];
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

	getFileFormatTypes(): FileFormatType[] {
		return this._config.fileFormatTypes ?? [];
	}

	getFileFormat(): FileFormatType | null {
		return this._config.fileFormat || this.getFileFormatTypes()?.[0] || null;
	}

	getMaxDecimals(): number {
		return this._config.maxDecimals ?? 0;
	}

	renderMap(): React.ReactElement {
		return <RasterMap />
	}

	renderDownloadMap(): React.ReactElement {
		return <RasterDownloadMap />;
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

	getAnalysisUrl(): string | null {
		return this._config.analysisUrl ?? null;
	}

	getSelectedPoints(): GridCoordinates | null {
		return this._config.selectedPoints ?? null;
	}

	toObject(): ClimateVariableConfigInterface {
		return {
			...this._config,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getLocationModalContent(_latlng: L.LatLng, _featureId: number): React.ReactNode {
		return null;
	}
}

export default ClimateVariableBase;
