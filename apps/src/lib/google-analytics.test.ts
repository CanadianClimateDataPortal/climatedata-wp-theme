import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import ClimateVariableBase from '@/lib/climate-variable-base';
import {
	getAnalyzeVariableName,
	getPrecalculatedVariableName,
	trackFinchDownload,
	trackGraphExport,
	trackIDFDownload,
	trackPrecalculatedDownload,
	trackStationDataDownload,
} from '@/lib/google-analytics';
import {
	FileFormatType,
	GridCoordinates,
	GridRegion,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import { getInteractiveRegionName } from '@/lib/utils';
import { HighChartSeries } from '@/types/types';

describe('getPrecalculatedVariableName', () => {
	test.each([
		['hottest_day', 'Hottest-Day'],
		['mean_temp', 'Mean-Temperature'],
		['minimum_temperature', 'Minimum-Temperature'],
		['maximum_temperature', 'Maximum-Temperature'],
		['coldest_day', 'Coldest-Day'],
		['max_1d_total_precipitation', 'Maximum-1-Day-Total-Precipitation'],
		['total_precipitation', 'Total-Precipitation'],
		['frost_days', 'Frost-Days'],
		['cooling_degree_days', 'Cooling-Degree-Days'],
		['growing_degree_days_5', 'Growing-Degree-Days-5C'],
		['cumulative_degree_days_above_0', 'Cumulative-degree-days-above-0C'],
		['heating_degree_days', 'Heating-degree-days'],
		['ice_days', 'Ice-Days'],
		['spei_3', 'SPEI(3-months)'],
		['spei_12', 'SPEI(12-months)'],
		['msc_climate_normals', 'MSC-Climate-Normals'],
		['sea_level', 'Sea-Level_Change'],
		['all_candcs_variables', 'All'],
		['station_data', 'Station-Data'],
	])('correctly names %s', (variableId, expectedName) => {
		const climateVariable = new ClimateVariableBase({
			id: variableId,
			class: 'ClimateVariableBase',
		});
		const result = getPrecalculatedVariableName(climateVariable);
		expect(result).toEqual(expectedName);
	});

	test.each([
		['tnlt_-15', '-15C'],
		['tnlt_-25', '-25C'],
	])(
		'correctly names days_below_tmin (%s)',
		(threshold, expectedNamePart) => {
			const climateVariable = new ClimateVariableBase({
				id: 'days_below_tmin',
				class: 'ClimateVariableBase',
				threshold: threshold,
			});
			const result = getPrecalculatedVariableName(climateVariable);
			expect(result).toEqual(
				`Days-with-Tmin_LesserThan_${expectedNamePart}`
			);
		}
	);

	test.each([
		['txgt_25', '25C'],
		['txgt_27', '27C'],
		['txgt_29', '29C'],
		['txgt_30', '30C'],
		['txgt_32', '32C'],
	])(
		'correctly names days_above_tmax (%s)',
		(threshold, expectedNamePart) => {
			const climateVariable = new ClimateVariableBase({
				id: 'days_above_tmax',
				class: 'ClimateVariableBase',
				threshold: threshold,
			});
			const result = getPrecalculatedVariableName(climateVariable);
			expect(result).toEqual(
				`Days-with-Tmax_GreaterThan_${expectedNamePart}`
			);
		}
	);

	test.each([
		['r1mm', '1mm'],
		['r10mm', '10mm'],
		['r20mm', '20mm'],
	])('correctly names wet_days (%s)', (threshold, expectedNamePart) => {
		const climateVariable = new ClimateVariableBase({
			id: 'wet_days',
			class: 'ClimateVariableBase',
			threshold: threshold,
		});
		const result = getPrecalculatedVariableName(climateVariable);
		expect(result).toEqual(`Wet-Days_GreaterThan_${expectedNamePart}`);
	});

	test.each([
		['tr_18', '18C'],
		['tr_20', '20C'],
		['tr_22', '22C'],
	])(
		'correctly names tropical_nights_days_with_tmin_above_threshold (%s)',
		(threshold, expectedNamePart) => {
			const climateVariable = new ClimateVariableBase({
				id: 'tropical_nights_days_with_tmin_above_threshold',
				class: 'ClimateVariableBase',
				threshold: threshold,
			});
			const result = getPrecalculatedVariableName(climateVariable);
			expect(result).toEqual(
				`Tropical-Nights-Days-with-Tmin_GreaterThan_${expectedNamePart}`
			);
		}
	);

	test('returns null for an unsupported variable', () => {
		const climateVariable = new ClimateVariableBase({
			id: 'unsupported_variable',
			class: 'ClimateVariableBase',
		});
		const result = getPrecalculatedVariableName(climateVariable);
		expect(result).toBeNull();
	});
});

describe('trackGraphExport', () => {
	let climateVariable: ClimateVariableBase;
	const mockDataLayer: unknown[] = [];

	beforeEach(() => {
		climateVariable = new ClimateVariableBase({
			id: 'hottest_day',
			class: 'ClimateVariableBase',
		});
		mockDataLayer.length = 0;
		vi.stubGlobal('dataLayer', mockDataLayer);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test.each([
		['csv', 'Data'],
		['png', 'Image'],
		['pdf', 'Image'],
		['print', 'Image'],
	])(
		'sets the correct event name and format for "%s"',
		(format, expectedType) => {
			trackGraphExport(format, 'test', [], climateVariable);
			expect(mockDataLayer[0]).toEqual(
				expect.objectContaining({
					event: `Variable_Download-${expectedType}_Hottest-Day`,
					chart_data_event_type: `Variable_Download-${expectedType}_Hottest-Day`,
					chart_data_format: format,
				})
			);
		}
	);

	test('event name is empty for an unknown format', () => {
		trackGraphExport('unknown', 'test', [], climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: '',
			})
		);
	});

	test('event name is empty for an unknown variable', () => {
		climateVariable.getId = () => 'unknown';
		trackGraphExport('csv', 'test', [], climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: '',
			})
		);
	});

	test('chart_data_columns contains visible chart series', () => {
		const chartSeries = [
			{ name: 'Series 1', visible: false, type: 'line' }, // invisible
			{ name: 'Series 2', visible: true, type: 'column' },
			{ name: 'Series 3', visible: true, type: 'areaspline' }, // areaspline
			{ name: 'Series 4', visible: true, type: 'line' },
		] as HighChartSeries[];
		trackGraphExport('csv', 'test', chartSeries, climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				chart_data_columns: 'Series 2, Series 4',
			})
		);
	});

	test('chart_data_settings contains expected value', () => {
		climateVariable.getScenario = () => 'ssp370';
		climateVariable.getFrequency = () => 'ann';
		trackGraphExport('csv', 'Region name, QC', [], climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				chart_data_settings: 'Region name, QC; ssp370; Annual',
			})
		);
	});

	test('chart_data_dataset contains expected value', () => {
		climateVariable.getVersion = () => 'cmip5';
		trackGraphExport('csv', 'test', [], climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				chart_data_dataset: 'cmip5',
			})
		);
	});

	test('chart_data_view_by contains expected value', () => {
		climateVariable.getInteractiveRegion = () =>
			InteractiveRegionOption.CENSUS;
		trackGraphExport('csv', 'test', [], climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				chart_data_view_by: getInteractiveRegionName(
					InteractiveRegionOption.CENSUS
				),
			})
		);
	});
});

