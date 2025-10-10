import { createElement } from 'react';

import {
	FrequencyType,
	type ClimateVariableConfigInterface,
	type LocationModalContentParams,
} from '@/types/climate-variable-interface';
import S2DClimateVariableValues from '@/components/map-layers/s2d-variable-values';
import ClimateVariableBase from '@/lib/climate-variable-base';
import {
	createPropsForS2DVariableValues,
	S2D_HARDCODED_HISTORICAL_MEDIAN_VALUE,
	S2D_HARDCODED_SKILL_VALUE,
	S2D_HARDCODED_TEMPERATURE_RANGE_VALUE,
	type CreateS2DVariableValuesFactory,
} from '@/lib/s2d-variable-values';

/**
 * Seasonal To Decadal
 */
class S2DClimateVariable extends ClimateVariableBase {
	constructor(
		config: ClimateVariableConfigInterface,
	) {
		super(config);
	}

	getFrequency(): string | null {
		return super.getFrequency() ?? FrequencyType.SEASONAL;
	}

	getColourOptionsStatus(): boolean {
		// No colour options for S2D variables
		return false;
	}

	getLocationModalContent(
		_params: LocationModalContentParams // eslint-disable-line @typescript-eslint/no-unused-vars
	): React.ReactNode | null {
		// TODO: Figure out where we will resolve the values. Probably from this class, and not outside.
		const skill: CreateS2DVariableValuesFactory['skill'] =
			/* _params?.skill ?? */ S2D_HARDCODED_SKILL_VALUE;
		const historicalMedian: CreateS2DVariableValuesFactory['historicalMedian'] =
			/* _params?.historicalMedian ?? */ S2D_HARDCODED_HISTORICAL_MEDIAN_VALUE;
		const temperatureRange: CreateS2DVariableValuesFactory['temperatureRange'] =
			/* _params?.temperatureRange ?? */ S2D_HARDCODED_TEMPERATURE_RANGE_VALUE;
		const props = createPropsForS2DVariableValues({
			skill,
			historicalMedian,
			temperatureRange,
		});

		// Ah, I missed you. Render Function tree pattern.
		// https://react.dev/reference/react/createElement
		const tree = createElement(
			'div',
			{
				className: 's2d-climate-variable',
			},
			createElement(
				S2DClimateVariableValues,
				props
				/* children */
			)
			/* children */
		);
		return tree;
	}
}

export default S2DClimateVariable;
