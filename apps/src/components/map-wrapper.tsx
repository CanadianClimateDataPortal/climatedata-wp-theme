import { useEffect, useState } from "react";
import { MapInfoData } from "@/types/types";
import { fetchWPData } from "@/services/services";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import MapHeader from "@/components/map-header";

const MapWrapper = () => {
	const { climateVariable } = useClimateVariable();
	const [mapInfo, setMapInfo] = useState<MapInfoData | null>(null);

	useEffect(() => {
		fetchWPData(17116).then((data) => setMapInfo(data.mapInfo));
	}, []);

	return (
		<div className="relative flex-1">
			{mapInfo && <MapHeader data={mapInfo}/>}
			{climateVariable?.renderMap()}
		</div>
	);
}

export {
	MapWrapper
}
