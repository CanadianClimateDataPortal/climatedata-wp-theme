import React, { useRef } from 'react';
import 'leaflet.sync';
import L from 'leaflet';
import 'leaflet.vectorgrid';

// components
import RasterMapContainer from '@/components/raster-map-container';

// other
import { cn } from '@/lib/utils';
import { useMap } from '@/hooks/use-map';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";
import { useMarker } from '@/hooks/use-map-marker';
import { fetchLocationByCoords } from '@/services/services';
import { useAppDispatch } from '@/app/hooks';
import { addRecentLocation } from '@/features/map/map-slice';

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function RasterMap(): React.ReactElement {
	const { setMap } = useMap();
	const { climateVariable } = useClimateVariable();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const comparisonMapRef = useRef<L.Map | null>(null);
	const hoveredRef = useRef<number | null>(null);
	const primaryLayerRef = useRef<any>(null);
	const comparisonLayerRef = useRef<any>(null);
	const showComparisonMap = !!(climateVariable?.getScenarioCompare() && climateVariable?.getScenarioCompareTo());

	const dispatch = useAppDispatch();
	const { addMarker } = useMarker(mapRef, comparisonMapRef);

	const handleOver = (e: { latlng: L.LatLng; layer: { properties: any } }, fillColor: string) => {
		const featureId = e.layer?.properties?.gid ?? e.layer?.properties?.id;
		if (!featureId) return;
		hoveredRef.current = featureId;
		const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;
		const style = {
			fill: true,
			fillColor: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
					? '#fff'
					: fillColor,
			fillOpacity: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 0.2 : 1,
			weight: 1.5,
			color: '#fff',
		};
		[primaryLayerRef, comparisonLayerRef].forEach(ref => {
			if (ref.current) {
				ref.current.setFeatureStyle(featureId, style);
			}
		});
	};

	const handleOut = () => {
		[primaryLayerRef, comparisonLayerRef].forEach(ref => {
			if (ref.current && hoveredRef.current !== null) {
				ref.current.resetFeatureStyle(hoveredRef.current);
			}
		});
		hoveredRef.current = null;
	};

	const handleClick = async (e: { latlng: L.LatLng; layer: { properties: any } }) => {
		const locationByCoords = await fetchLocationByCoords(e.latlng);
		const locationId = locationByCoords?.geo_id ?? `${locationByCoords?.lat}|${locationByCoords?.lng}`;
		const locationTitle = e.layer?.properties?.label_en ?? locationByCoords?.title;

		addMarker(e.latlng, locationTitle, locationId);

		dispatch(addRecentLocation({
			id: locationId,
			title: locationTitle,
			...e.latlng,
		}));

		// open modal
	};

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
				onOver={handleOver}
				onOut={handleOut}
				onClick={handleClick}
				layerRef={primaryLayerRef}
			/>
			{showComparisonMap && (
				<RasterMapContainer
					scenario={climateVariable?.getScenarioCompareTo() ?? ''}
					onMapReady={(map: L.Map) => {
						map.invalidateSize();
						comparisonMapRef.current = map;
						syncMaps();
					}}
					onUnmount={unsyncMaps}
					isComparisonMap={true}
					onOver={handleOver}
					onOut={handleOut}
					onClick={handleClick}
					layerRef={comparisonLayerRef}
				/>
			)}
		</div>
	);
}
