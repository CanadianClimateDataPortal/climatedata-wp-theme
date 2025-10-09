import React from 'react';
import { MapDisplayType, MultilingualField, WMSParams } from '@/types/types';

export interface variableClassMap {
	[key: string]: string;
}

export interface ScenariosConfig {
	[key: string]: string[];
}

export type LegendConfigSet = {
	[K in MapDisplayType]?: LegendConfig;
};

export type LegendConfig = {
	// If specified, overwrites the number of decimals for numerical values.
	decimals?: number;
	// If true, "padding" will be added to the top of the legend, pushing the top label down. The "padding" space
	// will have the same colour as the top label. Generally the inverse of `hideTopLabel`.
	addTopPadding?: boolean;
	// If true, the top label will be hidden. Generally used when the top value is a quantity used in the GeoServer
	// style that we don't want to show in the legend. Generally the inverse of `addTopPadding`.
	hideTopLabel?: boolean;
	// If true, the bottom label will be hidden. Generally used when the bottom value is a quantity used in the
	// GeoServer style that we don't want to show in the legend.
	hideBottomLabel?: boolean;
	// If true, values will be converted from Kelvin to Celsius before being used as labels.
	valuesInKelvin?: boolean;
	// Overwrite the label values. Must be the same size as the number of default labels.
	labels?: string[];
	// If true, labels will be pushed down to be aligned with the middle of the colour block instead of being shown
	// at the top of their corresponding block. Note that it's used in both discrete and continuous mode.
	centerLabels?: boolean;
};

export interface ThresholdInterface {
	value: string;
	label: string;
}

export type InteractiveMode = 'region' | 'station';

export enum InteractiveRegionOption {
	GRIDDED_DATA = "gridded_data",
	CENSUS = "census",
	HEALTH = "health",
	WATERSHED = "watershed",
}

export enum InteractiveRegionDisplay {
	MAP = "map",
	DOWNLOAD = "download",
	ALWAYS = "always",
	NONE = "none",
}

