/**
 * This component will handle lifecycle events for the map instance.
 * It triggers callback functions when the map is ready and when it is unmounted.
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

import { MapEventsProps } from '@/types/types';

export default function MapEvents({
	onMapReady,
	onUnmount,
}: MapEventsProps): null {
	const map = useMap();

	useEffect(() => {
		if (onMapReady) {
			onMapReady(map);
		}

		return () => {
			if (onUnmount) {
				onUnmount();
			}
		};
	}, [map, onMapReady, onUnmount]);

	return null;
}
