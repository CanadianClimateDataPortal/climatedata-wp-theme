import {
	type ClimateVariableConfigInterface,
} from '@/types/climate-variable-interface';
import ClimateVariableBase from './climate-variable-base';

/**
 * Seasonal To Decadal
 */
class SeasonalDecadalClimateVariable extends ClimateVariableBase {
	constructor(
		config: ClimateVariableConfigInterface,
	) {
		super(config);
	}
}

export default SeasonalDecadalClimateVariable;

