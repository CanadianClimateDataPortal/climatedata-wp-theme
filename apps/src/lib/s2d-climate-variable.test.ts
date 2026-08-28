import { describe, expect, test, beforeEach } from 'vitest';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import {
	ForecastDisplays,
	ForecastTypes,
	S2DFrequencyTypes,
} from '@/types/climate-variable-interface';
import { WMSParams } from '@/types/types';
import L from 'leaflet';

/**
 * Filter out the "version" and "TIME" attributes from a WMSParams object.
 *
 * Those specific attributes are removed since they are the ones that change.
 */
const filterVersionAndTime = (
	params: WMSParams
): Omit<WMSParams, 'version' | 'TIME'> => {
	const {
		version: _omit1, // eslint-disable-line @typescript-eslint/no-unused-vars
		TIME: _omit2, // eslint-disable-line @typescript-eslint/no-unused-vars
		...filteredParams
	} = params;
	return filteredParams;
};

describe('getLayerValue', () => {
	let climateVariable: S2DClimateVariable;

	beforeEach(() => {
		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
	});

	/**
	 * We run tests for all combinations of forecast type, frequency and display.
	 */
	describe.each([
		[ForecastTypes.EXPECTED, 'expected'],
		[ForecastTypes.UNUSUAL, 'unusual'],
	])('with frequency "%s"', (forecast, forecastName) => {
		describe.each([
			[S2DFrequencyTypes.SEASONAL, 'seasonal'],
			[S2DFrequencyTypes.MONTHLY, 'monthly'],
		])('with frequency "%s"', (frequency, frequencyName) => {
			describe.each([
				[ForecastDisplays.CLIMATOLOGY, 'climatology'],
				[ForecastDisplays.FORECAST, 'forecast'],
			])('with forecast display "%s"', (display, displayName) => {
				beforeEach(() => {
					climateVariable.getFrequency = () => frequency;
					climateVariable.getForecastDisplay = () => display;
					climateVariable.getForecastType = () => forecast;
				});

				test('layer starts with the correct prefix', () => {
					const layer = climateVariable.getLayerValue();
					const layerParts = layer.split('-');
					expect(layerParts[0]).toEqual('CDC:s2d');
				});

				test('layer has the correct forecast display', () => {
					const layer = climateVariable.getLayerValue();
					const layerParts = layer.split('-');
					expect(layerParts[1]).toEqual(displayName);
				});

				test.each([
					['s2d_air_temp', 'air_temp'],
					['s2d_precip_accum', 'precip_accum'],
					// As a fail-safe, return the id as is for other variables
					['other_s2d_var', 'other_s2d_var'],
				])(
					'layer value contains variable (%s)',
					(variableId, expectedName) => {
						climateVariable.getId = () => variableId;
						const layer = climateVariable.getLayerValue();
						const layerParts = layer.split('-');
						expect(layerParts[2]).toEqual(expectedName);
					}
				);

				test('layer has the correct frequency', () => {
					const layer = climateVariable.getLayerValue(); // e.g. "CDC:s2d-forecast-test-seasonal-expected"
					const layerParts = layer.split('-'); // e.g. `['CDC:s2d', 'forecast', 'test', 'seasonal', 'expected']`
					expect(layerParts[3]).toEqual(frequencyName);
				});

				test.runIf(display === ForecastDisplays.FORECAST)(
					'(for forecast) has the correct forecast type',
					() => {
						const layer = climateVariable.getLayerValue();
						const layerParts = layer.split('-');
						expect(layerParts[4]).toEqual(forecastName);
					}
				);

				test('has correct the number of parts', () => {
					const nbExpectedParts =
						display === ForecastDisplays.FORECAST ? 5 : 4;
					const layer = climateVariable.getLayerValue();
					const layerParts = layer.split('-');
					expect(layerParts).toHaveLength(nbExpectedParts);
				});
			});
		});
	});

	/**
	 * We have to test decadal frequencies separately because their slugs contain hyphens.
	 *
	 * For example, the frequency `S2DFrequencyTypes.DECADAL_ANNUAL` contains the string
	 * "decadal-ann", and the test suite above that assumes a single-word frequency
	 * like "seasonal" (taken from "CDC:s2d-forecast-test-seasonal-expected").
	 */
	describe.each([
		[S2DFrequencyTypes.DECADAL_ANNUAL],
		[S2DFrequencyTypes.DECADAL_MAY_SEP],
		[S2DFrequencyTypes.DECADAL_NOV_MAR],
	])('with decadal frequency "%s"', (frequency) => {
		beforeEach(() => {
			climateVariable.getFrequency = () => frequency;
			climateVariable.getForecastType = () => ForecastTypes.EXPECTED;
		});

		test('builds the forecast layer name', () => {
			climateVariable.getForecastDisplay = () => ForecastDisplays.FORECAST;
			expect(climateVariable.getLayerValue()).toEqual(
				`CDC:s2d-forecast-test-${frequency}-expected`
			);
		});

		test('builds the climatology layer name', () => {
			climateVariable.getForecastDisplay = () =>
				ForecastDisplays.CLIMATOLOGY;
			expect(climateVariable.getLayerValue()).toEqual(
				`CDC:s2d-climatology-test-${frequency}`
			);
		});
	});

	describe('with a frequency missing from the name map', () => {
		/**
		 * Pin the silent error paths as deliberate contracts.
		 * This ensures what the code is currently assuming is explicit.
		 *
		 * The fallback "seasonal" (instead of "not-a-frequency") is deliberate.
		 * An unknown frequency must still yield a well-formed layer name,
		 * because `getLayerValue` silently substitutes with "seasonal" frequency name
		 * as a fallback rather than an undefined value or something else.
		 */
		test('falls back to the seasonal name', () => {
			climateVariable.getFrequency = () => 'not-a-frequency';
			climateVariable.getForecastType = () => ForecastTypes.EXPECTED;
			climateVariable.getForecastDisplay = () => ForecastDisplays.FORECAST;
			expect(climateVariable.getLayerValue()).toEqual(
				'CDC:s2d-forecast-test-seasonal-expected'
			);
		});
	});
});

