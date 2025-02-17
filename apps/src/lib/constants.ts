import L from 'leaflet';
import type { LatLngExpression, LatLngBounds } from 'leaflet';

export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export const GEOSERVER_BASE_URL: string = 'https://dataclimatedata.crim.ca';
// TODO: this should probably be a L.latLng object instead
export const CANADA_CENTER: LatLngExpression = [
	62.51231793838694, -98.48144531250001,
];
export const CANADA_BOUNDS: LatLngBounds = L.latLngBounds(
	L.latLng(41, -141.1),
	L.latLng(83.6, -49.9)
);

export const DEFAULT_ZOOM: number = 4;
export const DEFAULT_MIN_ZOOM: number = 3;
export const DEFAULT_MAX_ZOOM: number = 11;

/**
 * "29" as the length of the year window. Used in the timeControl slider component
 */
export const SLIDER_YEAR_WINDOW_SIZE: number = 29;
export const SLIDER_MIN_YEAR: number = 1950;
export const SLIDER_MAX_YEAR: number = 2100;
export const SLIDER_STEP: number = 1;
export const SLIDER_DEFAULT_YEAR_VALUE: number = 1971;

export const SEARCH_PLACEHOLDER: string =
	'Zoom to a location, region, city, coordinates...';
export const SEARCH_DEFAULT_ZOOM: number = 10;
export const MAP_SEARCH_URL: string = '/wp-json/cdc/v2/location_search/?q={s}';
export const OWS_FORMAT: string = 'image/png';
