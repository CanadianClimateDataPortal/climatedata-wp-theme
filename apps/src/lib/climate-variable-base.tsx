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
	ScenarioInterface,
	ThresholdInterface,
	VersionInterface,
} from "@/types/climate-variable-interface";
import RasterMap from "@/components/raster-map";

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

	getVersions(): VersionInterface[] {
		return this._config.versions ?? [];
	}

	getVersion(): string | null {
		return this._config.version || this._config.versions?.[0]?.value || null;
	}

	getThresholds(): ThresholdInterface[] {
		return this._config.thresholds ?? [];
	}

	getThreshold(): string | null {
		return this._config.threshold || this._config.thresholds?.[0]?.value || null;
	}

	getScenarios(): ScenarioInterface[] {
		// Only retrieve scenarios matching the current version.
		return this._config.scenarios?.filter((scenario) => scenario.version === this.getVersion()) ?? [];
	}

	getScenario(): string | null {
		// Check if the current scenario actually belongs to the current version.
		// If not, return the first scenario that belongs to the current version.
		const currentVersion = this.getVersion();
		const filteredScenario = this.getScenarios()?.find((scenario) => scenario.value === this._config.scenario && scenario.version === currentVersion);
		return filteredScenario?.value || this.getScenarios()?.[0]?.value || null;
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
}

export default ClimateVariableBase;