describe('updateMapWMSParams', () => {
	let climateVariable: S2DClimateVariable;
	let baseParams: WMSParams;

	beforeEach(() => {
		baseParams = {
			bounds: new L.LatLngBounds([0, 0], [1, 1]),
			opacity: 0,
			pane: '',
			styles: undefined,
			tiled: false,
			format: 'image/png',
			transparent: true,
			layers: 'same',
			version: '0',
		};

		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
	});

	test('sets the version to 1.3.0', () => {
		const params = climateVariable.updateMapWMSParams(baseParams, false);
		expect(params.version).toEqual('1.3.0');
	});

	test('for forecast, uses date range to set the correct time', () => {
		climateVariable.getForecastDisplay = () => ForecastDisplays.FORECAST;
		climateVariable.getDateRange = () => ['2020-04-01', '2020-07-01'];
		const params = climateVariable.updateMapWMSParams(baseParams, false);
		expect(params.TIME).toEqual('2020-04-01T00:00:00Z');
	});

	test('for climatology, uses date range to set the correct time', () => {
		climateVariable.getForecastDisplay = () => ForecastDisplays.CLIMATOLOGY;
		climateVariable.getDateRange = () => ['2024-02-01', '2024-02-28'];
		const params = climateVariable.updateMapWMSParams(baseParams, false);
		// For climatology, the year is always fixed to 1991
		expect(params.TIME).toEqual('1991-02-01T00:00:00Z');
	});

	test("doesn't change the other parameters", () => {
		const originalParams = filterVersionAndTime(baseParams);
		const params = climateVariable.updateMapWMSParams(baseParams, false);
		const newParams = filterVersionAndTime(params);
		expect(newParams).toEqual(originalParams);
	});

	test('return a new params object', () => {
		const params = climateVariable.updateMapWMSParams(baseParams, false);
		expect(params).not.toBe(baseParams);
	});
});
