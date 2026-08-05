/**
 * @file Grid Resolution
 *
 * How large one cell of the grid a map is drawn on happens to be.
 * Each resolution is declared per data source, so reading one takes no calculation
 * from a latitude or a bounding box.
 *
 * A default belongs inside the variable class that holds the knowledge to supply one:
 * `RasterPrecalculatedClimateVariable.getGridType()` prefers the config's declared
 * value and falls back on the dataset version only when the config stays silent.
 * That is the pattern to follow.
 *
 * Station data is measured at points and is shown without a grid.
 * Membership is decided by id against the {@link StationVariableIds} registry, the
 * authoritative source for it.
 */

import {
	StationVariableIds,
	type ClimateVariableInterface,
} from '@/types/climate-variable-interface';

/**
 * Grid identities.
 *
 * @see {@link ClimateVariableInterface.getGridType}
 * @see {@link ClimateVariableConfigInterface.gridType}
 */
export const GridTypes = {
	/**
	 * 1/12° lattice for Statistically Downscaled Global Climate Projections (CanDCS-U5/U6,
	 * CMIP5).
	 *
	 * The fallback `RasterPrecalculatedClimateVariable.getGridType()` resolves to when a variable's
	 * config declares no `gridType` and the dataset version is not CMIP6 — which is currently
	 * most raster-precalculated variables.
	 * Also the selection lattice for S2D dataset variables.
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D}.
	 */
	CANADAGRID: 'canadagrid',
	/**
	 * CMIP6 counterpart of `CANADAGRID` — same 1/12° lattice (CanDCS-M6), same fallback
	 * mechanism, selected when the dataset version is CMIP6.
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D}.
	 */
	CANADAGRID_M6: 'canadagrid-m6',
	/**
	 * Full-degree lattice for the Standardized Precipitation Evapotranspiration Index.
	 *
	 * `climateVariableId`s:
	 * - `?var=spei_3`
	 * - `?var=spei_12`
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_SPEI}.
	 */
	CANADAGRID_1DEG: 'canadagrid1deg',
	/**
	 * ERA5-Land reanalysis lattice.
	 *
	 * `climateVariableId`s:
	 * - `?var=days_humidex_above_threshold`
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD}.
	 */
	ERA5LANDGRID: 'era5landgrid',
	/**
	 * CMIP5 Relative Sea-Level Change lattice, coastal-only.
	 *
	 * `climateVariableId`s:
	 * - `?var=sea_level`.
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS}.
	 */
	SLRGRID: 'slrgrid',
	/**
	 * CMIP6 counterpart of `SLRGRID`
	 *
	 * Same lattice, same `?var=sea_level` variable, selected when the dataset version is CMIP6.
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS}.
	 */
	SLRGRID_CMIP6: 'slrgrid-cmip6',
	/**
	 * Vertical Allowance lattice, coastal-only and anisotropic.
	 *
	 * `climateVariableId`s:
	 * - `?var=allowance`.
	 *
	 * Resolution: {@link GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS}.
	 */
	ALLOWANCEGRID: 'allowancegrid',
} as const;

export type GridType = (typeof GridTypes)[keyof typeof GridTypes];

/**
 * 10×6km : Standard for "Statistically Downscaled Global Climate Projections" and S2D Forecasts
 *
 * Degree size: {@link GRID_RESOLUTION_VALUE_STATISTICALLY_DOWNSCALED_AND_S2D}.
 *
 * S2D shares this label because `S2DClimateVariable.getGridType()`
 * reports the same `canadagrid` lattice a forecast is selected on.
 */
const GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D =
	'~10×6km' as const;

/**
 * 11×7km : Marine Projections
 *
 * Source: (to confirm)
 *
 * `climateVariableId`s:
 * - `?var=sea_level` : Relative Sea-Level Changes
 * - `?var=allowance` : Vertical Allowance
 *
 * Degree size: {@link GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS}.
 *
 */
const GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS = '~11×7km' as const;

/**
 * 11×7km : Days with Humidex above threshold variable
 *
 * Source: (to confirm)
 *
 * Humidex uses era5landgrid, whose resolution is similar to the marine-projections grid.
 * The code re-uses {@link GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS}'s value on that basis.
 *
 * - Published as '0.1° (approximately 9 km)'
 *   ({@link https://climatedata.ca/about/our-data/#humidex | Humidex})
 *   — a single-axis figure that does not obviously match '11×7'.
 */
const GRID_RESOLUTION_LABEL_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD =
	GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS;

/**
 * 100×100km : Standardized Precipitation Evapotranspiration Index (SPEI), full-degree grid
 *
 * Degree size: {@link GRID_RESOLUTION_VALUE_SPEI}.
 *
 * - Published as '1° x 1° (100x100km)'
 *   {@link https://climatedata.ca/about-spei/#:~:text=climate%20model%20ensemble,and%2090th%20percentiles | About SPEI}
 */
const GRID_RESOLUTION_LABEL_SPEI = '~100×100km' as const;

