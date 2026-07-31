/**
 * @file
 *
 * Redux Slice: Map
 *
 * This slice manages the state needed to render the map with its different layers. For
 * example, it manages the state for the current map location, zoom level, vectors, etc.
 *
 * ## Example usage in a component
 *
 *    import { useAppDispatch } from "@/app/hooks";
 *    import { deleteLocation } from "@/features/map/map-slice";
 *
 *    const dispatch: AppDispatch = useDispatch();
 *    const recentLocations = useAppSelector(state => state.map.recentLocations);
 *    ...
 *    <ul>
 *      Recent locations
 *      {recentLocations.map((loc) => (
 *        <li key={loc.id}>
 *          {loc.title}
 *          <button onClick={() => dispatch(deleteLocation(loc.id))}>Delete</button>
 *        </li>
 *      )}
 *    </ul>
 *    ...
 */

import {
	createSelector,
	createSlice,
	type PayloadAction,
} from '@reduxjs/toolkit';

import type {
	MapCoordinates,
	MapItemsOpacity,
	MapLocation,
	MapState,
	PostData,
	TaxonomyData,
	TransformedLegendEntry,
	WMSLegendData,
} from '@/types/types';
import {
	SLIDER_DEFAULT_YEAR_VALUE,
	SLIDER_MAX_YEAR,
	SLIDER_YEAR_WINDOW_SIZE,
	REGION_GRID,
	DEFAULT_ZOOM,
	CANADA_CENTER,
	MAP_OPACITY_MIN,
} from '@/lib/constants';
import { RootState } from '@/app/store';

const defaultTimePeriodEnd = Math.min(
	SLIDER_DEFAULT_YEAR_VALUE + SLIDER_YEAR_WINDOW_SIZE,
	SLIDER_MAX_YEAR
);

// Define the initial state this slice is going to use.
const initialState: MapState = {
	variable: 'tx_max',
	decade: '2040',
	thresholdValue: 5,
	interactiveRegion: REGION_GRID,
	frequency: 'ann',
	timePeriodEnd: [defaultTimePeriodEnd], // needs an array because of the slider component that uses it
	recentLocations: [],
	selectedLocation: null,
	pane: 'raster',
	mapColor: 'default',
	opacity: {
		mapData: 1,
		labels: 1,
	},
	legendData: {},
	transformedLegendEntry: [],
	variableList: [],
	variableListLoading: false,
	mapCoordinates: {
		lat: Array.isArray(CANADA_CENTER) ? CANADA_CENTER[0] : 62.51231793838694,
		lng: Array.isArray(CANADA_CENTER) ? CANADA_CENTER[1] : -98.48144531250001,
		zoom: DEFAULT_ZOOM
	},
	messageDisplayStates: {},
	isLowSkillVisible: true,
	legend: {
		isOpen: false,  // Legend starts collapsed
	},
	locationModal: {
		isOpen: false,  // LocationModal starts hidden
	},
};

