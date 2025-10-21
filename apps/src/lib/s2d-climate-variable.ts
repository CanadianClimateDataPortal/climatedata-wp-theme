import {
	type ClimateVariableConfigInterface,
	FrequencyType,
} from '@/types/climate-variable-interface';
import ClimateVariableBase from '@/lib/climate-variable-base';

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
}

export default S2DClimateVariable;
