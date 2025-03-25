
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

/**
 * Interface representing the configuration for a climate variable.
 */
export interface ClimateVariableConfigInterface {
	/** Unique identifier for the climate variable */
	id: string;

	/** WordPress Post ID, used for backend operations (optional) */
	postId?: number;

	/** Class name defining the type or category of the climate variable */
	class: string;

	/** Human-readable name for the climate variable */
	name: string;

	/** Available versions for this climate variable */
	versions?: VersionInterface[];

	/** Selected version for this climate variable */
	version?: string | null;

	/** Available thresholds for the climate variable data */
	thresholds?: ThresholdInterface[];

	/** Selected threshold value for display or computation */
	threshold?: string | number | null;

	/** Available scenarios linked to this climate variable */
	scenarios?: ScenarioInterface[];

	/** Selected scenario value */
	scenario?: string | null;

	/** Configuration defining interactive region options and their status */
	interactiveRegionConfig?: InteractiveRegionConfig;

	/** Currently selected interactive region option */
	interactiveRegion?: InteractiveRegionOption;

	/** Configuration defining frequency options and corresponding display modes */
	frequencyConfig?: FrequencyConfig;

	/** Currently selected frequency option */
	frequency?: FrequencyOption;

	/** Indicates whether delta (difference) values are available */
	hasDelta?: boolean;

	/** Default color scheme used for visualizing the variable */
	defaultColourScheme?: string[];

	/** Custom color scheme used for visualizing the variable */
	colourScheme?: string[];

	/** Flag indicating whether color options are enabled */
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
