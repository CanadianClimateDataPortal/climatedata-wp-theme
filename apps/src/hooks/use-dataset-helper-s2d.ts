import { useClimateVariable } from '@/hooks/use-climate-variable';

import S2DClimateVariable from '@/lib/s2d-climate-variable';

export type DatasetHelperS2D = {
	isS2D: boolean;
};

export const useDatasetHelperS2D = (): DatasetHelperS2D => {
	const { climateVariable } = useClimateVariable();

	const isS2D = climateVariable instanceof S2DClimateVariable;

	return {
		isS2D,
	}
};
