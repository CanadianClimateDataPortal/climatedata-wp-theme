import { useCallback, useRef, useState, useEffect } from 'react';
import L from 'leaflet';

import { useAppDispatch } from '@/app/hooks';
import { addRecentLocation } from '@/features/map/map-slice';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useMapMarker } from '@/hooks/use-map-marker';
import { useLocale } from '@/hooks/use-locale';
import { fetchLocationByCoords } from '@/services/services';
import { getFeatureId } from '@/lib/utils';
import { SelectedLocationInfo } from '@/types/types';
import { InteractiveRegionOption } from "@/types/climate-variable-interface";

export interface UseMapInteractionsProps {
  primaryLayerRef: React.MutableRefObject<any>;
  comparisonLayerRef: React.MutableRefObject<any>;
}

export function useMapInteractions({ primaryLayerRef, comparisonLayerRef }: UseMapInteractionsProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationInfo | null>(null);
  const { climateVariable } = useClimateVariable();
  const { locale } = useLocale();
  const dispatch = useAppDispatch();
  const { addMarker, clearMarkers } = useMapMarker();
  const hoveredRef = useRef<number | null>(null);
  const selectedInteractiveRegion = useRef<InteractiveRegionOption | null>(climateVariable?.getInteractiveRegion() || null);
	const variableId = climateVariable?.getId();

  const handleOver = useCallback((
    e: { latlng: L.LatLng; layer: { properties: any } },
    getFeatureColor: (featureId: number) => string
  ) => {
    const featureId = e.layer.properties.id ?? e.layer.properties.gid;
    if (featureId == null) {
      return;
    }

    hoveredRef.current = featureId;

    const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

    const style = {
      fill: true,
      fillColor: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA
        ? '#fff'
        : getFeatureColor(featureId),
      fillOpacity: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 0.2 : 1,
      weight: 1.5,
      color: '#fff',
    };

    [primaryLayerRef, comparisonLayerRef].forEach(ref => {
      if (ref.current) {
        ref.current.setFeatureStyle(featureId, style);
      }
    });
  }, [climateVariable, primaryLayerRef, comparisonLayerRef]);

  const handleOut = useCallback(() => {
    [primaryLayerRef, comparisonLayerRef].forEach(ref => {
      if (ref.current && hoveredRef.current !== null) {
        ref.current.resetFeatureStyle(hoveredRef.current);
      }
    });

    hoveredRef.current = null;
  }, [primaryLayerRef, comparisonLayerRef]); // No dependencies since we're only using refs via .current

  const handleClick = useCallback(async ({ latlng, layer }: { latlng: L.LatLng; layer: { properties: any } }) => {
    const featureId = layer && getFeatureId(layer.properties);

    const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

    const locationByCoords = await fetchLocationByCoords(latlng);
    const locationId = locationByCoords?.geo_id ?? `${locationByCoords?.lat}|${locationByCoords?.lng}`;
    let locationTitle = locationByCoords.title;

		// For non-gridded data, try to get the title from the layer properties, if available.
    if (interactiveRegion !== InteractiveRegionOption.GRIDDED_DATA) {
			if (layer) {
				if (locale === 'en') {
					locationTitle = layer.properties.label_en ?? '';
				} else if (locale === 'fr') {
					locationTitle = layer.properties.label_fr ?? '';
				}
			}
    }

    clearMarkers();
    addMarker(latlng, locationTitle);

    dispatch(addRecentLocation({
      id: locationId,
      title: locationTitle,
      ...latlng,
    }));

    setSelectedLocation({ featureId: featureId ?? 0, title: locationTitle, latlng });
  }, [clearMarkers, addMarker, dispatch, climateVariable, locale]);

  const handleClearSelectedLocation = useCallback(() => {
    setSelectedLocation(null);
    clearMarkers();
  }, [clearMarkers]);

  // Effect to handle location updates when climate variables change
  useEffect(() => {
    const interactiveRegion = climateVariable?.getInteractiveRegion() ?? null;

    // Check if interactive region actually changed
    const interactiveRegionChanged = interactiveRegion !== selectedInteractiveRegion.current;
    selectedInteractiveRegion.current = interactiveRegion;

    // Reset markers and selected location when the interactive region changes
    if (interactiveRegionChanged) {
      handleClearSelectedLocation();
      return;
    }

    // If we have a selected location and variable changed, update the data
    if (selectedLocation) {
      setSelectedLocation(selectedLocation);
    }
  }, [
    climateVariable?.getInteractiveRegion(),
    climateVariable?.getScenario(),
    climateVariable?.getScenarioCompareTo(),
    handleClearSelectedLocation,
    setSelectedLocation
  ]);

	useEffect(() => {
		// Clear selections whenever the variable changes.
		handleClearSelectedLocation();
	}, [handleClearSelectedLocation, variableId]);

  return {
    selectedLocation,
    handleOver,
    handleOut,
    handleClick,
    handleClearSelectedLocation,
  };
}
