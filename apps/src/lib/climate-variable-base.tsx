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
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ThresholdInterface,
} from "@/types/climate-variable-interface";
import RasterMap from "@/components/raster-map";
import RasterMapDownload from "@/components/download/raster-map-download";

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

	getVersions(): string[] {
		return this._config.versions ?? [];
	}

	getVersion(): string | null {
		return this._config.version || this._config.versions?.[0] || null;
	}

	getThresholds(): ThresholdInterface[] {
		return this._config.thresholds ?? [];
	}

	getThreshold(): string | null {
		return this._config.threshold || this._config.thresholds?.[0]?.value || null;
	}

	getScenarios(): string[] {
		// Only retrieve scenarios matching the current version.
		const version = this.getVersion() || Object.keys(this._config.scenarios ?? {})[0];
		return version ? this._config.scenarios?.[version] ?? [] : [];
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

	hasDelta(): boolean {
		return this._config.hasDelta ?? false;
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
		return this._config.dateRange ?? null;
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

	getDownloadType(): DownloadType | null {
		return this._config.downloadType ?? null;
	}

	getFileFormatTypes(): FileFormatType[] | null {
		return this._config.fileFormatTypes ?? [];
	}

	toObject(): ClimateVariableConfigInterface {
		return {
			...this._config,
		};
	}

	renderMap(): React.ReactElement {
		return <RasterMap />
	}

	renderDownloadMap(): React.ReactElement {
		return <RasterMapDownload />;
	}
}

export default ClimateVariableBase;
