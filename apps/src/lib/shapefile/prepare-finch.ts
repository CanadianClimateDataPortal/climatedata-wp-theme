import type { PrepareFinchPayload } from './pipeline';
import type { FinchShapeParameter } from './contracts';

/**
 * Create the Finch payload for the selected region.
 */
export const prepareFinchPayload: PrepareFinchPayload = (region) => {
	return {
		type: 'FeatureCollection',
		features: [region.feature],
	} as FinchShapeParameter;
};
