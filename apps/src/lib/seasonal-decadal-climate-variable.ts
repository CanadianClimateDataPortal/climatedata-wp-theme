import {
	type ClimateVariableConfigInterface,
	FrequencyType,
} from '@/types/climate-variable-interface';
import ClimateVariableBase from './climate-variable-base';

/**
 * Seasonal To Decadal
 */
class SeasonalDecadalClimateVariable extends ClimateVariableBase {
	constructor(config: ClimateVariableConfigInterface) {
		super(config);
	}

	getFrequency(): string | null {
		return super.getFrequency() ?? FrequencyType.SEASONAL;
	}
}

export default SeasonalDecadalClimateVariable;
