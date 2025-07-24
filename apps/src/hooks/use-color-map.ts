import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { ColourType } from "@/types/climate-variable-interface";
import { generateColourScheme } from "@/lib/colour-scheme";
import { findCeilingIndex } from '@/lib/utils.ts';

export function useColorMap() {
  const { legendData } = useAppSelector((state) => state.map);
  const { climateVariable } = useClimateVariable();

  // Convert legend data to a color map
  const colorMap = useMemo(() => {
    if (!legendData || !legendData.Legend) {
      return null;
    }

    const legendColourMapEntries =
      legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap
        ?.entries ?? [];

    if (climateVariable) {
      const customColourScheme = generateColourScheme(climateVariable);
      if (customColourScheme) {
        return {
          colours: customColourScheme.colours ?? [],
          quantities: customColourScheme.quantities ?? [],
          schemeType: climateVariable?.getColourType() ?? ColourType.CONTINUOUS,
          isDivergent: customColourScheme.isDivergent ?? false,
        };
      }
    }

    // Fallback to default map colours
    return {
      colours: legendColourMapEntries.map((entry) => entry.color) ?? [],
      quantities: legendColourMapEntries.map((entry) => Number(entry.quantity)) ?? [],
      schemeType: ColourType.DISCRETE,
      isDivergent: false,
    };
  }, [climateVariable, legendData]);

  // Color interpolation function
  const interpolate = useCallback(
    (color1: string, color2: string, ratio: number) => {
      ratio = Math.max(0, Math.min(1, ratio));

      const hexToRgb = (hex: string) =>
        hex
          .replace(/^#/, '')
          .match(/.{1,2}/g)!
          .map((x) => parseInt(x, 16));

      const rgbToHex = ([r, g, b]: number[]) =>
        `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;

      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);

      const interpolatedRgb = rgb1.map((c, i) =>
        Math.round(c + (rgb2[i] - c) * ratio)
      );

      return rgbToHex(interpolatedRgb);
    },
    []
  );

  // Get color for a value
  const getColor = useCallback(
    (value: number) => {
      if (!colorMap || !colorMap.quantities || !colorMap.colours) {
        return '#fff';
      }

      const { colours, quantities, schemeType } = colorMap;

      const index = findCeilingIndex(quantities, value);

      // Use last color if value is greater than all
      if (index === -1) {
        return colours[colours.length - 1];
      }

      // Use first color if value is lowest
      if (index === 0) {
        return colours[0];
      }

      // For discrete type, return exact match
      if (schemeType === ColourType.DISCRETE) {
        return colours[index];
      }

      // For continuous type, interpolate between colors
      const ratio =
        (value - quantities[index - 1]) /
        (quantities[index] - quantities[index - 1]);

      return interpolate(colours[index - 1], colours[index], ratio);
    },
    [colorMap, interpolate]
  );

  return {
    colorMap,
    getColor,
    interpolate
  };
}