describe('getAnalyzeVariableName', () => {
	let climateVariable: ClimateVariableBase;

	beforeEach(() => {
		climateVariable = new ClimateVariableBase({
			id: 'hottest_day',
			class: 'ClimateVariableBase',
		});
	});

	test.each([
		['days_humidex_above_threshold', 'HXMax-Days-Above-a-Threshold'],
		['wet_days', 'Wet-Days'],
		[
			'average_wet_day_precipitation_intensity',
			'Average-Wet-Day-Precipitation-Intensity',
		],
		['maximum_consecutive_wet_days', 'Maximum-Consecutive-Wet-Days'],
		['maximum_consecutive_dry_days', 'Maximum-Consecutive-Dry-Days'],
		['days_above_tmax_and_tmin', 'Days-above-Tmax-and-Tmin'],
		['days_above_tmax', 'Days-above-Tmax'],
		['tropical_nights_days_with_tmin_above_threshold', 'Days-above-Tmin'],
		['days_below_tmin', 'Days-below-Tmin'],
		['cooling_degree_days', 'Degree-Days-Above-a-Threshold'],
		['heating_degree_days', 'Degree-Days-Below-a-Threshold'],
		['heat_wave_index', 'Heat-Wave'],
		['heat_wave_total_duration', 'Heat-Wave-Total-Duration'],
		['heat_wave_frequency', 'Heat-Wave-Frequency'],
		['freeze_thaw_cycles', 'Days-with-a-Freeze-Thaw-Cycle'],
		['cold_spell_days', 'Cold-Spell-Days'],
	])('event name is correct for %s', (variableId, expectedName) => {
		climateVariable.getId = () => variableId;
		const result = getAnalyzeVariableName(climateVariable);
		expect(result).toEqual(expectedName);
	});

	test('returns null for an unsupported variable', () => {
		climateVariable.getId = () => 'unknown';
		const result = getAnalyzeVariableName(climateVariable);
		expect(result).toBeNull();
	});
});

