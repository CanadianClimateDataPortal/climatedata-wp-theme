import {
	FrequencyType,
	type ClimateVariableConfigInterface,
	type LocationModalContentParams,
} from '@/types/climate-variable-interface';
import S2DClimateVariableValues from '@/components/map-layers/s2d-variable-values';
import ClimateVariableBase from '@/lib/climate-variable-base';
import {
	createPropsForS2DVariableValues,
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
		const props = createPropsForS2DVariableValues({});
		return super.renderWithComponent(
			S2DClimateVariableValues,
			props,
		);
	}
}

export default S2DClimateVariable;
