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

import { MapState, MapLocation, WMSLegendData, TaxonomyData } from '@/types/types';
import {
	SLIDER_DEFAULT_YEAR_VALUE,
	SLIDER_MAX_YEAR,
	SLIDER_YEAR_WINDOW_SIZE,
	REGION_GRID,
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
	emissionScenario: 'high',
	emissionScenarioCompare: false,
	emissionScenarioCompareTo: '',
	thresholdValue: 5,
	interactiveRegion: REGION_GRID,
	frequency: 'ann',
	timePeriodEnd: [defaultTimePeriodEnd], // needs an array because of the slider component that uses it
	recentLocations: [],
	pane: 'raster',
	dataValue: 'absolute',
	mapColor: 'default',
	opacity: {
		mapData: 1,
		labels: 1,
	},
	legendData: {},
};

// Create the slice
const mapSlice = createSlice({
	name: 'map',
	initialState,
	reducers: {
		setDataset(state, action: PayloadAction<TaxonomyData | null>) {
			state.dataset = action.payload ?? undefined;
		},
		setVariable(state, action: PayloadAction<string>) {
			state.variable = action.payload;
		},
		setDecade(state, action: PayloadAction<string>) {
			state.decade = action.payload;
		},
		setEmissionScenario(state, action: PayloadAction<string>) {
			state.emissionScenario = action.payload;
		},
		setEmissionScenarioCompare(state, action: PayloadAction<boolean>) {
			state.emissionScenarioCompare = action.payload;
		},
		setEmissionScenarioCompareTo(state, action: PayloadAction<string>) {
			state.emissionScenarioCompareTo = action.payload;
		},
		setThresholdValue(state, action: PayloadAction<number>) {
			state.thresholdValue = action.payload;
		},
		setInteractiveRegion(state, action: PayloadAction<string>) {
			state.interactiveRegion = action.payload;
		},
		setFrequency(state, action: PayloadAction<string>) {
			state.frequency = action.payload;
		},
		setTimePeriodEnd(state, action: PayloadAction<number[]>) {
			state.timePeriodEnd = action.payload;
		},
		addRecentLocation(
			state,
			action: PayloadAction<Omit<MapLocation, 'id'>>
		) {
			const newLocation = action.payload;

			// make sure the location is not already in the array
			const exists = state.recentLocations.some(
				(loc) =>
					loc.lat === newLocation.lat && loc.lng === newLocation.lng
			);

			if (!exists) {
				state.recentLocations.push({
					id: crypto.randomUUID(), // generate a unique id for the location
					...newLocation,
				});
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
		setDataValue(state, action: PayloadAction<string>) {
			state.dataValue = action.payload;
		},
		setMapColor(state, action: PayloadAction<string>) {
			state.mapColor = action.payload;
		},
		setLegendData(state, action: PayloadAction<WMSLegendData>) {
			state.legendData = action.payload;
		},
		setOpacity(
			state,
			action: PayloadAction<{ key: keyof MapItemsOpacity; value: number }>
		) {
			const { key, value } = action.payload;
			state.opacity[key] = value / 100;
		},
	},
});

// Export actions
export const {
	setDataset,
	setVariable,
	setDecade,
	setEmissionScenario,
	setEmissionScenarioCompare,
	setEmissionScenarioCompareTo,
	setThresholdValue,
	setInteractiveRegion,
	setFrequency,
	setTimePeriodEnd,
	addRecentLocation,
	deleteLocation,
	clearRecentLocations,
	setDataValue,
	setMapColor,
	setLegendData,
	setOpacity,
} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;
