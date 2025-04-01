import React from "react";

export interface ScenariosConfig {
	[key: string]: string[];
}

export interface ThresholdInterface {
	value: string;
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

export enum FrequencyType {
	ANNUAL = "annual",
	ANNUAL_JUL_JUN = "annual_jul_jun",
	MONTHLY = "months",
	SEASONAL = "seasons",
	ALL_MONTHS = "allMonths",
	DAILY = "daily",
}

export type FrequencyConfig = {
	[K in FrequencyType]?: FrequencyDisplayModeOption;
}

export interface FieldConfig {
	key: string;
	type: 'input' | 'select';
	label: string;
	description?: string;
	help?: string;
	attributes?: {
		type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
		placeholder?: string;
	};
	options?: Array<{
		value: string | number;
		label: string;
	}>;
}

export interface FieldValues {
	[key: string]: string | null;
}

export interface DateRangeConfig {
	min: string;
	max: string;
	interval: number;
}

export enum AveragingType {
	ALL_YEARS = "allYears",
	THIRTY_YEARS = "30years",
}

export enum DownloadType {
	PRECALCULATED = "precalculated",
	ANALYZED = "analyzed",
}

export enum FileFormatType {
	CSV = "csv",
	JSON = "json",
	NetCDF = "netcdf",
}

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface GridCoordinates {
	[key: number]: Coordinates;
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

	/** Available versions for this climate variable */
	versions?: string[];

	/** Selected version for this climate variable */
	version?: string | null;

	/** Available thresholds for the climate variable data */
	thresholds?: ThresholdInterface[];

	/** Selected threshold value for display or computation */
	threshold?: string | null;

	/** Available scenarios linked to this climate variable */
	scenarios?: ScenariosConfig;

	/** Selected scenario value */
	scenario?: string | null;

	/** Selected scenarios for analysis */
	analyzeScenarios?: string[];

	/** Configuration defining interactive region options and their status */
	interactiveRegionConfig?: InteractiveRegionConfig;

	/** Currently selected interactive region option */
	interactiveRegion?: InteractiveRegionOption;

	/** Grid type used for raster maps */
	gridType?: string | null;

	/** Configuration defining frequency options and corresponding display modes */
	frequencyConfig?: FrequencyConfig;

	/** Currently selected frequency */
	frequency?: string;

	/** Indicates whether delta (difference) values are available */
	hasDelta?: boolean;

	/** Default color scheme used for visualizing the variable */
	defaultColourScheme?: string[];

	/** Custom color scheme used for visualizing the variable */
	colourScheme?: string[];

	/** Flag indicating whether color options are enabled */
	enableColourOptions?: boolean;

	/** An array of FieldConfigs used in the Download section */
	analysisFields?: FieldConfig[];

	/** Holds submitted values for analysisFields */
	analysisFieldValues?: FieldValues;

	/** Configuration defining the date range to be used in the Download section */
	dateRangeConfig?: DateRangeConfig;

	/** Stores the selected date range */
	dateRange?: string[] | null;

	/** Contains available averaging options */
	averagingOptions?: AveragingType[];

	/** Stores the selected averaging type */
	averagingType?: AveragingType;

	/** Available percentile options used for analysis */
	percentileOptions?: string[];

	/** Stores the selected percentiles */
	percentiles?: string[];

	/** The type of formats available */
	fileFormatTypes?: FileFormatType[];

	/** The file format to use for download */
	fileFormat?: FileFormatType;

	/** The maximum number of decimals to be used for the file */
	maxDecimals?: number;

	/** Determines if the variable data must be analyzed or is already precalculated. */
	downloadType?: DownloadType;

	hasMultipleDownloadUrls?: boolean;

	downloadUrls?: string[];

	downloadUrl?: string;

	analysisUrl?: string;

	selectedPoints?: GridCoordinates;
}

/**
 * Interface representing functionality for handling climate variables and their configurations.
 */
export interface ClimateVariableInterface {
	getVersions(): string[];

	getVersion(): string | null;

	getThresholds(): ThresholdInterface[];

	getThreshold(): string | null;

	getScenariosConfig(): ScenariosConfig | null;

	getScenarios(): string[];

	getScenario(): string | null;

	getAnalyzeScenarios(): string[];

	getInteractiveRegionConfig(): InteractiveRegionConfig | null;

	getInteractiveRegion(): InteractiveRegionOption | null;

	getGridType(): string | null;

	getFrequencyConfig(): FrequencyConfig | null;

	getFrequency(): string | null;

	hasDelta(): boolean | undefined;

	getColourScheme(): string[];

	getColourOptionsStatus(): boolean;

	getAnalysisFields(): FieldConfig[];

	getAnalysisFieldValues(): FieldValues;

	getAnalysisFieldValue(key: string): string | null;

	getDateRangeConfig(): DateRangeConfig | null;

	getDateRange(): string[] | null;

	getAveragingOptions(): AveragingType[];

	getAveragingType(): AveragingType | null;

	getPercentileOptions(): string[];

	getPercentiles(): string[];

	getFileFormatTypes(): FileFormatType[];

	getFileFormat(): FileFormatType | null;

	getMaxDecimals(): number;

	renderMap(): React.ReactElement;

	renderDownloadMap(): React.ReactElement;

	getDownloadType(): DownloadType | null;

	hasMultipleDownloadUrls(): boolean;

	getDownloadUrls(): string[];

	getDownloadUrl(): Promise<string | null>;

	getAnalysisUrl(): string | null;

	getSelectedPoints(): GridCoordinates | null;

	toObject(): ClimateVariableConfigInterface;
}
