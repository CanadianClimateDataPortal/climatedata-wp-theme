import {
	ClimateVariableInterface,
	FileFormatType,
	FrequencyConfig,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import {
	getDefaultFrequency,
	getFrequencyName,
	getInteractiveRegionName,
} from '@/lib/utils.ts';
import { FinchRequestInput } from '@/types/download-form-interface';
import { HighChartSeries } from '@/types/types';

declare global {
	interface Window {
		dataLayer: unknown[];
	}
}

/**
 * Get the "pre-calculated" name of a variable for Google Analytics tracking.
 *
 * @param climateVariable - The climate variable to get the name for.
 */
export function getPrecalculatedVariableName(
	climateVariable: ClimateVariableInterface
): string | null {
	const threshold = climateVariable.getThreshold() ?? '';
	const variableId = climateVariable.getId();

	const nameMapForSimpleVariables: { [key: string]: string } = {
		all_candcs_variables: 'All',
		hottest_day: 'Hottest-Day',
		mean_temp: 'Mean-Temperature',
		minimum_temperature: 'Minimum-Temperature',
		maximum_temperature: 'Maximum-Temperature',
		coldest_day: 'Coldest-Day',
		max_1d_total_precipitation: 'Maximum-1-Day-Total-Precipitation',
		total_precipitation: 'Total-Precipitation',
		frost_days: 'Frost-Days',
		cooling_degree_days: 'Cooling-Degree-Days',
		cumulative_degree_days_above_0: 'Cumulative-degree-days-above-0C',
		growing_degree_days_5: 'Growing-Degree-Days-5C',
		heating_degree_days: 'Heating-degree-days',
		ice_days: 'Ice-Days',
		spei_3: 'SPEI(3-months)',
		spei_12: 'SPEI(12-months)',
		sea_level: 'Sea-Level_Change',
		msc_climate_normals: 'MSC-Climate-Normals',
		station_data: 'Station-Data',
	};

	if (nameMapForSimpleVariables[variableId]) {
		return nameMapForSimpleVariables[variableId];
	}

	switch (variableId) {
		case 'days_below_tmin':
			if (threshold.startsWith('tnlt_')) {
				const thresholdValue = threshold.split('_')[1];
				return `Days-with-Tmin_LesserThan_${thresholdValue}C`;
			}
			break;

		case 'days_above_tmax':
			if (threshold.startsWith('txgt_')) {
				const thresholdValue = threshold.split('_')[1];
				return `Days-with-Tmax_GreaterThan_${thresholdValue}C`;
			}
			break;

		case 'wet_days':
			if (threshold.startsWith('r')) {
				const thresholdValue = threshold.substring(1);
				return `Wet-Days_GreaterThan_${thresholdValue}`;
			}
			break;

		case 'tropical_nights_days_with_tmin_above_threshold':
			if (threshold.startsWith('tr_')) {
				const thresholdValue = threshold.split('_')[1];
				return `Tropical-Nights-Days-with-Tmin_GreaterThan_${thresholdValue}C`;
			}
			break;

		default:
			return null;
	}

	return null;
}

/**
 * Get the "analyze" name of a variable for Google Analytics tracking.
 *
 * @param climateVariable - The climate variable to get the name for.
 */
export function getAnalyzeVariableName(
	climateVariable: ClimateVariableInterface
): string | null {
	const nameMap: { [key: string]: string } = {
		days_humidex_above_threshold: 'HXMax-Days-Above-a-Threshold',
		wet_days: 'Wet-Days',
		average_wet_day_precipitation_intensity:
			'Average-Wet-Day-Precipitation-Intensity',
		maximum_consecutive_wet_days: 'Maximum-Consecutive-Wet-Days',
		maximum_consecutive_dry_days: 'Maximum-Consecutive-Dry-Days',
		days_above_tmax_and_tmin: 'Days-above-Tmax-and-Tmin',
		days_above_tmax: 'Days-above-Tmax',
		tropical_nights_days_with_tmin_above_threshold: 'Days-above-Tmin',
		days_below_tmin: 'Days-below-Tmin',
		cooling_degree_days: 'Degree-Days-Above-a-Threshold',
		heating_degree_days: 'Degree-Days-Below-a-Threshold',
		heat_wave_index: 'Heat-Wave',
		heat_wave_total_duration: 'Heat-Wave-Total-Duration',
		heat_wave_frequency: 'Heat-Wave-Frequency',
		freeze_thaw_cycles: 'Days-with-a-Freeze-Thaw-Cycle',
		cold_spell_days: 'Cold-Spell-Days',
	};

	return nameMap[climateVariable.getId()] ?? null;
}

export function trackEvent(eventObject: { [key: string]: string | null | undefined }) {
	if (window.dataLayer) {
		window.dataLayer.push(eventObject);
	}
}

/**
 * Track a Google Analytics event for an export from the graph panel in the Map.
 *
 * @param format - The format of the export (e.g., "csv", "pdf", "png", "print").
 * @param locationName - The name of the location that is shown in the graph.
 * @param chartSeries - Series shown in the Highcharts graph.
 * @param climateVariable - The variable shown in the graph.
 */
export function trackGraphExport(
	format: string,
	locationName: string,
	chartSeries: HighChartSeries[],
	climateVariable: ClimateVariableInterface
) {
	const eventVariableName = getPrecalculatedVariableName(climateVariable);
	let eventName = '';

	if (!eventVariableName) {
		return;
	}

	const version = climateVariable.getVersion();

	switch (format) {
		case 'csv':
			eventName = 'Variable_Download-Data_';
			break;
		case 'pdf':
		case 'png':
		case 'print':
			eventName = 'Variable_Download-Image_';
			break;
		default:
			return;
	}

	eventName += eventVariableName;

	const scenario = climateVariable.getScenario() ?? '';
	const frequencyConfig =
		climateVariable?.getFrequencyConfig() ?? ({} as FrequencyConfig);
	const frequency =
		climateVariable?.getFrequency() ??
		getDefaultFrequency(frequencyConfig, 'map');
	const frequencyName = getFrequencyName(frequency ?? '');
	const chartDataSettings = `${locationName}; ${scenario}; ${frequencyName}`;

	const chartDataColumns: string[] = [];

	chartSeries.forEach((series) => {
		if (series.visible && series.type != 'areaspline') {
			chartDataColumns.push(series.name);
		}
	});
	const chartDataViewBy = getInteractiveRegionName(
		climateVariable.getInteractiveRegion() ??
			InteractiveRegionOption.GRIDDED_DATA
	);

	trackEvent({
		event: eventName,
		chart_data_event_type: eventName,
		chart_data_settings: chartDataSettings,
		chart_data_columns: chartDataColumns.join(', '),
		chart_data_dataset: version,
		chart_data_format: format,
		chart_data_view_by: chartDataViewBy,
	});
}

/**
 * Track a Google Analytics event for an "analyze" variable download.
 *
 * @param climateVariable - The variable that has been downloaded.
 * @param inputs - The "inputs" attributes sent in the Finch request.
 */
export function trackFinchDownload(
	climateVariable: ClimateVariableInterface,
	inputs: FinchRequestInput[]
) {
	const inputToNameMap: { [key: string]: string } = {
		lat: 'latitude',
		lon: 'longitude',
		shape: 'shape',
		average: 'average',
		start_date: 'start date',
		end_date: 'end date',
		ensemble_percentiles: 'ensemble percentiles',
		dataset: 'dataset name',
		models: 'models',
		freq: 'frequence',
		scenario: 'scenario',
		data_validation: 'data validation',
		output_format: 'output format',
		window: 'window',
		thresh: 'thresh',
		thresh_tasmin: 'threshold tasmin',
		thresh_tasmax: 'threshold tasmax',
	};

	const variableName = getAnalyzeVariableName(climateVariable);

	if (!variableName) {
		return;
	}

	const eventName = `Analyze_BCCAQv2_${variableName}`;
	const parameters: string[] = [];
	inputs.forEach((input) => {
		if (inputToNameMap[input.id]) {
			parameters.push(`${inputToNameMap[input.id]}: ${input.data};`);
		}
	});

	trackEvent({
		event: eventName,
		analyze_bccaqv2_event_type: eventName,
		analyze_bccaqv2_parameters: parameters.join('  '),
	});
}

/**
 * Track a Google Analytics event for a "precalculated" variable download.
 *
 * @param climateVariable - The variable that has been downloaded.
 */
export function trackPrecalculatedDownload(
	climateVariable: ClimateVariableInterface
) {
	const variableName = getPrecalculatedVariableName(climateVariable);

	if (!variableName) {
		return;
	}

	const eventName = `Download_Variable-Data_BCCAQv2_${variableName}_Frequency_Location_Format`;
	let dataLocation = '';
	const selectedPoints = climateVariable.getSelectedPoints?.();
	const selectedRegion = climateVariable.getSelectedRegion?.();
	const fileFormat = climateVariable.getFileFormat?.();
	const version = climateVariable.getVersion();

	// For individual grid-cell selection
	if (selectedPoints) {
		const locationPoints = Object.entries(selectedPoints).map(
			([gridId, coordinates]) =>
				`GridID: ${gridId}, Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`
		);
		dataLocation = locationPoints.join(' ; ');
	}

	// For bounding-box selection
	if (selectedRegion && selectedRegion.bounds) {
		const bounds = selectedRegion.bounds as [
			[number, number],
			[number, number],
		];
		dataLocation = `BBox: ${bounds[0][0]},${bounds[0][1]},${bounds[1][0]},${bounds[1][1]}`;
	}

	trackEvent({
		event: eventName,
		variable_data_event_type: eventName,
		variable_data_location: dataLocation,
		variable_data_format: fileFormat ?? '',
		variable_data_dataset: version ?? '',
	});
}

/**
 * Track a Google Analytics event for a "station" variable download.
 *
 * @param climateVariable - The variable that has been downloaded.
 *   Only "Station data" and "MSC climate normals" variables are supported.
 */
export function trackStationDataDownload(
	climateVariable: ClimateVariableInterface
) {
	const supportedVariableIds = ['station_data', 'msc_climate_normals'];
	if (!supportedVariableIds.includes(climateVariable.getId())) {
		return;
	}

	const fileFormatNameMap: Partial<Record<FileFormatType, string>> = {
		[FileFormatType.GeoJSON]: 'GeoJSON',
		[FileFormatType.CSV]: 'CSV',
	};

	const variableName = getPrecalculatedVariableName(climateVariable);
	const eventName = `Download_${variableName}`;
	const stations = climateVariable.getSelectedPoints() ?? [];
	const rawFileFormat = climateVariable.getFileFormat();
	let fileFormat = rawFileFormat ?? '';
	if (rawFileFormat && fileFormatNameMap[rawFileFormat]) {
		fileFormat = fileFormatNameMap[rawFileFormat];
	}

	const downloadStations = Object.entries(stations).map(
		([stationId, stationData]) => {
			let stationDescription = stationId;
			if (stationData.name) {
				stationDescription += ` -- ${stationData.name}`;
			}
			return stationDescription;
		}
	);

	trackEvent({
		event: eventName,
		download_station_data_event: eventName,
		download_station_data_list: downloadStations.join(' ; '),
		download_station_file_extension: fileFormat,
	});
}

/**
 * Track a Google Analytics event for an "IDF station" data download.
 *
 * @param fileTitle - The name of the file that is being downloaded.
 * @param filePath - The path of the file that is being downloaded. Only the
 *   last part of the path is used for the event name.
 */
export function trackIDFDownload(fileTitle: string, filePath: string) {
	const formatedFileTitle = fileTitle
		.replace(/[()]/g, '')
		.replaceAll(' ', '_');
	const eventName = `Download_IDF-Curves_${formatedFileTitle}`;
	const fileNameParts = filePath.split('/');

	trackEvent({
		event: eventName,
		'download-idf-curves-file':
			fileNameParts.length > 0
				? fileNameParts[fileNameParts.length - 1]
				: filePath,
	});
}
