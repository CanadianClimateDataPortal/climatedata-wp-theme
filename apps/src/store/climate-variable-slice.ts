import { createSlice } from "@reduxjs/toolkit";
import { ClimateVariableConfigInterface } from "@/types/climate-variable-interface";

interface ClimateVariableStateInterface {
	data: ClimateVariableConfigInterface | null;
}

const initialState: ClimateVariableStateInterface = {
	data: null,
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
			if (!state.data) return;
			const { key, value } = action.payload;
			// Ensure analysisFieldValues exists before updating
			state.data = {
				...state.data,
				analysisFieldValues: {
					...(state.data.analysisFieldValues || {}),
					[key]: value,
				},
			};
		},
	}
})

export const {
	setClimateVariable,
	updateClimateVariable,
	updateClimateVariableAnalysisFieldValue,
} = climateVariableSlice.actions;

export default climateVariableSlice.reducer;