/**
 * 10×6km : Statistically Downscaled Global Climate Projections and S2D Forecasts
 *
 * 1/12° === 0.08333333333333333.
 *
 * - Published as '~6x10km resolution'
 *   ({@link https://climatedata.ca/about/our-data/#candcs-u6 | CanDCS-U6}; CanDCS-U5 and CanDCS-M6).
 * - Published as '~6×10 km resolution over Canada'
 *   ({@link https://climatedata.ca/about/our-data/#nrcanmet | NRCANmet})
 */
export const GRID_RESOLUTION_VALUE_STATISTICALLY_DOWNSCALED_AND_S2D =
	0.08333333333333333 as const;

/**
 * 11×7km : Marine Projections
 *
 * `climateVariableId`s:
 * - `?var=sea_level` : Relative Sea-Level Changes.
 *   Published as '0,1° (environ 11 km de latitude, 2-8 km de longitude)'
 *   ({@link https://donneesclimatiques.ca/le-portail/nos-donnees/#sea_level | Changement relatif du niveau de la mer})
 *   — French only; the English page states no figure for this dataset.
 *
 * - `?var=allowance` : Vertical Allowance.
 *   Published as '0.1° (approximately 11 km latitude, 4-8 km longitude)'
 *   ({@link https://climatedata.ca/about/our-data/#vert_allowance | Vertical Allowance})
 *   — anisotropic, unlike every other entry in this table. WFS-measured.
 *
 * 0.1° for each of `slrgrid`, `slrgrid-cmip6`, and `allowancegrid`, all coastal-only.
 * {@link GRID_RESOLUTION_VALUE_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD} re-uses the same
 * number for a land grid, on similarity of resolution rather than shared provenance.
 */
const GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS = 0.1 as const;

/**
 * 11×7km : Days with Humidex above threshold variable
 *
 * 0.1°. Humidex uses era5landgrid, whose resolution is similar to the marine-projections grid.
 *
 * - Published as '0.1° (approximately 9 km)'
 *   ({@link https://climatedata.ca/about/our-data/#humidex | Humidex}).
 */
const GRID_RESOLUTION_VALUE_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD =
	GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS;

/**
 * 100×100km : Standardized Precipitation Evapotranspiration Index (SPEI), full-degree grid
 *
 * 1°.
 *
 * - Published as 'a 1 degree (~100km) resolution'
 *   ({@link https://climatedata.ca/about/our-data/#mip5-spei | CMIP5 SPEI})
 */
const GRID_RESOLUTION_VALUE_SPEI = 1 as const;

export const GRID_RESOLUTIONS_VALUES = {
	[GridTypes.CANADAGRID]:
		GRID_RESOLUTION_VALUE_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_M6]:
		GRID_RESOLUTION_VALUE_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_1DEG]:
		GRID_RESOLUTION_VALUE_SPEI,
	[GridTypes.ERA5LANDGRID]:
		GRID_RESOLUTION_VALUE_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD,
	[GridTypes.SLRGRID]:
		GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS,
	[GridTypes.SLRGRID_CMIP6]:
		GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS,
	[GridTypes.ALLOWANCEGRID]:
		GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS,
} as const satisfies Record<GridType, number>;

/**
 * @see {@link GRID_RESOLUTIONS_VALUES} for the numeric resolution behind each grid
 * type's label.
 */
export const GRID_RESOLUTIONS_LABELS = {
	[GridTypes.CANADAGRID]:
		GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_M6]:
		GRID_RESOLUTION_LABEL_STATISTICALLY_DOWNSCALED_AND_S2D,
	[GridTypes.CANADAGRID_1DEG]:
		GRID_RESOLUTION_LABEL_SPEI,
	[GridTypes.ERA5LANDGRID]:
		GRID_RESOLUTION_LABEL_DAYS_WITH_HUMIDEX_ABOVE_THRESHOLD,
	[GridTypes.SLRGRID]:
		GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
	[GridTypes.SLRGRID_CMIP6]:
		GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
	/**
	 * See {@link GRID_RESOLUTION_VALUE_MARINE_PROJECTIONS} — anisotropic, unlike every
	 * other entry here.
	 */
	[GridTypes.ALLOWANCEGRID]: GRID_RESOLUTION_LABEL_MARINE_PROJECTIONS,
} as const satisfies Record<GridType, string>;

/**
 * Grid identities this module knows, as a membership set.
 *
 * @remarks
 * Kept private, so that object stays the single declaration.
 * Ask through {@link isGridType} rather than reading the set.
 */
const GRID_TYPE_VALUES = new Set<string>(Object.values(GridTypes));

/**
 * Climate-variable ids that identify station data.
 *
 * @remarks
 * Kept private, so that registry stays the single declaration.
 * Ask through {@link isStationClimateVariable}.
 */
const STATION_VARIABLE_IDS = new Set<string>(Object.values(StationVariableIds));

/**
 * Whether a value is a grid identity this module carries a resolution label for.
 */
export const isGridType = (
	value: unknown,
): value is GridType =>
	typeof value === 'string' && GRID_TYPE_VALUES.has(value);

/**
 * Whether a value carries enough of the climate-variable shape to be asked for its id.
 *
 * Duck-typed on `getId()` alone, which is as much as the callers below need.
 * Anything else answering to that one method passes, so treat this as a guard against
 * `null` and the wrong shape rather than proof of the real class.
 */
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

export const getGridTypeLabel = (
	gridType?: GridType | null,
): string => {
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
