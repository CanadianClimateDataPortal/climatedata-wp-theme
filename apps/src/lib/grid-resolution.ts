/**
 * Grid Resolution.
 *
 * Grid resolution is **declared, not computed**. The scientists define the grid for each
 * data source; this module only maps a declared grid identity to the label they wrote for
 * it. Nothing here derives a cell size from a variable, a latitude or a bounding box.
 *
 * **The meaningful null**
 *
 * `ClimateVariableBase.getGridType()` returns `this._config.gridType ?? null`, and that
 * `null` carries information: "this variable's config declares no grid type." It is not a
 * missing value to paper over. Four map layers currently do paper over it, each inventing
 * a declaration the model never made:
 * - `interactive-regions-layer.tsx` and `selectable-rectangle-grid-layer.tsx` (twice),
 *   with `?? 'canadagrid'`,
 * - `selectable-cells-grid-layer.tsx`, with `?? GridTypes.CANADAGRID`.
 *
 * Those four build GeoServer tile URLs and are out of scope for this module. When they are
 * fixed, the pattern to copy is `RasterPrecalculatedClimateVariable.getGridType()`: it
 * defaults **inside the class**, where the knowledge lives — config first, then a
 * version-based fallback. `S2dClimateVariable` and `SeaLevelClimateVariable` already
 * declare properly too.
 *
 * This module never applies such a fallback. A grid type that is undeclared, or declared
 * but carrying no label here, resolves to `null` and the caller displays nothing.
 *
 * **Station identification**
 *
 * Station data is measured at points, so there is no grid resolution to state for it.
 * Membership is decided by id against the {@link StationVariableIds} registry — see
 * `isStationClimateVariable` below. That registry is the single declared authority for the
 * question; also testing the class name or the interactive mode would be a second
 * mechanism answering it, invisible to a future refactor of the first.
 */

import {
	StationVariableIds,
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
 *
 * Humidex uses era5landgrid, whose resolution is similar to the marine-projections grid.
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

/**
 * Grid identities this module knows, as a membership set.
 *
 * @remarks
 * Kept private, and derived from {@link GridTypes} so that object stays the single
 * declaration. Ask through {@link isGridType} rather than reading the set.
 */
const GRID_TYPE_VALUES = new Set<string>(Object.values(GridTypes));

/**
 * Climate-variable ids that identify station data.
 *
 * @remarks
 * Kept private, and derived from {@link StationVariableIds} so that registry stays the
 * single declaration. Ask through {@link isStationClimateVariable}.
 */
const STATION_VARIABLE_IDS = new Set<string>(Object.values(StationVariableIds));

/**
 * Whether a value is a grid identity this module carries a resolution label for.
 *
 * @remarks
 * `ClimateVariableInterface.getGridType()` is typed `string | null`, so its result must be
 * narrowed rather than cast: a grid name the labels table has no entry for is as
 * unusable as no name at all, and casting would hide that.
 */
export const isGridType = (
	value: unknown,
): value is GridType =>
	typeof value === 'string' && GRID_TYPE_VALUES.has(value);

export const isClimateVariable = (
	climateVariable: ClimateVariableInterface | null,
): climateVariable is ClimateVariableInterface =>
	typeof climateVariable === 'object' &&
	typeof climateVariable?.getId() === 'string';

export const isStationClimateVariable = (
	climateVariable: ClimateVariableInterface | null,
): boolean =>
	isClimateVariable(climateVariable) &&
	STATION_VARIABLE_IDS.has(climateVariable.getId());

export const getGridTypeLabel = (gridType?: GridType | null): string => {
	if (gridType === undefined || gridType === null) {
		return '';
	} else if (
		!Object.prototype.hasOwnProperty.call(GRID_RESOLUTIONS_LABELS, gridType)
	) {
		return '';
	}
	return GRID_RESOLUTIONS_LABELS[gridType];
};

/**
 * The grid identity to display for a climate variable, or `null` when there is none to
 * show.
 *
 * @remarks
 * Two unrelated situations yield `null`, and neither is an error:
 * - the variable is station data, which is measured at points and has no grid;
 * - the variable declares no grid type, or one this module carries no label for.
 *
 * Display is otherwise not conditioned on how the map is being browsed. The sizes are
 * declared per data source, so a variable shown by region still has the grid its data was
 * produced on, and still states it.
 */
export const getGridTypeFor = (
	climateVariable: ClimateVariableInterface | null,
): GridType | null => {
	if (isStationClimateVariable(climateVariable)) {
		return null;
	}

	const declaredGridType = climateVariable?.getGridType() ?? null;

	return isGridType(declaredGridType) ? declaredGridType : null;
};
