import {
	type ClimateVariableConfigInterface,
	FrequencyType,
} from '@/types/climate-variable-interface';
import ClimateVariableBase from '@/lib/climate-variable-base';

/**
 * Seasonal To Decadal
 */
export class S2DClimateVariable extends ClimateVariableBase {
	constructor(
		config: ClimateVariableConfigInterface,
	) {
		super(config);
	}

	getFrequency(): string | null {
		return super.getFrequency() ?? FrequencyType.SEASONAL;
	}
}

export default S2DClimateVariable;
