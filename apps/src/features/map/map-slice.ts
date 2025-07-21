/**
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
 *
 * @module locationsSlice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { MapState, MapLocation, WMSLegendData, TaxonomyData, PostData, MapCoordinates, TransformedLegendEntry } from '@/types/types';
import {
	SLIDER_DEFAULT_YEAR_VALUE,
	SLIDER_MAX_YEAR,
	SLIDER_YEAR_WINDOW_SIZE,
	REGION_GRID,
	DEFAULT_ZOOM,
	CANADA_CENTER
} from '@/lib/constants';
import { MapItemsOpacity } from '@/types/types';

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
	/**
	 * Display state of various messages. The key is the message's name, and
	 * the value is a boolean indicating if the message should be displayed.
	 */
	messageDisplayStates: {},
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
			state.opacity[key] = value / 100;
		},
		setMapCoordinates(state, action: PayloadAction<MapCoordinates>) {
			state.mapCoordinates = action.payload;
		},
		setMessageDisplay(state, action: PayloadAction<{ message: string; displayed: boolean }>) {
			state.messageDisplayStates[action.payload.message] = action.payload.displayed;
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
	setMapColor,
	setLegendData,
	setTransformedLegendEntry,
	clearTransformedLegendEntry,
	setOpacity,
	setMapCoordinates,
	setMessageDisplay,
} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;
