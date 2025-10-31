import MarineClimateVariable from '@/lib/marine-climate-variable';
import { ColourType, DateRangeConfig, LocationModalContentParams } from '@/types/climate-variable-interface';
import MedianOnlyVariableValues from '@/components/map-layers/median-only-variable-values';
import { WMSParams } from '@/types/types';

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

	getLocationModalContent({latlng, featureId, mode = "modal", scenario}: LocationModalContentParams): React.ReactNode {
		const { lat, lng } = latlng;

		return (
			<MedianOnlyVariableValues
				latlng={latlng}
				featureId={featureId}
				mode={mode}
				endpoint={`get-slr-gridded-values/${lat}/${lng}`}
				scenario={scenario ?? ""}
			/>
		);
	}

	getColourType(): string | null {
		return ColourType.DISCRETE;
	}

	/**
	 * Update the data layer parameters of the map.
	 *
	 * For CMIP5, if we are in the comparison map, the layer style must be adjusted to use the
	 * same colour map as the left map. Also, the "enhanced" scenario has no time attribute.
	 */
	updateMapWMSParams(params: WMSParams, isComparisonMap: boolean): WMSParams {
		const updatedParams = {
			...super.updateMapWMSParams(params, isComparisonMap)
		};
		const version = this.getVersion();
		const scenario = isComparisonMap ?
			(this.getScenarioCompareTo() ?? '') :
			(this.getScenario() ?? '');

		if (version === "cmip5") {

			// There is no TIME attribute for the enhanced scenario
			if (scenario === 'rcp85plus65-p50') {
				delete updatedParams.TIME;
			}

			// For the comparison map, we force a layer style to have the same colours
			// as the left map
			if (isComparisonMap) {
				const leftMapScenario = this.getScenario();
				updatedParams.styles = `slr-${leftMapScenario}`;
			}
		}

		return updatedParams;
	}
}

export default SeaLevelClimateVariable;
