/**
 * @file Map URL Serialization — Shared Scenario Fixtures
 *
 * Slim, named scenario factories for the Map query serializer, mirroring the
 * Download fixtures. Each factory builds one `MapUrlScenario`: the builder input
 * (or `null` for the no-variable guard case) plus the exact query string BOTH
 * call sites must emit.
 *
 * The drift guard: `buildMapUrlParams` is the one serializer, called from two
 * places that must never disagree —
 * - the writer in `use-url-sync.ts` (builds fresh, the reference pattern), and
 * - the `selectMapUrlSearch` selector (guards on a missing variable, then builds).
 *
 * `makeMapRootState` maps a scenario onto the minimal Redux state slices the
 * selector reads (`climateVariable.data`, `map.dataset`, `map.opacity`,
 * `map.opacityPicked`, `map.mapCoordinates`, `map.isLowSkillVisible`), so one
 * scenario drives both the direct-builder assertion and the selector parity
 * assertion.
 *
 * @see {@link ./build-map-url-params.ts} — the serializer under test
 * @see {@link ../../features/url-sync/url-sync-slice.ts} — selectMapUrlSearch
 */

import type { RootState } from '@/app/store';
import type { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';
import type { TaxonomyData } from '@/types/types';
import type { MapUrlParamsInput } from './build-map-url-params';

/**
 * One named Map serialization scenario.
 *
 * `input` is the pure builder input, or `null` for the selector-guard case where
 * no climate variable is set and the builder is never called. `expected` is the
 * exact query string (no leading `?`) both call sites must produce.
 */
export interface MapUrlScenario {
	readonly label: string;
	readonly input: MapUrlParamsInput | null;
	readonly expected: string;
}

/**
 * A minimal, config-independent climate variable. Its `id` is the only field the
 * serializer emits here: with no threshold/scenario/date-range/simple-config
 * values set, `buildMapUrlParams` writes exactly `var=<id>` regardless of whether
 * the id matches a default config, keeping the expected string deterministic.
 */
const MAP_FIXTURE_VARIABLE: ClimateVariableConfigInterface = {
	id: 'tx_max',
	class: 'temperature',
};

const MAP_FIXTURE_DATASET: TaxonomyData = {
	term_id: 30,
	title: { en: 'Fixture dataset' },
};

/**
 * No climate variable set — the selector short-circuits to the empty string
 * before the builder is ever called.
 *
 * @returns Scenario with a `null` input expecting the empty query string.
 */
export const mapScenarioNoVariable = (): MapUrlScenario => ({
	label: 'no climate variable (selector guard)',
	input: null,
	expected: '',
});

/**
 * A representative populated Map state — variable, dataset, both opacities
 * picked, coordinates, and a masked low-skill layer. Exercises every Map-only
 * param and pins the deterministic key order the writer produces.
 *
 * @returns Scenario expecting the full serialized Map query.
 */
export const mapScenarioFullState = (): MapUrlScenario => ({
	label: 'variable, dataset, opacity, coordinates, low-skill masked',
	input: {
		climateVariable: MAP_FIXTURE_VARIABLE,
		dataset: MAP_FIXTURE_DATASET,
		opacity: { mapData: 0.5, labels: 0.8 },
		opacityPicked: { mapData: true, labels: true },
		mapCoordinates: { lat: 45.5, lng: -73.6, zoom: 7 },
		isLowSkillVisible: false,
	},
	expected:
		'var=tx_max&dataset=30&dataOpacity=50&labelOpacity=80' +
		'&lat=45.50000&lng=-73.60000&zoom=7&maskLowSkill=0',
});

/**
 * Only the data opacity was picked: the label opacity, though set, stays out
 * of the query.
 *
 * @returns Scenario expecting `dataOpacity` and no `labelOpacity`.
 */
export const mapScenarioDataOpacityPicked = (): MapUrlScenario => ({
	label: 'data opacity picked, label opacity not picked',
	input: {
		climateVariable: MAP_FIXTURE_VARIABLE,
		dataset: MAP_FIXTURE_DATASET,
		opacity: { mapData: 0.99, labels: 1 },
		opacityPicked: { mapData: true, labels: false },
		mapCoordinates: { lat: 45.5, lng: -73.6, zoom: 7 },
		isLowSkillVisible: true,
	},
	expected:
		'var=tx_max&dataset=30&dataOpacity=99' +
		'&lat=45.50000&lng=-73.60000&zoom=7',
});

/**
 * Only the label opacity was picked: the data opacity, though set, stays out
 * of the query.
 *
 * @returns Scenario expecting `labelOpacity` and no `dataOpacity`.
 */
export const mapScenarioLabelOpacityPicked = (): MapUrlScenario => ({
	label: 'label opacity picked, data opacity not picked',
	input: {
		climateVariable: MAP_FIXTURE_VARIABLE,
		dataset: MAP_FIXTURE_DATASET,
		opacity: { mapData: 1, labels: 0.99 },
		opacityPicked: { mapData: false, labels: true },
		mapCoordinates: { lat: 45.5, lng: -73.6, zoom: 7 },
		isLowSkillVisible: true,
	},
	expected:
		'var=tx_max&dataset=30&labelOpacity=99' +
		'&lat=45.50000&lng=-73.60000&zoom=7',
});

/**
 * An S2D variable whose time period control filled the first period, with no
 * pick: the date range stays out of the query.
 *
 * @returns Scenario expecting no `dateRange`.
 */
export const mapScenarioS2DDateRangeNotPicked = (): MapUrlScenario => ({
	label: 'S2D date range not picked',
	input: {
		climateVariable: {
			id: 's2d_precip_accum',
			class: 'S2DClimateVariable',
			dateRange: ['2026-11-01', '2027-01-31'],
		},
		dataset: MAP_FIXTURE_DATASET,
		opacity: { mapData: 1, labels: 1 },
		opacityPicked: { mapData: false, labels: false },
		mapCoordinates: { lat: 45.5, lng: -73.6, zoom: 7 },
		isLowSkillVisible: true,
	},
	expected:
		'var=s2d_precip_accum&dataset=30' +
		'&lat=45.50000&lng=-73.60000&zoom=7',
});

/**
 * An S2D variable whose time period the person picked: the date range enters
 * the query.
 *
 * @returns Scenario expecting `dateRange`.
 */
export const mapScenarioS2DDateRangePicked = (): MapUrlScenario => ({
	label: 'S2D date range picked',
	input: {
		climateVariable: {
			id: 's2d_precip_accum',
			class: 'S2DClimateVariable',
			dateRange: ['2026-12-01', '2027-02-28'],
			dateRangePicked: true,
		},
		dataset: MAP_FIXTURE_DATASET,
		opacity: { mapData: 1, labels: 1 },
		opacityPicked: { mapData: false, labels: false },
		mapCoordinates: { lat: 45.5, lng: -73.6, zoom: 7 },
		isLowSkillVisible: true,
	},
	expected:
		'var=s2d_precip_accum&dateRange=2026-12-01%2C2027-02-28&dataset=30' +
		'&lat=45.50000&lng=-73.60000&zoom=7',
});

/**
 * Every Map scenario, in table order. Fed straight into `test.each`.
 *
 * @returns The selector-guard, full-state, single-opacity-pick and S2D date
 * range scenarios.
 */
export const mapUrlScenarios = (): readonly MapUrlScenario[] => [
	mapScenarioNoVariable(),
	mapScenarioFullState(),
	mapScenarioDataOpacityPicked(),
	mapScenarioLabelOpacityPicked(),
	mapScenarioS2DDateRangeNotPicked(),
	mapScenarioS2DDateRangePicked(),
];

/**
 * Build the minimal `RootState` the `selectMapUrlSearch` selector reads for a
 * scenario. Only the six fields the selector consumes are populated; the object
 * is cast once for the same reason as the Download fixture — a full store would
 * test the reducers, not the serializer parity. When `input` is `null` the map
 * slice carries selector-safe defaults that the variable guard never reaches.
 *
 * @param scenario - The scenario whose `input` drives the mock slices.
 * @returns A `RootState` carrying only `climateVariable` and `map`.
 */
export const makeMapRootState = (
	scenario: MapUrlScenario,
): RootState => {
	const { input } = scenario;

	return {
		climateVariable: {
			data: input?.climateVariable ?? null,
		},
		map: {
			dataset: input?.dataset ?? null,
			opacity: input?.opacity ?? null,
			opacityPicked: input?.opacityPicked ?? null,
			mapCoordinates: input?.mapCoordinates ?? null,
			isLowSkillVisible: input?.isLowSkillVisible ?? true,
		},
	} as unknown as RootState;
};
