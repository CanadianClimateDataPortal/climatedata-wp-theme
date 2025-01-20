import { useEffect, useState } from 'react';
import L from "leaflet";
import { useMap } from "react-leaflet";

import { fetchLegendData } from "@/services/services";
import { TransformedLegendEntry } from "@/types/types";

export default function MapLegend() {
  const map = useMap();
  const [legendData, setLegendData] = useState<TransformedLegendEntry[] | null>(null);

  useEffect(() => {
    fetchLegendData().then((data) => setLegendData(data));
  }, []);

  useEffect(() => {
    // @ts-ignore: suppress leaflet typescript error
    const legend = new L.Control({ position: 'topright' });

    legend.onAdd = () => {
      // @ts-ignore: suppress leaflet typescript error
      const div = L.DomUtil.create('div', 'info legend legendTable');
      const LEGEND_ITEM_HEIGHT = 25,
        LEGEND_ITEM_WIDTH = 25,
        LEGEND_WIDTH = 200;

      let svg = `<svg width="${LEGEND_WIDTH}" height="${legendData ? LEGEND_ITEM_HEIGHT * legendData.length : 0}" class="mt-16">`;
      svg +=
        '<defs><linearGradient id="temperatureGradient" gradientTransform="rotate(90)">';
      legendData?.forEach((entry, index) => {
        const offset = (index / (legendData.length - 1)) * 100;
        svg += `<stop offset="${offset}%" stop-color="${entry.color}" stop-opacity="${entry.opacity}"/>`;
      });
      svg += '</linearGradient></defs>';
      // Create gradient rectangle
      svg += `<rect width="${LEGEND_ITEM_WIDTH}" height="${legendData ? LEGEND_ITEM_HEIGHT * legendData.length : 0}" fill="url(#temperatureGradient)" />`;

      // Add temperature labels
      legendData?.forEach((entry, index) => {
        const y = LEGEND_ITEM_HEIGHT * index + LEGEND_ITEM_HEIGHT / 2;
        svg += `<text x="35" y="${y}" fill="black" font-size="14" dominant-baseline="middle">${entry.label}</text>`;
        svg += `<line x1="30" y1="${y}" x2="33" y2="${y}" stroke="black" stroke-width="1"/>`;
      });

      svg += '</svg>';

      div.innerHTML = svg;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, legendData]);


  return null;
}
