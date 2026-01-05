import React, {
	lazy,
	Suspense,
	useEffect,
	useRef,
	useState,
} from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import MapLegendOpenControl from '@/components/map-layers/map-legend-open-control';

import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useColorMap } from '@/hooks/use-color-map';
import {
	ColourType,
	ForecastDisplays,
} from '@/types/climate-variable-interface';
import { MapDisplayType } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';
import { useAppSelector } from '@/app/hooks';
import { useS2D } from '@/hooks/use-s2d';

import type { MapLegendForecastS2D } from '@/components/map-layers/map-legend-forecast-s2d';
import type { MapLegendCommon, MapLegendCommonProps } from '@/components/map-layers/map-legend-common';

const LazyMapLegendForecastS2D = lazy<MapLegendForecastS2D>(() => import('@/components/map-layers/map-legend-forecast-s2d'));
const LazyMapLegendCommon = lazy<React.MemoExoticComponent<MapLegendCommon>>(() => import('@/components/map-layers/map-legend-common'));


const MapLegend: React.FC = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const map = useMap();
	const { locale } = useLocale();
	const { climateVariable } = useClimateVariable();
	const { colorMap } = useColorMap();
	const {
		opacity: { mapData }
	} = useAppSelector((state) => state.map);

	const { legendData } = useAppSelector((state) => state.map);
	const { isS2DVariable } = useS2D();
	const colourScheme = climateVariable?.getColourScheme();
	const isDelta = climateVariable?.getDataValue() === 'delta';
	const unit = climateVariable?.getUnitLegend();
	const legendConfig =
		climateVariable?.getLegendConfig(isDelta ? MapDisplayType.DELTA : MapDisplayType.ABSOLUTE) ??
		undefined;
	let isCategorical = climateVariable?.getColourType() !== ColourType.CONTINUOUS;
	const forecastDisplay = climateVariable?.getForecastDisplay();
	const forecastType = climateVariable?.getForecastType();
	const variableName = climateVariable?.getTitle();

	// Whether to show the regular legend or the S2D forecast legend
	const showForecastLegendOfS2D = isS2DVariable && forecastDisplay === ForecastDisplays.FORECAST;
	const showClimatologyLegendOfS2D = isS2DVariable && forecastDisplay == ForecastDisplays.CLIMATOLOGY;

	// For the default colour palette, isCategorical defaults to the default legend's type
	if ((colourScheme === null || colourScheme === 'default') && legendData && legendData.Legend) {
		const type = legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.type;
		isCategorical = (type === ColourType.DISCRETE);
	}

	const rootRef = useRef<Root | null>	(null);

	/**
	 * Open legend by default when the map container has space for legend.
	 * Legend max width is 430px (MapLegendOpenControl.MAX_LEGEND_WIDTH)
	 * Only check on the initial mount, no resize handling needed.
	 */
	useEffect(() => {
		if (!map) {
			return;
		}
		const container = map.getContainer();
		const { width } = container.getBoundingClientRect();
		const shouldBeOpen = width >= MapLegendOpenControl.maxLegendWidth * 1.5;
		setIsOpen(shouldBeOpen);
	}, [map]);

	/**
	 * This hook creates the legend control once the map is ready. It only
	 * creates the control, the content of the legend itself is rendered by
	 * another hook (below) that depends on other attributes.
	 */
	useEffect(() => {
		if (!map) {
			return;
		}

		const legend = new L.Control({ position: 'topright' });

		legend.onAdd = () => {
			const container = L.DomUtil.create(
				'div',
				'legend-wrapper top-[9rem] md:top-24 right-5 m-0 !mt-1.5 z-30'
			);
			rootRef.current = createRoot(container);

			// prevent interactions from affecting the map
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.disableScrollPropagation(container);

			return container;
		};

		legend.addTo(map);

		return () => {
			try {
				rootRef.current?.unmount();
			} finally {
				legend.remove();
				rootRef.current = null;
			}

		};
	}, [map]);

	/**
	 * This hook renders the legend content inside the legend control container
	 * (created in the previous hook).
	 */
	useEffect(() => {
		if (!rootRef.current) {
			return;
		}

		if (!colorMap) {
			rootRef.current.render(<></>);
			return;
		}

		if (showForecastLegendOfS2D) {
			rootRef.current.render(
				<MapLegendOpenControl
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
				>
					<Suspense fallback={'...'}>
						<LazyMapLegendForecastS2D
							data={colorMap}
							opacity={mapData}
							variableName={variableName}
							forecastType={forecastType}
						/>
					</Suspense>
				</MapLegendOpenControl>
			);
			return;
		}

		const colourType = colorMap.type;

		let title: MapLegendCommonProps['title'] = void 0;
		let tooltipContents: MapLegendCommonProps['tooltipContents'] = void 0;
		if (showClimatologyLegendOfS2D) {
			// Thus far, only in the situation of S2D Climatology we've needed a title and tooltip.
			title = __('Historical median');
			tooltipContents = __('Historical median from the 1991 to 2020 historical climatology.');
		}

		rootRef.current.render(
			<MapLegendOpenControl
				isOpen={isOpen}
				toggleOpen={() => setIsOpen((prev) => !prev)}
				width={100}
			>
				<Suspense fallback={'...'}>
					<LazyMapLegendCommon
						data={colorMap}
						opacity={mapData}
						isCategorical={isCategorical}
						isDelta={isDelta}
						colourType={colourType}
						unit={unit}
						legendConfig={legendConfig}
						locale={locale}
						title={title}
						tooltipContents={tooltipContents}
					/>
					</Suspense>
			</MapLegendOpenControl>
		);
	}, [
		colorMap,
		mapData,
		isOpen,
		isCategorical,
		legendConfig,
		isDelta,
		unit,
		locale,
		forecastType,
		showForecastLegendOfS2D,
		showClimatologyLegendOfS2D,
		variableName,
	]);

	return null;
};

export default MapLegend;
