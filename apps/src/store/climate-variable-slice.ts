import { createSlice } from "@reduxjs/toolkit";
import { ClimateVariables } from "@/config/climate-variables.config";
import { ClimateVariableConfigInterface } from "@/types/climate-variable-interface";

interface ClimateVariableStateInterface {
	data: ClimateVariableConfigInterface;
}

const initialState: ClimateVariableStateInterface = {
	data: ClimateVariables[0],
}

const climateVariableSlice = createSlice({
	name: "climateVariable",
	initialState,
	reducers: {
		setClimateVariable: (state, action) => {
			state.data = action.payload;
		},
		updateClimateVariable: (state, action) => {
			state.data = {
				...state.data,
				...action.payload
			};
		},
		updateClimateVariableAnalysisFieldValue: (state, action) => {
			const {key, value} = action.payload;

			state.data = {
				...state.data,
				analysisFieldValues: {
					...state.data.analysisFieldValues,
					[key]: value
				}
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