// Create the slice
const mapSlice = createSlice({
	name: 'map',
	initialState,
	reducers: {
		setDataset(state, action: PayloadAction<TaxonomyData | null>) {
			state.dataset = action.payload ?? undefined;
			// Reset variable list when dataset changes
			state.variableList = [];
			state.variableListLoading = false;
		},
		setVariableList(state, action: PayloadAction<PostData[]>) {
			state.variableList = action.payload;
			state.variableListLoading = false;
		},
		setVariableListLoading(state, action: PayloadAction<boolean>) {
			state.variableListLoading = action.payload;
		},
		setVariable(state, action: PayloadAction<string>) {
			state.variable = action.payload;
		},
		setDecade(state, action: PayloadAction<string>) {
			state.decade = action.payload;
		},
		setThresholdValue(state, action: PayloadAction<number>) {
			state.thresholdValue = action.payload;
		},
		setInteractiveRegion(state, action: PayloadAction<string>) {
			state.interactiveRegion = action.payload;
		},
		setTimePeriodEnd(state, action: PayloadAction<number[]>) {
			state.timePeriodEnd = action.payload;
		},
		addRecentLocation(
			state,
			action: PayloadAction<MapLocation>
		) {
			const newLocation = action.payload;

			// make sure the location is not already in the array
			const exists = state.recentLocations.some((loc) => loc.id === newLocation.id);

			if (!exists) {
				state.recentLocations.push(newLocation);
			}
		},
		deleteLocation(state, action: PayloadAction<string>) {
			state.recentLocations = state.recentLocations.filter(
				(loc) => loc.id !== action.payload
			);
		},
		clearRecentLocations(state) {
			state.recentLocations = [];
		},
		/**
		 * Set the single, currently-selected map location (or clear it with null).
		 *
		 * This is intentionally separate from `addRecentLocation`: that one is an
		 * append-only history with id-based dedup, so re-clicking an existing
		 * location is a no-op and `recentLocations[last]` cannot be relied upon
		 * as "the current selection." Use `selectedLocation` for that.
		 */
		setSelectedLocation(state, action: PayloadAction<MapLocation | null>) {
			state.selectedLocation = action.payload;
		},
		setMapColor(state, action: PayloadAction<string>) {
			state.mapColor = action.payload;
		},
		setLegendData(state, action: PayloadAction<WMSLegendData>) {
			state.legendData = action.payload;
		},
		setTransformedLegendEntry(state, action: PayloadAction<TransformedLegendEntry[]>) {
			state.transformedLegendEntry = action.payload;
		},
		clearTransformedLegendEntry(state) {
			state.transformedLegendEntry = [];
		},
		setOpacity(
			state,
			action: PayloadAction<{ key: keyof MapItemsOpacity; value: number }>
		) {
			const { key, value } = action.payload;
			if (key in MAP_OPACITY_MIN) {
				const minValue = MAP_OPACITY_MIN[key];
				if (value >= minValue && value <= 100) {
					state.opacity[key] = value / 100;
				}
			}
		},
		setMapCoordinates(state, action: PayloadAction<MapCoordinates>) {
			state.mapCoordinates = action.payload;
		},
		setMessageDisplay(state, action: PayloadAction<{ message: string; displayed: boolean }>) {
			state.messageDisplayStates[action.payload.message] = action.payload.displayed;
		},
		setLowSkillVisibility(state, action: PayloadAction<{ visible: boolean }>) {
			state.isLowSkillVisible = action.payload.visible;
		},
		setLegendOpen(state, action: PayloadAction<boolean>) {
			state.legend.isOpen = action.payload;
		},
		setLocationModalOpen(state, action: PayloadAction<boolean>) {
			state.locationModal.isOpen = action.payload;
		},
	},
});

// Export actions
export const {
	setDataset,
	setVariableList,
	setVariableListLoading,
	setVariable,
	setDecade,
	setThresholdValue,
	setInteractiveRegion,
	setTimePeriodEnd,
	addRecentLocation,
	deleteLocation,
	clearRecentLocations,
	setSelectedLocation,
	setMapColor,
	setLegendData,
	setTransformedLegendEntry,
	clearTransformedLegendEntry,
	setOpacity,
	setMapCoordinates,
	setMessageDisplay,
	setLowSkillVisibility,
	setLegendOpen,
	setLocationModalOpen,
} = mapSlice.actions;

/**
 * Selector that returns the visibility of the low-skill vector mask overlay.
 *
 * @see {@link MapState.isLowSkillVisible}
 */
export const selectLowSkillVisibility =
	() => (state: RootState) =>
		state.map.isLowSkillVisible;

/**
 * The single, currently-selected map location.
 *
 * Reads {@link MapState.selectedLocation} directly. Do NOT derive this from
 * `recentLocations[last]` — that history is dedup-on-id append-only, so the
 * last appended entry is not the current selection when an existing location
 * is re-clicked. {@link MapState.selectedLocation} is the source of truth.
 *
 * @see {@link MapState.selectedLocation}
 */
export const selectSelectedLocation = (state: RootState) =>
	state.map.selectedLocation;

/**
 * The current location's title.
 *
 * @returns string
 *
 * @example 'Lac Rahin, QC' - After having clicked on the map at coord. `59.866883195210214,-72.89428710937501`
 * @example 'Saint-Anthony-of-Padua, QC' - After having clicked on the map at coord. `45.5111111,-73.5552778`
 * @example 'Point (83.1597, -72.1143)' - After having clicked on the map at coord. `83.15965662857204,-72.11425781250001`
 */
export const selectSelectedLocationTitle = createSelector(
	[selectSelectedLocation],
	(current) => {
		const loc = current
			&& typeof current.title === 'string'
			&& current.title.length > 0
			? current
			: null;
		return loc?.title ?? null;
	},
);

// Export reducer
export default mapSlice.reducer;