export type InteractiveRegionConfig = {
	[K in InteractiveRegionOption]?: InteractiveRegionDisplay;
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

export enum ForecastType {
	EXPECTED = "expected",
	UNUSUAL = "unusual",
}

export enum ForecastDisplay {
	FORECAST = "forecast",
	CLIMATOLOGY = "climatology",
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
	format?: string;
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
	type?: "year" | "day";
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
	GeoJSON = "geojson",
}

export enum ColourType {
	CONTINUOUS = "ramp",
	DISCRETE = "intervals",
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
	name?: string;
}

export interface GridCoordinates {
	[key: string]: Coordinates;
}

export interface GridRegion {
	bounds: L.LatLngBoundsExpression;
	cellCount: number
}

export interface StationDownloadUrlsProps {
	stationId?: string;
	stationIds?: string[];
	stationName?: string;
	fileFormat?: FileFormatType | null;
	dateRange?: {start: string, end: string}
	filename?: { [key: string]: string };
	locale?: string;
}

export interface DownloadFile {
	label: string;
	url: string;
	fileName?: string;
	linkAttributes?: { [key: string]: string | undefined | null };
}

export interface LocationModalContentParams {
	latlng: L.LatLng,
	featureId: number,
	scenario?: string,
	mode?: "modal" | "panel"
}

export enum FrequencyType {
	YS = "ys",
	MS = "ms",
	QSDEC = "qsdec",
}

export type PreCalculatedCanDCSConfig = {
	[key: string]: FrequencyType[],
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

	/** Unit decimal places */
	unitDecimalPlaces?: number;

	/** Unit legend */
	unitLegend?: string;

	/** Legend display configuration */
	legendConfigs?: LegendConfigSet;

	/** InteractiveMode */
	interactiveMode?: InteractiveMode;

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

	/** Currently selected data value (ex: delta, absolute) */
	dataValue?: string | null;

	/** Custom color scheme used for visualizing the variable */
	colourScheme?: string;

	/** Flag indicating whether color options are enabled */
	enableColourOptions?: boolean;

	/** Custom colour schemes */
	customColourSchemes?: CustomColourSchemes;

	/** The type of colour map selected (e.g. continuous, discrete) */
	colourType?: string;

	/** An array of FieldConfigs used in the Download section */
	analysisFields?: FieldConfig[];

	/** Holds submitted values for analysisFields */
	analysisFieldValues?: FieldValues;

	/** Configuration defining the date range to be used in the Download section */
	dateRangeConfig?: DateRangeConfig;

	/** Configuration defining the date range to be used specifically for downloads */
	downloadDateRangeConfig?: DateRangeConfig;

	/** Stores the selected date range */
	dateRange?: string[] | null;

	/** Stores the default date range */
	defaultDateRange?: string[] | null;

	/**
	 * Indicates if a "time period" for this variable is a range of years
	 * (true) or a single year (false).
	 */
	isTimePeriodARange?: boolean;

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

	finch?: string;

	ahccdDownloadRequiredVariables?: string[];

	selectedPoints?: GridCoordinates;

	selectedRegion?: GridRegion | null;

	/** For AHCCD stations, if this variable should be shown for stations with
	 * "precipitation" ('P') or "temperature" ('T') data. */
	stationTypeFilter?: string[];

	/**
	 * Configuration if the variable is available as a pre-calculated CanDCS variable.
	 *
	 * It's a dictionary where the key is the pre-calculated variable ids, and the
	 * value is an array of the frequencies available (valid values are "ys", "ms" and "qsdec").
	 */
	preCalculatedCanDCSConfig?: PreCalculatedCanDCSConfig;

	/**
	 * For S2D variables, the selected forecast type.
	 */
	forecastType?: ForecastType;

	/**
	 * For S2D variables, the selected forecast display.
	 */
	forecastDisplay?: ForecastDisplay;
}

/**
 * Interface representing functionality for handling climate variables and their configurations.
 */
export interface ClimateVariableInterface {
	getId(): string;

	getClass(): string;

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

	getValidScenarioForVersion(version: string): string | null;

	getScenarioCompare(): boolean;

	getScenarioCompareTo(): string | null;

	getAnalyzeScenarios(): string[];

	getLayerStyles(): string;

	getUnit(): string;

	getUnitDecimalPlaces(): number;

	getUnitLegend(): string;

	getLegendConfigs(): LegendConfigSet;

	getLegendConfig(type: MapDisplayType): LegendConfig | null;

	getInteractiveMode(): InteractiveMode;

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

	getAnalysisFields(): FieldConfig[];

	getAnalysisFieldValues(): FieldValues;

	getAnalysisFieldValue(key: string): string | null;

	getDateRangeConfig(): DateRangeConfig | null;

	getDownloadDateRangeConfig(): DateRangeConfig | null;

	getDateRange(): string[] | null;

	getDefaultDateRange(): string[] | null;

	isTimePeriodARange(): boolean;

	getAveragingOptions(): AveragingType[];

	getAveragingType(): AveragingType | null;

	getPercentileOptions(): string[];

	getPercentiles(): string[];

	getMissingDataOptions(): string[];

	getMissingData(): string | null;

	getModelOptions(): string[];

	getModel(): string | null;

	getFileFormatTypes(): FileFormatType[];

	getLayerValue(scenario: string | null | undefined, section?: string): string;

	getFileFormat(): FileFormatType | null;

	getMaxDecimals(): number;

	getDecimalPlace(): number;

	renderMap(): React.ReactElement;

	renderDownloadMap(): React.ReactElement;

	getDownloadType(): DownloadType | null;

	hasMultipleDownloadUrls(): boolean;

	getDownloadUrls(): string[];

	getDownloadUrl(): Promise<string | null>;

	getStationDownloadFiles(props?: StationDownloadUrlsProps): Promise<DownloadFile[]>;

	getAnalysisUrl(): string | null;

	getFinch(): string;

	getFinchDataset(): string | null;

	getAhccdDownloadRequiredVariables(): string[];

	getSelectedPoints(): GridCoordinates | null;

	getSelectedPointsCount(): number;

	getSelectedRegion(): GridRegion | null;

	toObject(): ClimateVariableConfigInterface;

	getLocationModalContent({latlng, featureId, mode}: LocationModalContentParams): React.ReactNode | null;

	getStationTypeFilter(): string[];

	updateMapWMSParams(params: WMSParams, isComparisonMap: boolean): WMSParams;

	getForecastType(): ForecastType | null;

	getForecastDisplay(): ForecastDisplay | null;
}
