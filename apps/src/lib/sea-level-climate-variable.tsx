import MarineClimateVariable from "@/lib/marine-climate-variable";
import { DateRangeConfig } from "@/types/climate-variable-interface";
import MedianOnlyVariableValues from "@/components/map-layers/median-only-variable-values";

class SeaLevelClimateVariable extends MarineClimateVariable {
	getGridType(): string | null {
		return (this.getVersion() === "cmip6") ? "slrgrid-cmip6" : "slrgrid";
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return {
			min: (this.getVersion() === "cmip6") ? "2020" : "2006",
			max: "2100",
			interval: 10,
		}
	}

	getLocationModalContent(latlng: L.LatLng, featureId: number, mode: "modal" | "panel" = "modal"): React.ReactNode {
		const { lat, lng } = latlng;

		return (
			<MedianOnlyVariableValues
				latlng={latlng}
				featureId={featureId}
				mode={mode}
				endpoint={`get-slr-gridded-values/${lat}/${lng}`}
			/>
		);
	}
}

export default SeaLevelClimateVariable;
