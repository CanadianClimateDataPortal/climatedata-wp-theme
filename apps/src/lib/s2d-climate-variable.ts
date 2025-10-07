import {
	type ClimateVariableConfigInterface,
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
}

export default S2DClimateVariable;
