import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * CustomPanesLayer Component
 *
 * This component modifies the map instance creating predefined panes for different types of layers.
 *
 * @returns {null}
 */
export default function CustomPanesLayer(): null {
  const map = useMap();

  useEffect(() => {
    // Used for the primary map tiles or base layers.
    // Non-interactive with the lowest z-index to ensure it's below other elements.
    map.createPane("basemap");
    map.getPane("basemap")!.style.zIndex = "200";
    map.getPane("basemap")!.style.pointerEvents = "none";

    // Used for raster overlays.
    // Non-interactive and positioned above the basemap.
    map.createPane("raster");
    map.getPane("raster")!.style.zIndex = "300";
    map.getPane("raster")!.style.pointerEvents = "none";

    // Interactive layer used for displaying grid lines or similar overlays.
    // Positioned above raster layers and supports pointer events.
    map.createPane("grid");
    map.getPane("grid")!.style.zIndex = "350";
    map.getPane("grid")!.style.pointerEvents = "all";

    // Used for non-interactive text or label overlays.
    // Positioned above the grid layer for clarity and visibility.
    map.createPane("labels");
    map.getPane("labels")!.style.zIndex = "360";
    map.getPane("labels")!.style.pointerEvents = "none";

    // Interactive layer for displaying station markers or similar point data.
    // Positioned above the labels layer and supports pointer events.
    map.createPane("stations");
    map.getPane("stations")!.style.zIndex = "370";
    map.getPane("stations")!.style.pointerEvents = "all";

    // Interactive layer for custom shapefile data.
    // Highest z-index to ensure it overlays all other layers, and supports pointer events.
    map.createPane("custom_shapefile");
    map.getPane("custom_shapefile")!.style.zIndex = "700";
    map.getPane("custom_shapefile")!.style.pointerEvents = "all";
  }, [map]);

  return null;
}