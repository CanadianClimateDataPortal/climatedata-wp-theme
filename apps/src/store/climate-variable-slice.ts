import { createSlice } from "@reduxjs/toolkit";
import { ClimateVariableConfigInterface } from "@/types/climate-variable-interface";

interface ClimateVariableStateInterface {
	data: ClimateVariableConfigInterface | null;
	searchQuery: string;
}

const initialState: ClimateVariableStateInterface = {
	data: null,
	searchQuery: '',
}

const climateVariableSlice = createSlice({
	name: "climateVariable",
	initialState,
	reducers: {
		setClimateVariable: (state, action) => {
			state.data = action.payload;
		},
		updateClimateVariable: (state, action) => {
			if (!state.data) return;
			
			state.data = {
				...state.data,
				...action.payload
			};
		},
		updateClimateVariableAnalysisFieldValue: (state, action) => {
			if (!state.data || !state.data.analysisFieldValues) return;
			
			const {key, value} = action.payload;

			state.data = {
				...state.data,
				analysisFieldValues: {
					...state.data.analysisFieldValues,
					[key]: value
				}
			};
		},
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload;
		},
		clearSearchQuery: (state) => {
			state.searchQuery = '';
		},
	}
})

export const {
	setClimateVariable,
	updateClimateVariable,
	updateClimateVariableAnalysisFieldValue,
	setSearchQuery,
	clearSearchQuery,
} = climateVariableSlice.actions;

export default climateVariableSlice.reducer;
