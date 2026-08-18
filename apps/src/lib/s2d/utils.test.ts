import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest';
import {
	buildSkillLayerName,
	buildSkillLayerTime,
} from '@/lib/s2d';
import {
	FrequencyType,
} from '@/types/climate-variable-interface';
import { utc } from '@/lib/utils';
import S2DClimateVariable from '@/lib/s2d-climate-variable';


describe('buildSkillLayerName', () => {
	let climateVariable: S2DClimateVariable;
	let releaseDate: Date;

	beforeEach(() => {
		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
		releaseDate = utc('2025-08-05') as Date;
	});

	describe.each([
		[FrequencyType.SEASONAL, 'seasonal'],
		[FrequencyType.MONTHLY, 'monthly'],
	])('with frequency %s', (frequency, frequencyName) => {

		beforeEach(() => {
			climateVariable.getFrequency = () => frequency;
		});

		test('starts with "CDC:s2d-skill-"', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[0]).toEqual('CDC:s2d');
			expect(layerParts[1]).toEqual('skill');
		});

		test.each([
			['s2d_air_temp', 'air_temp'],
			['s2d_precip_accum', 'precip_accum'],
			// As a fail-safe, return the id as is for other variables
			['other_s2d_var', 'other_s2d_var'],
		])('layer value contains variable (%s)', (variableId, expectedName) => {
			climateVariable.getId = () => variableId;
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[2]).toEqual(expectedName);
		});

		test('layer has the correct frequency', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[3]).toEqual(frequencyName);
		});

		test.each([
			['2024-03-01', '03'],
			['2025-01-12', '01'],
			['2020-12-31', '12'],
		])('layer has the correct reference period', (date, expectedRefPeriod) => {
			releaseDate = utc(date) as Date;
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts[4]).toEqual(expectedRefPeriod);
		});

		test('has the correct number of parts', () => {
			const layer = buildSkillLayerName(climateVariable, releaseDate) as string;
			const layerParts = layer.split('-');
			expect(layerParts).toHaveLength(5);
		});
	});

	test('returns null if an unsupported frequency is selected', () => {
		climateVariable.getFrequency = () => FrequencyType.ANNUAL;
		const layer = buildSkillLayerName(climateVariable, releaseDate);
		expect(layer).toBeNull();
	});
});

describe('buildSkillLayerTime', () => {
	let climateVariable: S2DClimateVariable;
	let releaseDate: Date;

	beforeEach(() => {
		climateVariable = new S2DClimateVariable({
			id: 'test',
			class: 'S2DClimateVariable',
		});
		releaseDate = utc('2025-04-05') as Date;
	});

	test.each([
		['2025-08-01', '1991-08-01'],
		['2025-12-01', '1991-12-01'],
		['2026-01-01', '1992-01-01'], // Next year, so 1992
		['2028-04-01', '1994-04-01'], // 3 year later, so 1994
	])('year always based on 1991, relative to release date (%s)', (rangeStart, expectedDate) => {
		climateVariable.getDateRange = () => [rangeStart, rangeStart];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual(`${expectedDate}T00:00:00Z`);
	});

	test('date based on the beginning of the selected date range', () => {
		climateVariable.getDateRange = () => ['2025-08-01', '2025-11-31'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual('1991-08-01T00:00:00Z');
	});

	test('date is the first day of the month', () => {
		climateVariable.getDateRange = () => ['2025-05-14', '2025-06-23'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toEqual('1991-05-01T00:00:00Z');
	});

	test('returns null if invalid date range', () => {
		climateVariable.getDateRange = () => ['invalid', '2025-06-23'];
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toBeNull();
	});

	test('returns null if no date range', () => {
		climateVariable.getDateRange = () => null;
		const timeValue = buildSkillLayerTime(climateVariable, releaseDate);
		expect(timeValue).toBeNull();
	});
});
