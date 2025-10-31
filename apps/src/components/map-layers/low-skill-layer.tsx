import React, { useEffect, useMemo, useRef } from 'react';
import { CANADA_BOUNDS, GEOSERVER_BASE_URL } from '@/lib/constants';
import { WMSTileLayer } from 'react-leaflet';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useS2D } from '@/hooks/use-s2d';
import { useAppSelector } from '@/app/hooks';
import { selectLowSkillVisibility } from '@/features/map/map-slice';
import { buildSkillLayerName, buildSkillLayerTime } from '@/lib/s2d';
import L from 'leaflet';

interface LowSkillLayerProps {
	pane: string;
}

/**
 * Leaflet layer for the "low skill".
 */
const LowSkillLayer = ({
	pane,
}: LowSkillLayerProps): React.ReactElement | null => {
	const { climateVariable } = useClimateVariable();
	const { releaseDate } = useS2D();
	const isLowSkillMasked = !useAppSelector(selectLowSkillVisibility());
	const {
		opacity: { mapData },
	} = useAppSelector((state) => state.map);
	const layerRef = useRef<L.TileLayer.WMS | null>(null);
	let layerName: string | null = null;
	let timeValue: string | null = null;

	if (climateVariable && releaseDate) {
		layerName = buildSkillLayerName(climateVariable, releaseDate);
		timeValue = buildSkillLayerTime(climateVariable, releaseDate);
	}

	// Update the opacity on the *existing* layer if it exists. We do it like
	// that because we don't want a change in opacity to recreate the layer.
	// Instead, we want to update the existing layer (else it creates flashing
	// effects when changing the opacity).
	useEffect(() => {
		if (layerRef.current) {
			layerRef.current.setOpacity(mapData);
		}
	}, [mapData]);

	// We use a `useMemo` here, because else the layer is recreated every time
	// any climate variable attributes change, and each "redraw" causes visual
	// flashes on the map. Instead, we want to redraw only when some specific
	// attributes change.
	return useMemo(
		() => {
			if (isLowSkillMasked || !layerName || !timeValue) {
				return null;
			}

			return (
				<WMSTileLayer
					ref={layerRef}
					key={`${layerName}_${timeValue}`}
					url={`${GEOSERVER_BASE_URL}/geoserver/wms`}
					layers={layerName}
					format="image/png"
					transparent={true}
					version="1.3.0"
					pane={pane}
					bounds={CANADA_BOUNDS}
					opacity={mapData}
					params={{
						// @ts-expect-error - The TIME attribute is not in the type definition, but it's valid
						TIME: timeValue,
					}}
				/>
			);
		},
		// About the eslint-disable-next-line:
		// mapData is not included here, even if it's used, because we
		// don't want a change in opacity to recreate the layer (the useEffect
		// above takes care of that). But we still use it as an initial value.
		//
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[pane, isLowSkillMasked, layerName, timeValue]
	);
};

export default LowSkillLayer;
