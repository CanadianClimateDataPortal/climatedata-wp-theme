import React from "react";
import { MultilingualField } from "./types";

export interface variableClassMap {
	[key: string]: string;
}

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
	ANNUAL = "ann",
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
	required?: boolean;
	comparison?: string;
	unit?: string;
	attributes?: {
		type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date';
		placeholder?: string;

	};
	options?: { value: string; label: string }[];
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

export enum ColourType {
	CONTINUOUS = "ramp",
	DISCRETE = "intervals",
}

export interface ColorMap {
	colours: string[];
	quantities: number[];
	schemeType: ColourType;
}

export interface TemporalRange {
	low: number;
	high: number;
}

export interface TemporalScaleConfig {
	absolute: TemporalRange;
	delta: TemporalRange;
	unit: string;
}

export interface TemporalScales {
	[key: string]: TemporalScaleConfig;
}

export interface TemporalThresholds {
	[key: string]: TemporalScales;
}

export interface TemporalThresholdConfig {
	thresholds: TemporalThresholds;
	decimals?: number;
}

export interface CustomColourSchemeColour {
	label: string;
	colour: string;
	quantity: number;
}

export interface CustomColourSchemeEntry {
	colours: CustomColourSchemeColour[],
	type: string;
	categorical?: boolean;
}

export interface CustomColourSchemes {
	[schemeKey: string]: CustomColourSchemeEntry;
}

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface GridCoordinates {
	[key: number]: Coordinates;
}

export interface GridRegion {
	bounds: L.LatLngBoundsExpression;
	cellCount: number
}

export interface ClimateVariableConfigInterface {
	/** Unique identifier for the climate variable */
	id: string;

	/** WordPress Post ID, used for backend operations (optional) */
	postId?: number;

	/** Title of the climate variable from the API */
	title?: string | MultilingualField;

	/** Default class defining the type or category of the climate variable */
	class: string;

	/** Alternative classes to use depending on the dataset type */
	classes?: variableClassMap;

	/** The type of dataset the climate variable belongs to */
	datasetType?: string;

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

	/** Compare scenarios flag */
	scenarioCompare?: boolean;

	/** Scenario to compare against `scenario` */
	scenarioCompareTo?: string | null;

	/** Selected scenarios for analysis */
	analyzeScenarios?: string[];

	/** Layer styles */
	layerStyles?: string;

	/** Unit */
	unit?: string;

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

	/** Currently selected data value */
	dataValue?: string | null;

	/** Custom color scheme used for visualizing the variable */
	colourScheme?: string;

	/** Flag indicating whether color options are enabled */
	enableColourOptions?: boolean;

	/** Custom colour schemes */
	customColourSchemes?: CustomColourSchemes;

	/** The type of colour map selected (e.g. continuous, discrete) */
	colourType?: string;

	/** Defines data ranges and units for different temporal scales (e.g. ys, ms, etc) */
	temporalThresholdConfig?: TemporalThresholdConfig;

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

	/** Available missing data options used for analysis */
	missingDataOptions?: string[];

	/** Stores the selected missing data */
	missingData?: string;

	/** Available model options for analysis */
	modelOptions?: string[];

	/** Stores the selected models for analysis */
	model?: string;

	/** The type of formats available */
	fileFormatTypes?: FileFormatType[];

	/** The file format to use for download */
	fileFormat?: FileFormatType;

	/** The maximum number of decimals to be used for the file */
	maxDecimals?: number;

	/** The number of decimal places to be used for the file */
	decimalPlace?: number;

	/** Determines if the variable data must be analyzed or is already precalculated. */
	downloadType?: DownloadType;

	hasMultipleDownloadUrls?: boolean;

	downloadUrls?: string[];

	downloadUrl?: string;

	analysisUrl?: string;

	selectedPoints?: GridCoordinates;

	selectedRegion?: GridRegion | null;
}

/**
 * Interface representing functionality for handling climate variables and their configurations.
 */
export interface ClimateVariableInterface {
	getId(): string;

	/** Returns the post ID for the variable, if available. */
	getPostId(): number | undefined;

	getTitle(): string | null;

	getDatasetType(): string | null;

	getVersions(): string[];

	getVersion(): string | null;

	getThresholds(): ThresholdInterface[];

	getThreshold(): string | null;

	getScenariosConfig(): ScenariosConfig | null;

	getScenarios(): string[];

	getScenario(): string | null;

	getScenarioCompare(): boolean;

	getScenarioCompareTo(): string | null;

	getAnalyzeScenarios(): string[];

	getLayerStyles(): string;

	getUnit(): string;

	getInteractiveRegionConfig(): InteractiveRegionConfig | null;

	getInteractiveRegion(): InteractiveRegionOption | null;

	getGridType(): string | null;

	getFrequencyConfig(): FrequencyConfig | null;

	getFrequency(): string | null;

	hasDelta(): boolean | undefined;

	getDataValue(): string | null;

	getCustomColourSchemes(): CustomColourSchemes | null;

	getColourScheme(): string | null;

	getColourOptionsStatus(): boolean;

	getColourType(): string | null;

	getTemporalThresholdConfig(): TemporalThresholdConfig | null;

	getAnalysisFields(): FieldConfig[];

	getAnalysisFieldValues(): FieldValues;

	getAnalysisFieldValue(key: string): string | null;

	getDateRangeConfig(): DateRangeConfig | null;

	getDateRange(): string[] | null;

	getAveragingOptions(): AveragingType[];

	getAveragingType(): AveragingType | null;

	getPercentileOptions(): string[];

	getPercentiles(): string[];

	getMissingDataOptions(): string[];

	getMissingData(): string | null;

	getModelOptions(): string[];

	getModel(): string | null;

	getFileFormatTypes(): FileFormatType[];

	getFileFormat(): FileFormatType | null;

	getMaxDecimals(): number;

	getDecimalPlace(): number;

	renderMap(): React.ReactElement;

	renderDownloadMap(): React.ReactElement;

	getDownloadType(): DownloadType | null;

	hasMultipleDownloadUrls(): boolean;

	getDownloadUrls(): string[];

	getDownloadUrl(): Promise<string | null>;

	getAnalysisUrl(): string | null;

	getSelectedPoints(): GridCoordinates | null;

	getSelectedPointsCount(): number;

	getSelectedRegion(): GridRegion | null;

	toObject(): ClimateVariableConfigInterface;

	getLocationModalContent(latlng: L.LatLng, featureId: number, mode?: string): React.ReactNode | null;
}
