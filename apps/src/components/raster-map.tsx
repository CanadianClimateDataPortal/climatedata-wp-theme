import React, { useRef } from 'react';
import 'leaflet.sync';

// components
import RasterMapContainer from '@/components/raster-map-container';

// other
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { useMap } from '@/hooks/use-map';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMap(): React.ReactElement {
	const { emissionScenarioCompare, emissionScenarioCompareTo } =
		useAppSelector((state) => state.map);

	const { setMap } = useMap();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const comparisonMapRef = useRef<L.Map | null>(null);

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
		<div
			ref={wrapperRef}
			className={cn(
				'map-wrapper',
				'grid gap-4 h-full z-30',
				showComparisonMap ? 'sm:grid-cols-2' : 'grid-cols-1'
			)}
		>
			<RasterMapContainer
				onMapReady={(map: L.Map) => {
					mapRef.current = map;
					setMap(map);
				}}
				onUnmount={() => (mapRef.current = null)}
			/>
			{showComparisonMap && (
				<RasterMapContainer
					onMapReady={(map: L.Map) => {
						comparisonMapRef.current = map;
						syncMaps(); // sync once the comparison map is ready
					}}
					onUnmount={unsyncMaps} // unsync and clear the reference to this map
				/>
			)}
		</div>
	);
}
