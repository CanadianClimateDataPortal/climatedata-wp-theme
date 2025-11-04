import { useEffect, useState } from "react";
import { MapInfoData } from "@/types/types";
import { fetchWPData } from "@/services/services";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import MapHeader from "@/components/map-header";
import Map from '@/components/map';

const MapWrapper = () => {
	const { climateVariable } = useClimateVariable();
	const [mapInfo, setMapInfo] = useState<MapInfoData | null>(null);
	
	useEffect(() => {
		const postId = climateVariable?.getPostId();
		if (typeof postId !== 'number') return;
		fetchWPData(postId).then((data) => setMapInfo(data.mapInfo));
	}, [climateVariable]);

	return (
		<div className="relative flex-1">
			<MapHeader data={mapInfo}/>
			<Map />
		</div>
	);
}

export {
	MapWrapper
}
