import MarineClimateVariable from "@/lib/marine-climate-variable";
import MedianOnlyVariableValues from "@/components/map-layers/median-only-variable-values";

class AllowanceClimateVariable extends MarineClimateVariable {
	getLocationModalContent(latlng: L.LatLng, featureId: number, mode: "modal" | "panel" = "modal"): React.ReactNode {
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
