import { describe, expect, test } from 'vitest';
import { generateColourScale, getColour } from './colour-scheme';
import { ColourMap, ColourSchemeType } from '@/types/types';

function createColourMap(colours: string[], quantities?: number[], type: ColourSchemeType = ColourSchemeType.SEQUENTIAL): ColourMap {
	return {
		type,
		colours,
		quantities,
		isDivergent: type === ColourSchemeType.DIVERGENT,
	} as ColourMap;
}

describe('generateColourMap', () => {
	test('returns empty array if steps is 0', () => {
		const result = generateColourScale(0, ['#f1030a', '#a0b0fc', '#909f90']);
		expect(result).toEqual([]);
	});

	test('returns empty array if steps is negative', () => {
		const result = generateColourScale(-1, ['#f1030a', '#a0b0fc', '#909f90']);
		expect(result).toEqual([]);
	});

	test('returns the first color if steps is 1', () => {
		const result = generateColourScale(1, ['#f1030a', '#a0b0fc', '#909f90']);
		expect(result).toEqual(['#f1030a']);
	});

	test('returns the first and last color if steps is two', () => {
		const result = generateColourScale(2, ['#f1030a', '#00f', '#123', '#909f90']);
		expect(result).toEqual(['#f1030a', '#909f90']);
	});

	test('returns interpolated values if steps is smaller', () => {
		const result = generateColourScale(4, ['#f1030a', '#00f', '#123', '#909f90', '#acefd3', '#919a9f']);
		expect(result).toEqual(['#f1030a', '#0b1777', '#99baa6', '#919a9f']);
	});

	test('returns interpolated values if steps is bigger', () => {
		const result = generateColourScale(4, ['#f1030a', '#909f90', '#ae4fd2']);
		expect(result).toEqual(['#f1030a', '#b06b63', '#9a84a6', '#ae4fd2']);
	});

	test('returns the same colours if steps equals the number of colors', () => {
		const result = generateColourScale(5, ['#f1030a', '#0000ff', '#122334', '#abcdef', '#909f90']);
		expect(result).toEqual(['#f1030a', '#0000ff', '#122334', '#abcdef', '#909f90']);
	});
});

describe('getColour', () => {
	test('returns the first color if value lower (discrete)', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [0, 1, 2]);
		const result = getColour(-1.8, colourMap, true);
		expect(result).toEqual('#f1030a');
	});

	test('returns the first color if value lower (continuous)', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [0, 1, 2]);
		const result = getColour(-1.8, colourMap, false);
		expect(result).toEqual('#f1030a');
	});

	test('returns the first color if value equals min', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [0, 1, 2]);
		const result = getColour(0, colourMap, false);
		expect(result).toEqual('#f1030a');
	});

	test('returns last color if value higher (discrete)', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [-5, -4.1, -1.6]);
		const result = getColour(3, colourMap, true);
		expect(result).toEqual('#909f90');
	});

	test('returns last color if value higher (continuous)', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [-5, -4.1, -1.6]);
		const result = getColour(3, colourMap, false);
		expect(result).toEqual('#909f90');
	});

	test('returns last color if value equals max', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90'], [-5, -4.1, -1.6]);
		const result = getColour(1.6, colourMap, true);
		expect(result).toEqual('#909f90');
	});

	test('returns nearest above if the mode is discrete', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90', '#c1080a'], [-4, -3, 1.2, 4]);
		const result = getColour(-0.1, colourMap, true);
		expect(result).toEqual('#909f90');
	});

	test('returns interpolated if the mode is continuous', () => {
		const colourMap = createColourMap(['#f1030a', '#a0b0fc', '#909f90', '#c1080a'], [-4, -3, 1.2, 4]);
		const result = getColour(-0.1, colourMap, false);
		expect(result).toEqual('#95a4b1');
	});
});
