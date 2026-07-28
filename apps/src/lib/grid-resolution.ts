/**
 * Grid Resolution.
 *
 * WORK IN PROGRESS -- This is a starting point to adjust and improve what we already have and use what was written in the session folder.
 *
 * Grid resolution is **declared, not computed**.
 * The scientists define the grid for each data source; the app displays what they declared.
 *
 * This supersedes FI4's framing, which argues resolution must be derived per-variable and
 * per-latitude. `grid-resolution.ts` (590 lines, in the session folder) was an attempt at
 * derivation — it is not too heavy for the job, it solves a problem that turned out not
 * to be the problem.
 *
 * **Where we are at**
 *
 * `climateVariable?.getGridType()` is unreliable, and the reason is specific:
 * - `climate-variable-base.ts:301` returns `this._config.gridType ?? null`. That `null` is
 *   meaningful — "this variable's config declares no grid type."
 * - Four call sites destroy it with `?? 'canadagrid'`: `interactive-regions-layer.tsx:57`,
 *   `selectable-cells-grid-layer.tsx:29`, `selectable-rectangle-grid-layer.tsx:41` and `:65`.
 *   Each invents a declaration the model never made, and downstream cannot tell it from a real
 *   one — which is why callers re-derive with `getInteractiveRegion()` and class-name tests.
 * - Three subclasses already declare properly: `s2d-climate-variable.ts:98`,
 *   `sea-level-climate-variable.tsx:7`, `raster-precalculated-climate-variable.tsx:117`.
 *   The last one is the pattern to copy — it defaults **inside the class**, where the knowledge
 *   lives, commented "Prioritize getting value from config."
 *
 * Station identification: prefer `StationVariableIds` (`types/climate-variable-interface.ts:139`)
 * or the `STATION_VARIABLE_CLASSES` set (`lib/download/determine-applicable-steps.ts:14`) over the
 * `/^Station/` regex currently in `lib/grid-types.ts:108`. Two registries already exist — one by
 * id, one by class. Adding a third mechanism is a Same-Intent-Same-Pattern divergence.
 */

import {
	InteractiveRegionOption,
	type ClimateVariableInterface,
} from '@/types/climate-variable-interface';

/**
 * Grid identities
 *
 * What we typically use to identify the grid type of a climate variable.
 * These are the values that {@see ClimateVariableInterface.getGridType}
 * would return, and what {@see ClimateVariableConfigInterface.gridType}
 * would be set to.
 */
export const GridTypes = {
	CANADAGRID: 'canadagrid',
	CANADAGRID_M6: 'canadagrid-m6',
	CANADAGRID_1DEG: 'canadagrid1deg', // spei_12, spei_3,
	ERA5LANDGRID: 'era5landgrid',
	SLRGRID: 'slrgrid',
	SLRGRID_CMIP6: 'slrgrid-cmip6',
	ALLOWANCEGRID: 'allowancegrid', // allowance
} as const;

export type GridType = (typeof GridTypes)[keyof typeof GridTypes];

/**
 * 10x6km : Standard for "Statistically Downscaled Global Climate Projections" and S2D Forecasts
 *
 * Value we communicate as a simplified value that we could think about when we think about
 * the distance of each map grid cells.
 */
const GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D =
	'~10x6km' as const;

/**
 * 11x7km : Marine Projections
 *
 * `climateVariableId`s:
 * - `sea_level` : Relative Sea-Level Changes
 * - `allowance` : Vertical Allowance
 */
const GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS = '~11x7km' as const;

/**
 * 11x7km : Days with Humidex above threshold variable
 */
const GRID_RESOLUTION_LABEL_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD =
	GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS;

const GRID_RESOLUTION_LABEL_SPEI = '~110x70km' as const;

export const GRID_RESOLUTIONS_VALUES = {
	/**
	 * 0.08333333333333333 === 1/12. About page CanDCS-U6/U5/NRCANmet "~6x10km".
	 */
	[GridTypes.CANADAGRID]: 0.08333333333333333,
	/**
	 * 0.08333333333333333 === 1/12. About page CanDCS-M6 "~6×10 km"; same lattice.
	 */
	[GridTypes.CANADAGRID_M6]: 0.08333333333333333,
	/**
	 * 1. About page CMIP5 SPEI "a 1 degree (~100km) resolution".
	 */
	[GridTypes.CANADAGRID_1DEG]: 1,
	/**
	 * 0.1. About page Humidex/ERA5-Land "0.1° (approximately 9 km)".
	 */
	[GridTypes.ERA5LANDGRID]: 0.1,
	/**
	 * 0.1. About page Relative Sea Level Change (FR) "0,1°". Coastal-only.
	 */
	[GridTypes.SLRGRID]: 0.1,
	/**
	 * 0.1. Same dataset/lattice as SLRGRID (CMIP6 variant). Coastal-only.
	 */
	[GridTypes.SLRGRID_CMIP6]: 0.1,
} as const;

/**
 * @see {@link GRID_RESOLUTIONS_VALUES} for the text values of each grid type.
 */
export const GRID_RESOLUTIONS_LABELS = {
	[GridTypes.CANADAGRID]:
		GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_M6]:
		GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_1DEG]: GRID_RESOLUTION_LABEL_SPEI,
	[GridTypes.ERA5LANDGRID]:
		GRID_RESOLUTION_LABEL_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD,
	[GridTypes.SLRGRID]: GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
	[GridTypes.SLRGRID_CMIP6]: GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
	// NET-NEW: absent from gridResolutions (its ?? 0.0833 fallback mis-sizes this as 1/12°).
	// About page "Vertical Allowance … 0.1° (approx. 11 km lat, 4-8 km lon)" + WFS measure. Coastal-only.
	[GridTypes.ALLOWANCEGRID]: GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
} as const satisfies Record<GridType, string>;

export const isClimateVariable = (
	climateVariable: ClimateVariableInterface | null,
): climateVariable is ClimateVariableInterface =>
	typeof climateVariable === 'object' &&
	typeof climateVariable?.getId() === 'string';

export const isStationClimateVariable = (
	climateVariable: ClimateVariableInterface | null,
): boolean =>
	isClimateVariable(climateVariable) &&
	climateVariable.getInteractiveMode() === 'station' &&
	/^Station/.test(climateVariable.getClass());

export const getGridTypeLabel = (gridType?: GridType | null): string => {
	console.log('getGridTypeLabel 2', { gridType });
	if (gridType === undefined || gridType === null) {
		return '';
	} else if (!Object.prototype.hasOwnProperty.call(GRID_RESOLUTIONS_LABELS, gridType)) {
		return '';
	}
	return GRID_RESOLUTIONS_LABELS[gridType];
};

export const getGridTypeFor = (climateVariable: ClimateVariableInterface | null): GridType | null => {
	let outcome: GridType | null = null;
	const gridType = climateVariable?.getGridType() as GridType;
	const climateVariableId = climateVariable?.getId() ?? null;
	const climateVariableClass = climateVariable?.getClass() ?? null;
	const interactiveMode = climateVariable?.getInteractiveMode() ?? null;
	const interactiveRegion = climateVariable?.getInteractiveRegion() ?? null;

	if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
		outcome = gridType;
	} else if (isStationClimateVariable(climateVariable)) {
		// Station data is not gridded, so we return null.
		outcome = null;
	}

	console.log('getGridTypeFor', {
		outcome,
		gridType,
		climateVariableId,
		climateVariableClass,
		interactiveMode,
		interactiveRegion,
	});

	return outcome;
};
