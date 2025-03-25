import React, { useCallback, useMemo } from "react";
import { ClimateVariables } from "@/config/climate-variables.config";
import {
	useAppDispatch,
	useAppSelector
} from "@/app/hooks";
import ClimateVariableContext, { ClimateVariableContextType } from "@/hooks/use-climate-variable";
import { PostData } from "@/types/types";
import {
	setClimateVariable,
	updateClimateVariable
} from "@/store/climate-variable-slice";
import ClimateVariableBase from "@/lib/climate-variable-base";
import {
	ClimateVariableConfigInterface,
	ClimateVariableInterface, InteractiveRegionOption
} from "@/types/climate-variable-interface";

type ClassMapType = Record<string, new (arg: ClimateVariableConfigInterface) => ClimateVariableInterface>;

/**
 * Maps climate variable class names to their corresponding class implementations.
 */
const CLIMATE_VARIABLE_CLASS_MAP: ClassMapType = {
	"ClimateVariableBase": ClimateVariableBase
};

/**
 * Provides the ClimateVariable context to the component tree.
 */
export const ClimateVariableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const dispatch = useAppDispatch();

	const climateVariableData = useAppSelector((state) => state.climateVariable.data)

	/**
	 * Returns an instance of a climate variable class, derived from the provided climate variable data.
	 *
	 * The climate variable class is determined by mapping the `class` property of `climateVariableData`
	 * using the `CLIMATE_VARIABLE_CLASS_MAP`. If the specified class is not found in the map, an error
	 * is thrown.
	 */
	const climateVariable = useMemo(
		() => {
			const climateVariableClass = CLIMATE_VARIABLE_CLASS_MAP[climateVariableData.class];
			if (!climateVariableClass) {
				throw new Error(`Invalid climate variable class: ${climateVariableData.class}`);
			}
			return new climateVariableClass(climateVariableData);
		},
		[climateVariableData]
	);

	/**
	 * A callback function to select and set a climate variable.
	 *
	 * Matches a climate variable from a predefined list of configurations
	 * using the provided variable's ID. If a matching variable is found, it combines
	 * the API data with configuration data and dispatches an action to set the climate
	 * variable in the application state. If no matching variable is found, it raises
	 * an error.
	 *
	 * @param {PostData} variable - The data containing the climate variable ID and post ID from the API.
	 * @throws {Error} Throws an error if no matching climate variable configuration is found.
	 */
	const selectClimateVariable = useCallback((variable: PostData) => {
		const matchedVariable = ClimateVariables.find((config) => config.id === variable.id);

		if (matchedVariable) {
			// Combine important properties from API with the config data.
			dispatch(setClimateVariable({
				...matchedVariable,
				postId: variable.postId,
			}));
		} else {
			throw new Error(`No matching variable found for id: ${variable.id}`);
		}
	}, [dispatch]);

	/**
	 * Updates the version of the climate variable and dispatches the updated information.
	 *
	 * @callback setVersion
	 * @param {string} version - The new version to be updated.
	 * @returns {void}
	 */
	const setVersion = useCallback((version: string) => {
		dispatch(updateClimateVariable({
			version
		}));
	}, [dispatch]);

	const setScenario = useCallback((scenario: string) => {
		dispatch(updateClimateVariable({
			scenario
		}));
	}, [dispatch]);

	const setThreshold = useCallback((threshold: string) => {
		dispatch(updateClimateVariable({
			threshold
		}));
	}, [dispatch]);

	const setInteractiveRegion = useCallback((interactiveRegion: InteractiveRegionOption) => {
		dispatch(updateClimateVariable({
			interactiveRegion
		}));
	}, [dispatch]);

	const value: ClimateVariableContextType = {
		climateVariable,
		selectClimateVariable,
		setVersion,
		setScenario,
		setThreshold,
		setInteractiveRegion,
	}

	return (
		<ClimateVariableContext.Provider value={value}>
			{children}
		</ClimateVariableContext.Provider>
	)
};
