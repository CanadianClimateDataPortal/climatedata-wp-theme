import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

import { useAppSelector } from "@/app/hooks";
import { useLeaflet } from "@/hooks/use-leaflet";
import { GEOSERVER_BASE_URL } from "@/lib/constants";

/**
 * InteractiveRegionsLayer Component
 *
 * This component adds an interactive vector grid layer to the map based on the selected `interactiveRegion`.
 *
 * @returns {null}
 */
export default function InteractiveRegionsLayer(): null {
  const map = useMap();

  const interactiveRegion = useAppSelector((state) => state.map.interactiveRegion);

  // TODO: this config here should come from the redux of it is going to be static immutable information from the constants file.
  const { config } = useLeaflet();

  useEffect(() => {
    if (! interactiveRegion || interactiveRegion === "gridded_data") {
      return;
    }

    // event handlers
    const onClick = (e: any) => {
      console.log("clicked:", e.layer.properties);
    }

    // initial setup of the grid layer
    // TODO: there are a lot of other events and settings that need to be ported over from the JS version
    // @ts-ignore: suppress leaflet typescript error
    const vectorGridLayer = L.vectorGrid.protobuf(
      `${GEOSERVER_BASE_URL}/geoserver/gwc/service/tms/1.0.0/CDC:${interactiveRegion}/{z}/{x}/{-y}.pbf`,
      config.grid.leaflet
    );

    // attaching event handlers and adding the layer to the map
    vectorGridLayer
    .on("click", onClick)
    .addTo(map);

    return () => {
      // clean up the layer when the component unmounts
      map.removeLayer(vectorGridLayer);
    };
  }, [interactiveRegion, map, config]);

  return null;
}