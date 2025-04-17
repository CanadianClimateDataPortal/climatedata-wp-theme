/**
 * This component will handle lifecycle events for the map instance.
 * It triggers callback functions when the map is ready and when it is unmounted.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { MapEventsProps } from '@/types/types';

export default function MapEvents({
	onMapReady,
	onUnmount,
	onLocationModalClose,
}: MapEventsProps): null {
	const map = useMap();
	const isUnmounting = useRef(false);
	const { closePanel } = useAnimatedPanel();

	useEffect(() => {
		if (onMapReady) {
			onMapReady(map);
		}

		return () => {
			isUnmounting.current = true;
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
	}, [map, onMapReady, onUnmount]);

	return null;
}
