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

import MapLegendControl from '@/components/map-legend-control';
import MapLegendControlS2D from '@/components/map-legend-control-s2d';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useColorMap } from '@/hooks/use-color-map';
import { ColourType } from '@/types/climate-variable-interface';
import { MapDisplayType } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';
import { useAppSelector } from '@/app/hooks';
import S2DClimateVariable from '@/lib/s2d-climate-variable';

const LazyMapLegendInnerS2D = lazy(() => import('@/components/map-layers/map-legend-inner-s2d'));


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
	const colourScheme = climateVariable?.getColourScheme();
	const isDelta = climateVariable?.getDataValue() === 'delta';
	const unit = climateVariable?.getUnitLegend();
	const legendConfig =
		climateVariable?.getLegendConfig(isDelta ? MapDisplayType.DELTA : MapDisplayType.ABSOLUTE) ??
		undefined;
	let isCategorical = climateVariable?.getColourType() !== ColourType.CONTINUOUS;

	// For the default colour palette, isCategorical defaults to the default legend's type
	if ((colourScheme === null || colourScheme === 'default') && legendData && legendData.Legend) {
		const type = legendData.Legend[0]?.rules?.[0]?.symbolizers?.[0]?.Raster?.colormap?.type;
		isCategorical = (type === ColourType.DISCRETE);
	}

	const rootRef = useRef<Root | null>	(null);

	/**
	 * This is temporary until we do this the way the rest of the code expects.
	 */
	const isConditionForClim1197 = (() => {
		const fd = climateVariable?.getForecastDisplay();
		const isForecastDisplay = fd === 'forecast';
		const isS2D = climateVariable instanceof S2DClimateVariable;
		return isForecastDisplay === true && isS2D === true;
	})(/* @TODO Make this condition written the usual way */);

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

		if (isConditionForClim1197) {
			rootRef.current.render(
				<MapLegendControlS2D
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
				>
					<Suspense fallback={'...'}>
						<LazyMapLegendInnerS2D />
					</Suspense>
				</MapLegendControlS2D>
			);
			return;
		}

		if (!colorMap) {
			rootRef.current.render(<></>);
			return;
		}

		const colourType = colorMap.type;

		rootRef.current.render(
			<MapLegendControl
				data={colorMap}
				opacity={mapData}
				isOpen={isOpen}
				toggleOpen={() => setIsOpen((prev) => !prev)}
				isCategorical={isCategorical}
				isDelta={isDelta}
				colourType={colourType}
				unit={unit}
				legendConfig={legendConfig}
				locale={locale}
			/>
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
		isConditionForClim1197,
	]);

	return null;
};

export default MapLegend;
