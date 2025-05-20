/**
 * This component will handle lifecycle events for the map instance.
 * It triggers callback functions when the map is ready and when it is unmounted.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { MapEventsProps } from '@/types/types';
import { useAppDispatch } from '@/app/hooks';
import { setMapCoordinates } from '@/features/map/map-slice';
import { store } from '@/app/store';

export default function MapEvents({
	onMapReady,
	onUnmount,
	onLocationModalClose,
}: MapEventsProps): null {
	const map = useMap();
	const isUnmounting = useRef(false);
	const { closePanel } = useAnimatedPanel();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (onMapReady) {
			onMapReady(map);
		}
		
		const updateMapCoordinates = () => {
			const center = map.getCenter();
			const zoom = map.getZoom();
			
			dispatch(setMapCoordinates({
				lat: center.lat,
				lng: center.lng,
				zoom: zoom
			}));
		};
		
		// Initialize with current position - but only once
		const initialCenter = map.getCenter();
		const initialZoom = map.getZoom();
		const state = store.getState();
		
		// Only update coordinates if they've actually changed from what's in state
		if (state.map.mapCoordinates.lat !== initialCenter.lat ||
		    state.map.mapCoordinates.lng !== initialCenter.lng ||
		    state.map.mapCoordinates.zoom !== initialZoom) {
			updateMapCoordinates();
		}
		
		map.on('moveend', updateMapCoordinates);
		map.on('zoomend', updateMapCoordinates);

		return () => {
			isUnmounting.current = true;
			map.off('moveend', updateMapCoordinates);
			map.off('zoomend', updateMapCoordinates);
			
			if (onUnmount) {
				onUnmount();
			}

			if(isUnmounting.current) {
				// We close the location modal and info panel when map is unmount
				if (onLocationModalClose && isUnmounting.current) {
					onLocationModalClose();
				}
				if (closePanel) {
					closePanel();
				}
			}
		};
	}, [map, onMapReady, onUnmount, dispatch]);

	return null;
}
