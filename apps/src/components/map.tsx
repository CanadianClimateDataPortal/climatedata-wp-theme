import { MapContainer, TileLayer } from "react-leaflet";

import MapLegend from "@/components/map-layers/map-legend";
import VariableLayer from "@/components/map-layers/variable";
import CustomPanesLayer from "@/components/map-layers/custom-panes";
import InteractiveRegionsLayer from "@/components/map-layers/interactive-regions";
import ZoomControl from "@/components/map-layers/zoom-control";
import MapEvents from "@/components/map-layers/map-events";
import SearchControl from "@/components/map-layers/search-control";

import { CANADA_CENTER, DEFAULT_ZOOM, DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM } from '@/lib/constants';
import { useAppSelector } from "@/app/hooks";

/**
 * Renders a Leaflet map, including custom panes and tile layers.
 */
export default function Map({ onMapReady, onUnmount }: {
  onMapReady: (map: L.Map) => void;
  onUnmount?: () => void;
}) {
  const labelsOpacity = useAppSelector(state => state.map.opacity.labels);
  return (
    <MapContainer
      center={CANADA_CENTER}
      zoomControl={false}
      zoom={DEFAULT_ZOOM}
      minZoom={DEFAULT_MIN_ZOOM}
      maxZoom={DEFAULT_MAX_ZOOM}
      scrollWheelZoom={true}
      className="h-screen"
    >
      <MapEvents onMapReady={onMapReady} onUnmount={onUnmount} />
      <MapLegend />
      <CustomPanesLayer />
      <InteractiveRegionsLayer />
      <VariableLayer />
      <ZoomControl />
      <SearchControl />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Basemap TileLayer */}
      <TileLayer
        url="//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution=""
        subdomains="abcd"
        pane="basemap"
        maxZoom={DEFAULT_MAX_ZOOM}
      />

      {/* Labels TileLayer */}
      <TileLayer
        url="//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
        pane="labels"
        opacity={labelsOpacity}
      />
    </MapContainer>
  );
}
