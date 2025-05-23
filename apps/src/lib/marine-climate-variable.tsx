import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import MarineMap from "@/components/marine-map.tsx";

class MarineClimateVariable extends RasterPrecalculatedClimateVariable {
	/**
	 * Override the renderMap method to return the marine custom map component
	 * which has the modified layer ordering (raster under basemap)
	 */
	renderMap(): React.ReactElement {
		return <MarineMap />;
	}
}

export default MarineClimateVariable;
