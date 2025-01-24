//
// this hook will be used for everything related to leaflet
// eg. importing plugins, patching leaflet, react related fixes, defaults, etc.

import { useEffect, useMemo } from "react";

import "leaflet/dist/leaflet.css";

// import plugins
import "leaflet-search";
import "leaflet.vectorgrid";

import { CANADA_BOUNDS } from "@/lib/constants";

// configs
const defaultGridStyles = {
  line: {
    default: {
      color: "#fff",
      weight: 0.5,
      opacity: 0.6,
    },
    hover: {
      color: "#fff",
      weight: 1,
      opacity: 0.8,
    },
    active: {
      color: "#fff",
      weight: 1,
      opacity: 1,
    },
  },
  fill: {
    default: {
      color: "#fff",
      opacity: 0,
    },
    hover: {
      color: "#fff",
      opacity: 0.2,
    },
    active: {
      color: "#fff",
      opacity: 0.6,
    },
  },
}

const vectorTileLayerStylesCallback = () => ({
  weight: defaultGridStyles.line.default.weight,
  color: defaultGridStyles.line.default.color,
  opacity: defaultGridStyles.line.default.opacity,
  fill: true,
  radius: 4,
  fillOpacity: defaultGridStyles.fill.default.opacity,
})

export function useLeaflet(): { config: any } {
  useEffect(() => {
    // fix for 'fakeStop is not a function' coming from original implementation
    // tracked leaflet issue and tried to mimic the way it was back in 2013
    // see: https://github.com/Leaflet/Leaflet/commit/5a7420dd1a43474cccaa8cdefa4f324452d18f36
    // @ts-ignore: suppress leaflet typescript error
    if (typeof L !== "undefined" && ! L.DomEvent.fakeStop) {
      // @ts-ignore: suppress leaflet typescript error
      L.DomEvent.fakeStop = function (e) {
        e._leaflet_stop = true;
      };
    }
  }, []);

  // default map configuration
  // taken from the WordPress theme at fw-child/resources/js/cdc.js
  // TODO: implement rest of logic that uses and modifies these defaults..
  //  maybe this should be moved elsewhere? it makes this hook grow too big
  // TODO: this should be slice or part of the map-slice since most of this logic should be updated
  //  and constantly read by the app, there's no need for this to be static information.
  // TODO: I would recommend taking the functions created for the previous implementation carefully
  //  since not doing so could cause us to fall into the same complexity.
  const config = useMemo(() => ({
    globals: null, // replace with ajax_data.globals when available
    lang: 'en', // replace with ajax_data.globals.lang when available
    CANADA_BOUNDS,
    grid: {
      markers: {},
      highlighted: null,
      styles: defaultGridStyles,
      leaflet: {
        // @ts-ignore: suppress leaflet typescript error
        rendererFactory: L.canvas.tile,
        interactive: true,
        getFeatureId: (f: any) => f.properties.gid,
        vectorTileLayerStyles: {
          canadagrid: vectorTileLayerStylesCallback,
          canadagrid1deg: vectorTileLayerStylesCallback,
          era5landgrid: vectorTileLayerStylesCallback,
          slrgrid: vectorTileLayerStylesCallback,
          health: null,
          census: null,
          watershed: null,
        },
        bounds: CANADA_BOUNDS,
        maxNativeZoom: 12,
        maxZoom: 12,
        minZoom: 7,
        name: "",
        pane: "grid",
      },
    },
    choro: {
      data: {},
      path: null,
      reset_features: false,
    },
    maps: {},
    station_data: null,
    idf_data: null,
    bdv_data: null,
    normals_data: null,
    ahccd_data: null,
    coords: {
      lat: null,
      lng: null,
      zoom: null,
    },
    first_map: null,
    current_sector: "gridded_data",
    current_dataset: null,
    current_var: null,
    current_var_id: null,
    current_grid: null,
    hooks: {
      "maps.get_layer": Array(1000),
    },
    query: {},
    legend: {},
    chart: {
      object: null,
      series: null,
      legend: null,
      query: null,
      unit: null,
      download_url: null,
    },
    icons: {
      default: null,
      small: null,
    },
    debug: true,
  }), []);

  return { config };
}