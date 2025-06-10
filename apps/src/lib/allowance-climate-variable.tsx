import MarineClimateVariable from "@/lib/marine-climate-variable";
import MedianOnlyVariableValues from "@/components/map-layers/median-only-variable-values";
import { LocationModalContentParams } from "@/types/climate-variable-interface";

class AllowanceClimateVariable extends MarineClimateVariable {
	getLocationModalContent({latlng, featureId, mode = "modal"}: LocationModalContentParams): React.ReactNode {
		const { lat, lng } = latlng;

		return (
			<MedianOnlyVariableValues
				latlng={latlng}
				featureId={featureId}
				mode={mode}
				endpoint={`get-allowance-gridded-values/${lat}/${lng}`}
			/>
		);
	}
}

export default AllowanceClimateVariable;
