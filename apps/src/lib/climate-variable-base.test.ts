import { describe, expect, test } from 'vitest';
import ClimateVariableBase from '@/lib/climate-variable-base';
import type { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';

/**
 * Scenario lists mirroring the production config (apps/src/config/climate-variables.config.ts):
 *
 * - `raster`   — a typical raster variable (e.g. wet_days). cmip5 offers a
 *   bare `rcp45`; cmip6 offers a bare `ssp245`.
 * - `seaLevel` — sea level, whose scenarios encode a percentile. cmip5 has NO
 *   bare `rcp45` (only `rcp45-p50` and siblings); cmip6 has a bare `ssp245`.
 *
 * @see {@link ClimateVariableBase.getDefaultScenario}
 */
const SCENARIO_FIXTURES = {
	raster: {
		cmip5: ['rcp26', 'rcp45', 'rcp85'],
		cmip6: ['ssp126', 'ssp245', 'ssp370', 'ssp585'],
	},
	seaLevel: {
		cmip5: [
			'rcp85plus65-p50',
			'rcp85-p05',
			'rcp85-p50',
			'rcp85-p95',
			'rcp45-p05',
			'rcp45-p50',
			'rcp45-p95',
			'rcp26-p05',
			'rcp26-p50',
			'rcp26-p95',
		],
		cmip6: [
			'ssp585highEnd-p98',
			'ssp585lowConf-p83',
			'ssp585',
			'ssp370',
			'ssp245',
			'ssp126',
		],
	},
} satisfies Record<string, ClimateVariableConfigInterface['scenarios']>;

/**
 * Build a base climate variable for a given scenarios config and selected version.
 */
const createClimateVariable = (
	config: Partial<ClimateVariableConfigInterface>,
): ClimateVariableBase => {
	return new ClimateVariableBase({
		id: 'test',
		class: 'ClimateVariableBase',
		...config,
	});
};

describe('getDefaultScenario', () => {
	describe('CLIM-1096 preference cascade', () => {
		test('raster cmip5 returns the bare rcp45', () => {
			const climateVariable = createClimateVariable({
				scenarios: SCENARIO_FIXTURES.raster,
				version: 'cmip5',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('rcp45');
		});

		test('raster cmip6 returns the bare ssp245', () => {
			const climateVariable = createClimateVariable({
				scenarios: SCENARIO_FIXTURES.raster,
				version: 'cmip6',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('ssp245');
		});

		test('sea level cmip5 falls back to the rcp45-p50 median percentile', () => {
			const climateVariable = createClimateVariable({
				scenarios: SCENARIO_FIXTURES.seaLevel,
				version: 'cmip5',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('rcp45-p50');
		});

		test('sea level cmip6 returns the bare ssp245', () => {
			const climateVariable = createClimateVariable({
				scenarios: SCENARIO_FIXTURES.seaLevel,
				version: 'cmip6',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('ssp245');
		});
	});

	describe('graceful fallbacks', () => {
		test('returns null when the variable exposes no scenarios', () => {
			const climateVariable = createClimateVariable({
				version: 'cmip5',
			});
			expect(climateVariable.getDefaultScenario()).toBeNull();
		});

		test('falls back to the first scenario for a version with no preference', () => {
			const climateVariable = createClimateVariable({
				scenarios: {
					unknownVersion: ['first', 'second'],
				},
				version: 'unknownVersion',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('first');
		});

		test('falls back to the first scenario when neither rcp45 nor rcp45-p50 is offered', () => {
			const climateVariable = createClimateVariable({
				scenarios: {
					cmip5: ['rcp26', 'rcp85'],
				},
				version: 'cmip5',
			});
			expect(climateVariable.getDefaultScenario()).toEqual('rcp26');
		});
	});
});

describe('getScenario', () => {
	test('an explicit, valid scenario is returned unchanged (selection wins)', () => {
		const climateVariable = createClimateVariable({
			scenarios: SCENARIO_FIXTURES.raster,
			version: 'cmip6',
			scenario: 'ssp585',
		});
		expect(climateVariable.getScenario()).toEqual('ssp585');
	});

	test('an explicit scenario not valid for the version falls back to the default', () => {
		const climateVariable = createClimateVariable({
			scenarios: SCENARIO_FIXTURES.raster,
			version: 'cmip6',
			// rcp45 belongs to cmip5, not the current cmip6 version.
			scenario: 'rcp45',
		});
		expect(climateVariable.getScenario()).toEqual('ssp245');
	});

	test('with no explicit scenario, returns the CLIM-1096 default', () => {
		const climateVariable = createClimateVariable({
			scenarios: SCENARIO_FIXTURES.seaLevel,
			version: 'cmip5',
		});
		expect(climateVariable.getScenario()).toEqual('rcp45-p50');
	});

	test('returns null when the variable exposes no scenarios', () => {
		const climateVariable = createClimateVariable({
			version: 'cmip5',
		});
		expect(climateVariable.getScenario()).toBeNull();
	});
});

describe('getValidScenarioForVersion', () => {
	test('applies the same preference cascade as getDefaultScenario', () => {
		const climateVariable = createClimateVariable({
			scenarios: SCENARIO_FIXTURES.seaLevel,
			version: 'cmip6',
		});
		// Eager version-change reset to cmip5 must agree with the lazy read.
		expect(climateVariable.getValidScenarioForVersion('cmip5')).toEqual('rcp45-p50');
		expect(climateVariable.getValidScenarioForVersion('cmip6')).toEqual('ssp245');
	});

	test('returns null for a version with no scenarios', () => {
		const climateVariable = createClimateVariable({
			scenarios: SCENARIO_FIXTURES.raster,
			version: 'cmip5',
		});
		expect(climateVariable.getValidScenarioForVersion('cmip6_missing')).toBeNull();
	});
});