describe('trackFinchDownload', () => {
	let climateVariable: ClimateVariableBase;
	const mockDataLayer: unknown[] = [];

	beforeEach(() => {
		climateVariable = new ClimateVariableBase({
			id: 'days_above_tmax_and_tmin',
			class: 'ClimateVariableBase',
		});
		mockDataLayer.length = 0;
		vi.stubGlobal('dataLayer', mockDataLayer);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('sets the correct event name', () => {
		trackFinchDownload(climateVariable, []);
		const expectedEventName = 'Analyze_BCCAQv2_Days-above-Tmax-and-Tmin';
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: expectedEventName,
				analyze_bccaqv2_event_type: expectedEventName,
			})
		);
	});

	test.each([
		['lat', 'latitude'],
		['lon', 'longitude'],
		['shape', 'shape'],
		['average', 'average'],
		['start_date', 'start date'],
		['end_date', 'end date'],
		['ensemble_percentiles', 'ensemble percentiles'],
		['dataset', 'dataset name'],
		['models', 'models'],
		['freq', 'frequence'],
		['scenario', 'scenario'],
		['data_validation', 'data validation'],
		['output_format', 'output format'],
		['window', 'window'],
		['thresh', 'thresh'],
		['thresh_tasmin', 'threshold tasmin'],
		['thresh_tasmax', 'threshold tasmax'],
	])(
		'correctly renames input parameter "%s"',
		(parameterId, expectedName) => {
			trackFinchDownload(climateVariable, [
				{ id: parameterId, data: 'test-value' },
			]);
			expect(mockDataLayer[0]).toEqual(
				expect.objectContaining({
					analyze_bccaqv2_parameters: `${expectedName}: test-value;`,
				})
			);
		}
	);

	test('correctly includes multiple input parameters', () => {
		const inputParameters = [
			{ id: 'ensemble_percentiles', data: '10' },
			{ id: 'ensemble_percentiles', data: '50' },
			{ id: 'thresh_tasmax', data: '10degC' },
		];
		trackFinchDownload(climateVariable, inputParameters);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				analyze_bccaqv2_parameters:
					'ensemble percentiles: 10;  ensemble percentiles: 50;  threshold tasmax: 10degC;',
			})
		);
	});

	test('ignores unknown input parameters', () => {
		const inputParameters = [
			{ id: 'unknown', data: '10' },
			{ id: 'scenario', data: 'ssp370' },
			{ id: 'another-unknown', data: '10degC' },
		];
		trackFinchDownload(climateVariable, inputParameters);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				analyze_bccaqv2_parameters: 'scenario: ssp370;',
			})
		);
	});

	test('event name is empty for an unknown variable', () => {
		climateVariable.getId = () => 'unknown';
		trackFinchDownload(climateVariable, []);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: '',
			})
		);
	});
});

