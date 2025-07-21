import React, { useCallback, useRef } from 'react';
import 'leaflet.sync';

// components
import MarineMapContainer from '@/components/marine-map-container';
import WarningRSLCCMIP6 from "@/components/warning-rslc-cmip6";

// other
import { cn } from '@/lib/utils';
import { useMap } from '@/hooks/use-map';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useMapInteractions } from "@/hooks/use-map-interactions.tsx";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setMessageDisplay } from '@/features/map/map-slice';
import L from "leaflet";

/**
 * Renders a Leaflet map specifically for marine variables.
 * This maintains the same API as RasterMap but uses the custom marine map container
 * with the modified layer ordering (raster under basemap).
 */
export default function MarineMap(): React.ReactElement {
	const { setMap, setComparisonMap } = useMap();
	const { climateVariable } = useClimateVariable();
	const dispatch = useAppDispatch();

	const messageDisplayStates = useAppSelector(state => state.map.messageDisplayStates);
	const warningRSLCCMIP6Id = 'warningRSLCCMIP6';
	const warningRSLCCMIP6Displayed = messageDisplayStates[warningRSLCCMIP6Id] ?? true;

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
		handleClearSelectedLocation
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

	const handleHideWarning = () => {
		dispatch(setMessageDisplay({message: warningRSLCCMIP6Id, displayed: false}));
	}

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
			<WarningRSLCCMIP6
				className="absolute top-48 md:top-40 z-20 w-full px-4"
				displayed={warningRSLCCMIP6Displayed}
				onHide={handleHideWarning}
			/>
			<MarineMapContainer
				scenario={climateVariable?.getScenario() ?? ''}
				onMapReady={handleMapReady}
				onUnmount={handleUnmount}
				isComparisonMap={false}
				onOver={handleOver}
				onOut={handleOut}
				onClick={handleClick}
				selectedLocation={selectedLocation}
				clearSelectedLocation={handleClearSelectedLocation}
				layerRef={primaryLayerRef}
			/>
			{showComparisonMap && (
				<MarineMapContainer
					scenario={climateVariable?.getScenarioCompareTo() ?? ''}
					onMapReady={handleComparisonMapReady}
					onUnmount={unsyncMaps}
					isComparisonMap={true}
					onOver={handleOver}
					onOut={handleOut}
					onClick={handleClick}
					selectedLocation={selectedLocation}
					clearSelectedLocation={handleClearSelectedLocation}
					layerRef={comparisonLayerRef}
				/>
			)}
		</div>
	);
}
