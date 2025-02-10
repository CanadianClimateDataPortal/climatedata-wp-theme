import { useEffect, useState, useRef } from 'react';
import 'leaflet.sync';

// components
import MapHeader from '@/components/map-header';
import Map from '@/components/map';

// other
import { cn } from '@/lib/utils';
import { MapInfoData } from '@/types/types';
import { fetchWPData } from '@/services/services';
import { useAppSelector } from '@/app/hooks';
import { useMap } from '@/hooks/use-map';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function MapWrapper() {
	const [mapInfo, setMapInfo] = useState<MapInfoData | null>(null);

	const { emissionScenarioCompare, emissionScenarioCompareTo } =
		useAppSelector((state) => state.map);

	const { setMap } = useMap();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const comparisonMapRef = useRef<L.Map | null>(null);

	useEffect(() => {
		fetchWPData().then((data) => setMapInfo(data.mapInfo));
	}, []);

	// show the comparison map if compare checkbox is checked and there is a compare-to scenario
	const showComparisonMap =
		emissionScenarioCompare && !!emissionScenarioCompareTo;

	// helper sync/unsync methods for convenience
	const syncMaps = () => {
		if (mapRef.current && comparisonMapRef.current) {
			// @ts-expect-error: suppress leaflet typescript errors
			mapRef.current.sync(comparisonMapRef.current);
			// @ts-expect-error: suppress leaflet typescript errors
			comparisonMapRef.current.sync(mapRef.current);
		}
	};

	const unsyncMaps = () => {
		if (mapRef.current && comparisonMapRef.current) {
			// @ts-expect-error: suppress leaflet typescript errors
			mapRef.current.unsync(comparisonMapRef.current);
			// @ts-expect-error: suppress leaflet typescript errors
			comparisonMapRef.current.unsync(mapRef.current);

			// if we don't clear this reference, the primary map will attempt to sync
			// with an invalid comparisonMapRef reference.. so, let's just clear the
			// reference and be done with it.. no need to clear the primary map reference
			comparisonMapRef.current = null;
		}
	};

	return (
		<div className="relative flex-1">
			{mapInfo && <MapHeader data={mapInfo} mapRef={wrapperRef} />}
			<div
				ref={wrapperRef}
				className={cn(
					'map-wrapper',
					'grid gap-4 h-full',
					showComparisonMap ? 'sm:grid-cols-2' : 'grid-cols-1'
				)}
			>
				<Map
					onMapReady={(map: L.Map) => {
						mapRef.current = map;
						setMap(map);
					}}
					onUnmount={() => (mapRef.current = null)}
				/>
				{showComparisonMap && (
					<Map
						onMapReady={(map: L.Map) => {
							comparisonMapRef.current = map;
							syncMaps(); // sync once the comparison map is ready
						}}
						onUnmount={unsyncMaps} // unsync and clear the reference to this map
					/>
				)}
			</div>
		</div>
	);
}
