import {
	ClimateVariableConfigInterface,
	ClimateVariableInterface,
	FrequencyConfig,
	FrequencyOption,
	InteractiveRegionConfig,
	InteractiveRegionOption,
	ScenarioInterface,
	ThresholdInterface,
	VersionInterface,
} from "@/types/climate-variable-interface";

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

	getThreshold(): string | number | null {
		return this._config.threshold || this._config.thresholds?.[0]?.value || null;
	}

	getScenarios(): ScenarioInterface[] {
		// Only retrieve scenarios matching the current version.
		return this._config.scenarios?.filter((scenario) => scenario.version === this.getVersion()) ?? [];
	}

	getScenario(): string | null {
		return this._config.scenario ?? null;
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return this._config.interactiveRegionConfig ?? null;
	}

	getInteractiveRegion(): InteractiveRegionOption | null {
		return this._config.interactiveRegion ?? null;
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return this._config.frequencyConfig ?? null;
	}

	getFrequency(): FrequencyOption | null {
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

	toObject(): ClimateVariableConfigInterface {
		return {
			...this._config,
		};
	}
}

export default ClimateVariableBase;
