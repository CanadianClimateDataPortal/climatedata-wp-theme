import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { urlParamsToState } from '@/lib/utils';
import { setClimateVariable } from '@/store/climate-variable-slice';
import {
	setVariable,
	setDecade,
	setInteractiveRegion,
	setTimePeriodEnd,
	setThresholdValue,
	setMapColor as setColorScheme,
	setOpacity,
} from '@/features/map/map-slice';
import { MapActionType } from '@/types/types';

const mapActionCreators: MapActionType = {
	variable: setVariable,
	decade: setDecade,
	interactiveRegion: setInteractiveRegion,
	timePeriodEnd: setTimePeriodEnd,
	thresholdValue: setThresholdValue,
	colourScheme: setColorScheme,
	opacity: setOpacity,
};

export const useUrlState = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Get URL params
		const params = new URLSearchParams(window.location.search);

		// Only process if URL has parameters
		if (!params.has('var')) return;

		const state = urlParamsToState(params);

		// Process in correct order
		if (state.climateVariable?.data) {
			// Set climate variable first
			dispatch(setClimateVariable(state.climateVariable.data));

			// Give time for variable to initialize
			setTimeout(() => {
				if (state.map) {
					Object.entries(state.map).forEach(([key, value]) => {
						const actionCreator = mapActionCreators[key];
						if (actionCreator && value !== undefined) {
							dispatch(actionCreator(value));
						}
					});
				}
			}, 100);
		}
	}, [dispatch]);
};
