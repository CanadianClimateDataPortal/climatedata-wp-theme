/**
 * This component will handle lifecycle events for the map instance.
 * It triggers callback functions when the map is ready and when it is unmounted.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { MapEventsProps } from '@/types/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMapCoordinates } from '@/features/map/map-slice';

export default function MapEvents({
	onMapReady,
	onUnmount,
	onLocationModalClose,
}: MapEventsProps): null {
	const map = useMap();
	const isUnmounting = useRef(false);
	const { closePanel } = useAnimatedPanel();
	const dispatch = useAppDispatch();
	const stateCoordinates = useAppSelector(state => state.map.mapCoordinates);
	const isUpdatingRef = useRef(false);

	useEffect(() => {
		if (onMapReady) {
			onMapReady(map);
		}
		
		const updateMapCoordinates = () => {
			if (isUpdatingRef.current) return;
			
			const center = map.getCenter();
			const zoom = map.getZoom();
			
			// Only update if coordinates or zoom have changed
			if (stateCoordinates.lat !== center.lat || 
				stateCoordinates.lng !== center.lng || 
				stateCoordinates.zoom !== zoom) {
				
				isUpdatingRef.current = true;
				dispatch(setMapCoordinates({
					lat: center.lat,
					lng: center.lng,
					zoom: zoom
				}));

				setTimeout(() => {
					isUpdatingRef.current = false;
				}, 100);
			}
		};
		

		let timeoutId: number | null = null;
		
		const handleMapMove = () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			timeoutId = window.setTimeout(updateMapCoordinates, 200);
		};
		
		map.on('moveend', handleMapMove);
		map.on('zoomend', handleMapMove);

		return () => {
			isUnmounting.current = true;
			map.off('moveend', handleMapMove);
			map.off('zoomend', handleMapMove);
			
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			
			if (onUnmount) {
				onUnmount();
			}

			if (isUnmounting.current) {
				// We close the location modal and info panel when map is unmount
				if (onLocationModalClose && isUnmounting.current) {
					onLocationModalClose();
				}
				if (closePanel) {
					closePanel();
				}
			}
		};
	}, [map, onMapReady, onUnmount, dispatch, closePanel, onLocationModalClose, stateCoordinates]);

	useEffect(() => {
		// Skip if we're already in the process of updating
		if (isUpdatingRef.current) return;
		
		const currentCenter = map.getCenter();
		const currentZoom = map.getZoom();

		if (currentCenter.lat !== stateCoordinates.lat || 
			currentCenter.lng !== stateCoordinates.lng || 
			currentZoom !== stateCoordinates.zoom) {
			
			map.setView([stateCoordinates.lat, stateCoordinates.lng], stateCoordinates.zoom, {
				animate: false 
			});
		}
	}, [stateCoordinates, map]);

	return null;
}
