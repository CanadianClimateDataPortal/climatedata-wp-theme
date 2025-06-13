import { useCallback } from 'react';
import { useMap } from '@/hooks/use-map';
import { MAP_MARKER_CONFIG } from '@/lib/constants';
import L from 'leaflet';

export function useMapMarker() {

  const { map, comparisonMap } = useMap();

  const clearMarkers = useCallback(() => {
    [map, comparisonMap].forEach(map => {
      if (map) {
        map.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
      }
    });
  }, [map, comparisonMap]);

  const addMarker = useCallback((latlng: L.LatLng, title: string) => {
    [map, comparisonMap].forEach(map => {
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
  }, [map, comparisonMap]);

  return { addMarker, clearMarkers };
}
