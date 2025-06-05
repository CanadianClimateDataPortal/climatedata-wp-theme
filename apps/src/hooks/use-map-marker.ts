import { useRef, useCallback } from 'react';
import L from 'leaflet';
import { MAP_MARKER_CONFIG } from '@/lib/constants';

export function useMarker(
  mapRef: React.RefObject<L.Map | null>,
  comparisonMapRef: React.RefObject<L.Map | null>
) {
  const currentLocation = useRef<{ latlng: L.LatLng; title: string; id: string } | null>(null);

  const clearMarkers = useCallback(() => {
    [mapRef.current, comparisonMapRef.current].forEach(map => {
      if (map) {
        map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
      }
    });
    currentLocation.current = null;
  }, [mapRef, comparisonMapRef]);

  const addMarker = useCallback((latlng: L.LatLng, title: string, locationId: string) => {
    clearMarkers();
    currentLocation.current = { latlng, title, id: locationId };

    [mapRef.current, comparisonMapRef.current].forEach(map => {
      if (map) {
        const marker = L.marker(latlng, MAP_MARKER_CONFIG)
        .bindTooltip(title, {
          direction: 'top',
          offset: [0, -30],
        })
        .addTo(map);
        marker.getElement()?.classList.add('bounce');
        setTimeout(() => {
          marker.getElement()?.addEventListener(
            'animationend',
            () => marker.getElement()?.classList.remove('bounce'),
            { once: true }
          );
        }, 0);
      }
    });
  }, [clearMarkers, mapRef, comparisonMapRef]);

  return { addMarker, clearMarkers, currentLocation };
}
