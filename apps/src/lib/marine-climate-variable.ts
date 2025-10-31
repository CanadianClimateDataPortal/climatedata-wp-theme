import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import { VariableType, VariableTypes } from '@/types/climate-variable-interface';

class MarineClimateVariable extends RasterPrecalculatedClimateVariable {
	getTypes(): VariableType[] {
		return [
			VariableTypes.Marine,
			...super.getTypes(),
		];
	}
}

export default MarineClimateVariable;
