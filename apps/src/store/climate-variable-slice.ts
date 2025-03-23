import { createSlice } from "@reduxjs/toolkit";
import { ClimateVariables } from "@/config/climate-variables.config.ts";
import { ClimateVariableConfigInterface } from "@/types/climate-variable-interface.ts";

interface ClimateVariableStateInterface {
	data: ClimateVariableConfigInterface;
}
const initialState: ClimateVariableStateInterface = {
	data: ClimateVariables[0]
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
		}
	}
})

export const {
	setClimateVariable,
	updateClimateVariable
} = climateVariableSlice.actions;
export default climateVariableSlice.reducer;
