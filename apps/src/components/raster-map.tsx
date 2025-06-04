import React, { useRef } from 'react';
import 'leaflet.sync';
import L from 'leaflet';

// components
import RasterMapContainer from '@/components/raster-map-container';

// other
import { cn } from '@/lib/utils';
import { useMap } from '@/hooks/use-map';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useSynchronizedMarkers } from '@/hooks/use-synchronized-markers';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMap(): React.ReactElement {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const comparisonMapRef = useRef<L.Map | null>(null);

	const { setMap, setComparisonMap } = useMap();
	const { climateVariable } = useClimateVariable();
	const { addMarker } = useSynchronizedMarkers(mapRef, comparisonMapRef);

	const showComparisonMap = !!(climateVariable?.getScenarioCompare() && climateVariable?.getScenarioCompareTo());

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
		<div
			id='wrapper-map'
			ref={wrapperRef}
			className={cn(
				'map-wrapper',
				'grid gap-4 h-full z-30',
				showComparisonMap ? 'grid-cols-2' : 'grid-cols-1'
			)}
		>
			<RasterMapContainer
				scenario={climateVariable?.getScenario() ?? ''}
				onMapReady={(map: L.Map) => {
					map.invalidateSize();
					mapRef.current = map;
					setMap(map);
				}}
				onUnmount={() => (mapRef.current = null)}
				isComparisonMap={false}
				onAddMarker={addMarker}
			/>
			{showComparisonMap && (
				<RasterMapContainer
					scenario={climateVariable?.getScenarioCompareTo() ?? ''}
					onMapReady={(map: L.Map) => {
						map.invalidateSize();
						comparisonMapRef.current = map;
						setComparisonMap(map)
						syncMaps(); // sync once the comparison map is ready
					}}
					onUnmount={unsyncMaps}// unsync and clear the reference to this map
					isComparisonMap={true}
					onAddMarker={addMarker}
				/>
			)}
		</div>
	);
}
