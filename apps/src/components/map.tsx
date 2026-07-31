import React, { useCallback, useRef } from 'react';
import 'leaflet.sync';
import L from 'leaflet';
import 'leaflet.vectorgrid';

// components
import MapContainer from '@/components/map-container';
import MapBanners from '@/components/map-banners';

// other
import { cn } from '@/lib/utils';
import { useMap } from '@/hooks/use-map';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useMapInteractions } from '@/hooks/use-map-interactions';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
const MapRoot = (
): React.ReactElement => {
	const { setMap, setComparisonMap } = useMap();
	const { climateVariable } = useClimateVariable();
	const wrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const comparisonMapRef = useRef<L.Map | null>(null);
	// @ts-expect-error: suppress leaflet typescript error
	const primaryLayerRef = useRef<L.VectorGrid | null>(null);
	// @ts-expect-error: suppress leaflet typescript error
	const comparisonLayerRef = useRef<L.VectorGrid | null>(null);
	const showComparisonMap = !!(climateVariable?.getScenarioCompare() && climateVariable?.getScenarioCompareTo());

	const {
		selectedLocation,
		handleOver,
		handleOut,
		handleClick,
		handleClearSelectedLocation,
		selectGriddedLocation,
	} = useMapInteractions({
		primaryLayerRef,
		comparisonLayerRef,
	});

	const syncMaps = useCallback(() => {
		if (mapRef.current && comparisonMapRef.current) {
			// @ts-expect-error: suppress leaflet typescript errors
			mapRef.current.sync(comparisonMapRef.current);
			// @ts-expect-error: suppress leaflet typescript errors
			comparisonMapRef.current.sync(mapRef.current);
		}
	}, []);

	const unsyncMaps = useCallback(() => {
		if (mapRef.current && comparisonMapRef.current) {
			// @ts-expect-error: suppress leaflet typescript errors
			mapRef.current.unsync(comparisonMapRef.current);
			// @ts-expect-error: suppress leaflet typescript errors
			comparisonMapRef.current.unsync(mapRef.current);
			comparisonMapRef.current = null;
		}
	}, []);

	const handleMapReady = useCallback((map: L.Map) => {
		map.invalidateSize();
		mapRef.current = map;
		setMap(map);
	}, [setMap]);

	const handleComparisonMapReady = useCallback((map: L.Map) => {
		map.invalidateSize();
		comparisonMapRef.current = map;
		setComparisonMap(map);
		syncMaps();
	}, [setComparisonMap, syncMaps]);

	const handleUnmount = useCallback(() => {
		mapRef.current = null;
	}, []);

	return (
		<div
			id='map-root'
			ref={wrapperRef}
			className={cn(
				'grid gap-4 h-full z-30',
				showComparisonMap ? 'grid-cols-2 map-comparison' : 'grid-cols-1'
			)}
		>
			<MapBanners className="absolute top-48 md:top-40 z-20 w-full sm:max-w-[calc(100%_-_120px)] px-4" />
			<MapContainer
				onMapReady={handleMapReady}
				onUnmount={handleUnmount}
				isComparisonMap={false}
				onOver={handleOver}
				onOut={handleOut}
				onClick={handleClick}
				selectedLocation={selectedLocation}
				clearSelectedLocation={handleClearSelectedLocation}
				selectGriddedLocation={selectGriddedLocation}
				layerRef={primaryLayerRef}
				className={showComparisonMap ? 'map-comparison-left' /** See {@link useLeafletSyncContainerClassName} */: undefined}
			/>
			{showComparisonMap && (
				<MapContainer
					onMapReady={handleComparisonMapReady}
					onUnmount={unsyncMaps}
					isComparisonMap={true}
					onOver={handleOver}
					onOut={handleOut}
					onClick={handleClick}
					selectedLocation={selectedLocation}
					clearSelectedLocation={handleClearSelectedLocation}
					layerRef={comparisonLayerRef}
					className={showComparisonMap ? 'map-comparison-right' : undefined}
				/>
			)}
		</div>
	);
}

MapRoot.displayName = 'MapRoot';

export default MapRoot;
