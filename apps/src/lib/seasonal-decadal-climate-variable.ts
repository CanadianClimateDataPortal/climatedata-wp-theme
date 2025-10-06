import {
	type ClimateVariableConfigInterface,
} from '@/types/climate-variable-interface';
import ClimateVariableBase from '@/lib/climate-variable-base';

/**
 * Seasonal To Decadal
 */
export class SeasonalDecadalClimateVariable extends ClimateVariableBase {
	constructor(
		config: ClimateVariableConfigInterface,
	) {
		super(config);
	}
}

export default SeasonalDecadalClimateVariable;