describe('trackPrecalculatedDownload', () => {
	let climateVariable: ClimateVariableBase;
	const mockDataLayer: unknown[] = [];

	beforeEach(() => {
		climateVariable = new ClimateVariableBase({
			id: 'mean_temp',
			class: 'ClimateVariableBase',
		});
		mockDataLayer.length = 0;
		vi.stubGlobal('dataLayer', mockDataLayer);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('sets the correct event name', () => {
		trackPrecalculatedDownload(climateVariable);
		const expectedEventName =
			'Download_Variable-Data_BCCAQv2_Mean-Temperature_Frequency_Location_Format';
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: expectedEventName,
				variable_data_event_type: expectedEventName,
			})
		);
	});

	test('sets the correct variable_data_location for gridded', () => {
		const gridCells = {
			aaa: { lat: 1, lng: 2 },
			567: { lat: 3.122343425, lng: -4.5 },
		} as GridCoordinates;
		climateVariable.getSelectedPoints = () => gridCells;
		trackPrecalculatedDownload(climateVariable);
		const expectedDataLocation =
			'GridID: 567, Lat: 3.122343425, Lng: -4.5 ; GridID: aaa, Lat: 1, Lng: 2';
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				variable_data_location: expectedDataLocation,
			})
		);
	});

	test('sets correct variable_data_location for bbox', () => {
		const gridRegion = {
			bounds: [
				[1, 2],
				[3.543534534, -5.5],
			],
			cellCount: 5,
		} as GridRegion;
		climateVariable.getSelectedRegion = () => gridRegion;
		trackPrecalculatedDownload(climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				variable_data_location: 'BBox: 1,2,3.543534534,-5.5',
			})
		);
	});

	test.each([FileFormatType.CSV, FileFormatType.JSON, FileFormatType.NetCDF])(
		'sets correct variable_data_format for %s',
		(format) => {
			climateVariable.getFileFormat = (): FileFormatType => format;
			trackPrecalculatedDownload(climateVariable);
			expect(mockDataLayer[0]).toEqual(
				expect.objectContaining({
					variable_data_format: format,
				})
			);
		}
	);

	test.each(['cmip5', 'cmip6'])(
		'sets correct variable_data_dataset for %s',
		(version) => {
			climateVariable.getVersion = () => version;
			trackPrecalculatedDownload(climateVariable);
			expect(mockDataLayer[0]).toEqual(
				expect.objectContaining({
					variable_data_dataset: version,
				})
			);
		}
	);

	test('event name is empty for an unknown variable', () => {
		climateVariable.getId = () => 'unknown';
		trackPrecalculatedDownload(climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: '',
			})
		);
	});
});

describe('trackStationDataDownload', () => {
	let climateVariable: ClimateVariableBase;
	const mockDataLayer: unknown[] = [];

	beforeEach(() => {
		climateVariable = new ClimateVariableBase({
			id: 'station_data',
			class: 'ClimateVariableBase',
		});
		mockDataLayer.length = 0;
		vi.stubGlobal('dataLayer', mockDataLayer);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test.each([
		['station_data', 'Station-Data'],
		['msc_climate_normals', 'MSC-Climate-Normals'],
	])('sets the correct event name', (variableId, expectedName) => {
		climateVariable.getId = () => variableId;
		trackStationDataDownload(climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: `Download_${expectedName}`,
				download_station_data_event: `Download_${expectedName}`,
			})
		);
	});

	test('correctly sets download_station_data_list', () => {
		climateVariable.getSelectedPoints = () => ({
			aaa: { lat: 1, lng: 2, name: 'Station A' },
			bbb: { lat: 3, lng: 4 }, // no name
			ccc: { lat: 3, lng: 4, name: 'Station C' },
		});
		trackStationDataDownload(climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				download_station_data_list:
					'aaa -- Station A ; bbb ; ccc -- Station C',
			})
		);
	});

	test.each([
		[FileFormatType.CSV, 'CSV'],
		[FileFormatType.GeoJSON, 'GeoJSON'],
	] as [FileFormatType, string][])(
		'correctly sets download_station_file_extension to %s',
		(format, expected) => {
			climateVariable.getFileFormat = () => format;
			trackStationDataDownload(climateVariable);
			expect(mockDataLayer[0]).toEqual(
				expect.objectContaining({
					download_station_file_extension: expected,
				})
			);
		}
	);

	test('event name is empty for an unsupported variable', () => {
		climateVariable.getId = () => 'mean_temp';
		trackStationDataDownload(climateVariable);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: '',
			})
		);
	});
});

describe('trackIDFDownload', () => {
	const mockDataLayer: unknown[] = [];

	beforeEach(() => {
		mockDataLayer.length = 0;
		vi.stubGlobal('dataLayer', mockDataLayer);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('sets the correct event name', () => {
		trackIDFDownload('Lorem Ipsùm (dolor sit) - AMET', 'test.zip');
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				event: 'Download_IDF-Curves_Lorem_Ipsùm_dolor_sit_-_AMET',
			})
		);
	});

	test('sets the correct file name', () => {
		const fileName =
			'NORMAN_WELLS_CLIMATE_2202810_65.28_126.75_cmip6-quickstart.zip';
		trackIDFDownload('test', fileName);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				'download-idf-curves-file': fileName,
			})
		);
	});

	test('uses only the last part if a URL', () => {
		const fileName = 'https://example.com/path/to/file.zip';
		trackIDFDownload('test', fileName);
		expect(mockDataLayer[0]).toEqual(
			expect.objectContaining({
				'download-idf-curves-file': 'file.zip',
			})
		);
	});
});
