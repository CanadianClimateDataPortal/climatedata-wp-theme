import React, {
	useEffect,
	useState,
} from 'react';
import { MapInfoData } from '@/types/types';
import { fetchMapInfoData } from '@/services/services';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import MapHeader from '@/components/map-header';
import { MapRoot } from '@/components/map';

/**
 * Holds the Maps SPA's header and map area together.
 *
 * Fetches the WordPress map-info record for the selected climate variable and
 * hands it to `MapHeader`, then renders `MapRoot` once that variable is loaded.
 */
const MapWrapper = (
): React.ReactElement => {
	const { climateVariable } = useClimateVariable();
	const [mapInfo, setMapInfo] = useState<MapInfoData | null>(null);

	useEffect(() => {
		const postId = climateVariable?.getPostId();
		if (typeof postId !== 'number') return;
		fetchMapInfoData(postId).then((mapInfo) => {
			if (mapInfo) {
				setMapInfo(mapInfo);
			}
		});
	}, [climateVariable]);

	return (
		<div className="relative flex-1">
			<MapHeader data={mapInfo}/>
			{/*
			The map waits for the climate variable to load.
			Mounting it earlier lets its events reach the store while the app is
			still settling its own state.
			*/}
			{climateVariable ?
				<MapRoot /> :
				null
			}
		</div>
	);
};

MapWrapper.displayName = 'MapWrapper'; // Explicit string literal, or this name would be lost in production.

export default MapWrapper;
