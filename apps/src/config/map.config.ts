import L from 'leaflet';
import type { LatLngExpression, LatLngBounds } from 'leaflet';

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
	baseTileUrl: "//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png",
	
	// Labels tiles
	labelsTileUrl: "//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
	
	// Pane configuration for standard variables
	standardPanes: {
		basemap: 200,
		raster: 300,
		grid: 350,
		labels: 360,
		stations: 370,
		custom_shapefile: 700
	},
	
	// Pane configuration for sea level variable
	seaLevelPanes: {
		raster: 100,         // Ocean data (below land)
		grid: 150,           // Interactive regions
		basemap: 200,        // Landmass layer
		labels: 250,         // Map labels
		custom_shapefile: 300
	},
	
	// Combined pane configuration for sea level with standard map underneath
	combinedSeaLevelPanes: {
		standardBasemap: 100,  // Standard map base layer
		raster: 200,           // Ocean data layer
		grid: 300,             // Interactive regions
		seaLevelBasemap: 400,  // Sea level landmass (transparent ocean)
		labels: 500,           // Map labels
		custom_shapefile: 600
	},
	
	// Landmass filter for sea level (transforms green to white)
	landmassFilter: 'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(298deg) brightness(102%) contrast(102%)',
	
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
