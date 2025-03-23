
export interface VersionInterface {
	value: string;
	label: string;
}

export interface ScenarioInterface {
	value: string;
	label: string;
	version: string;
}

export interface ThresholdInterface {
	value: string | number;
	label: string;
}

export enum InteractiveRegionOption {
	GRIDDED_DATA = "gridded_data",
	CENSUS = "census",
	HEALTH = "health",
	WATERSHED = "watershed",
}

export type InteractiveRegionConfig = {
	[K in InteractiveRegionOption]: boolean;
}

export enum FrequencyDisplayModeOption {
	MAP = "map",
	DOWNLOAD = "download",
	ALWAYS = "always",
	NONE = "none",
}

export enum FrequencyOption {
	ANNUAL = "annual",
	MONTHLY = "months",
	SEASONAL = "seasons"
}

export type FrequencyConfig = {
	[K in FrequencyOption]: FrequencyDisplayModeOption;
}

export interface ClimateVariableConfigInterface {
	id: string;
	postId?: number;
	class: string;
	name: string;
	versions?: VersionInterface[];
	version?: string | null;
	thresholds?: ThresholdInterface[];
	threshold?: string | number | null;
	scenarios?: ScenarioInterface[];
	scenario?: string | null;
	interactiveRegionConfig?: InteractiveRegionConfig;
	interactiveRegion?: InteractiveRegionOption;
	frequencyConfig?: FrequencyConfig;
	frequency?: FrequencyOption;
	hasDelta?: boolean;
	defaultColourScheme?: string[];
	colourScheme?: string[];
	enableColourOptions?: boolean;
}

/**
 * Interface representing functionality for handling climate variables and their configurations.
 */
export interface ClimateVariableInterface {
	getVersions(): VersionInterface[];

	getVersion(): string | null;

	getThresholds(): ThresholdInterface[];

	getThreshold(): string | number | null;

	getScenarios(): ScenarioInterface[];

	getScenario(): string | null;

	getInteractiveRegionConfig(): InteractiveRegionConfig | null;

	getInteractiveRegion(): InteractiveRegionOption | null;

	getFrequencyConfig(): FrequencyConfig | null;

	getFrequency(): FrequencyOption | null;

	hasDelta(): boolean;

	getColourScheme(): string[];

	getColourOptionsStatus(): boolean;

	toObject(): ClimateVariableConfigInterface;
}
