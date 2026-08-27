import L from 'leaflet';
import type { LatLngExpression, LatLngBounds } from 'leaflet';

type WmsParam = { SLD_BODY: string, layers: string };

const getBaseTileUrl = (): string => {
	const baseUrl = '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png';

	// The API key is obtained from https://carto.com/basemaps/apikey/, and was added as a requirement by CARTO
	// for tile requests in August 2026.
	// They have a free usage limit of 5 million monthly tile requests.
	// To be determined if we would need to find an alternative solution eventually.
	const cartoKey = (window as Window & { CARTO_BASEMAPS_API_KEY?: string }).CARTO_BASEMAPS_API_KEY?.trim();

	return cartoKey ? `${baseUrl}?key=${encodeURIComponent(cartoKey)}` : baseUrl;
};

// Common map configuration
export const MAP_CONFIG = {
	// Center coordinates for Canada
	center: [62.51231793838694, -98.48144531250001] as LatLngExpression,

	// Canada bounds
	bounds: L.latLngBounds(
		L.latLng(41, -141.1),
		L.latLng(83.6, -49.9)
	) as LatLngBounds,

	// Zoom settings
	zoom: 4,
	minZoom: 3,
	maxZoom: 11,

	// Base tiles
	baseTileUrl: getBaseTileUrl(),

	// Labels tiles
	labelsTileUrl: "//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",

	// Landmass filter for marine data (transforms green to white)
	landmassFilter: 'saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(298deg) brightness(100%) contrast(98%)',

	// Opacity settings for overlays
	defaultOpacity: 1.0,

	// World bounds (wider than Canada bounds)
	worldBounds: L.latLngBounds(
		L.latLng(-60, -180),
		L.latLng(85, 180)
	) as LatLngBounds
};

// Layer keys for WMS services
export const LAYER_KEYS = {
	landmass: "CDC:landmass"
};

// SLD definitions to style WMS landmass layer for sea level
// @see: https://docs.geoserver.org/main/en/user/styling/sld/cookbook/lines.html#example-lines-layer
export const SLD_STYLES = {
	landmass: `<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0"
	xmlns="http://www.opengis.net/sld"
	xmlns:sld="http://www.opengis.net/sld"
	xmlns:ogc="http://www.opengis.net/ogc"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<sld:NamedLayer>
		<sld:Name>CDC:landmass</sld:Name>
		<sld:UserStyle>
			<sld:Title>Light Gray Landmass</sld:Title>
			<sld:FeatureTypeStyle>
				<sld:Rule>
					<sld:PolygonSymbolizer>
						<sld:Fill>
							<sld:CssParameter name="fill">#FAFAF8</sld:CssParameter>
						</sld:Fill>
						<sld:Stroke>
							<sld:CssParameter name="stroke">#EEE0DF</sld:CssParameter>
							<sld:CssParameter name="stroke-width">0.75</sld:CssParameter>
							<sld:CssParameter name="stroke-dasharray">2 2</sld:CssParameter>
						</sld:Stroke>
					</sld:PolygonSymbolizer>
				</sld:Rule>
			</sld:FeatureTypeStyle>
		</sld:UserStyle>
	</sld:NamedLayer>
</sld:StyledLayerDescriptor>`
};

export const WMS_PARAMS: { landmass: WmsParam } = {
	landmass: { SLD_BODY: SLD_STYLES.landmass, layers: '' }
};
