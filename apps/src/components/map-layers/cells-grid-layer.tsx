import React, { useEffect, useRef } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';

import { useAppSelector } from '@/app/hooks';
import { doyFormatter } from '@/lib/format';
import { remToPx } from '@/lib/utils';

import {
	fetchDeltaValues,
	fetchLocationByCoords,
	generateChartData,
} from '@/services/services';
import { PercentileData } from '@/types/types';
import {
	DEFAULT_MAX_ZOOM,
	SIDEBAR_WIDTH,
	SCENARIO_NAMES,
} from '@/lib/constants';

/**
 * Mouse over event handler logic:
 * map.js line 843
 *
 * Grid layer for gridded_data sector:
 * cdc.js line 623
 */
const CellsGridLayer: React.FC = () => {
	const map = useMap();

	const { __ } = useI18n();

	const { togglePanel } = useAnimatedPanel();

	// @ts-expect-error: suppress leaflet typescript error
	const gridLayerRef = useRef<L.VectorGrid | null>(null);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hoveredCellRef = useRef<number | null>(null);

	const {
		variable,
		dataset,
		decade,
		frequency,
		interactiveRegion,
		emissionScenario,
	} = useAppSelector((state) => state.map);

	useEffect(() => {
		// TODO: these should not be hardcoded.. we want to revisit once we get the data from the API
		const options = {
			lang: 'en',
			query: {
				var_id: '311',
				delta: '',
			},
			var_data: {
				'311': {
					acf: {
						hasdelta: true,
						decimals: '1',
						units: 'kelvin',
					},
				},
			},
		};

		// units of the value (ex: 'kelvin' or 'doy' for day-of-year)
		const units =
			options.var_data[
				options.query.var_id as keyof typeof options.var_data
			]?.acf?.units ?? '';

		// number of decimals to truncate to
		const decimals = parseInt(
			options.var_data[
				options.query.var_id as keyof typeof options.var_data
			]?.acf?.decimals ?? '0'
		);

		// if true, the value is formatted as a delta
		const delta = options.query.delta;

		// TODO: this should not be a static value, because it needs to work also in other environments other than prod
		const geoserverUrl = '//dataclimatedata.crim.ca';

		const gridName = 'canadagrid';

		// Helper method to convert temperatures from Celsius to Kelvin
		const convertToKelvin = (value: number) => {
			return value + 273.15;
		};

		// Helper function to convert Kelvin to Celsius
		const convertToCelsius = (value: number) => {
			return value - 273.15;
		};

		// Helper method to extract percentile values and handle Kelvin conversion
		const getPercentileValues = (data: Record<string, PercentileData>) => {
			// RCP scenario selection
			const datasetKey = dataset as keyof typeof SCENARIO_NAMES;
			const emissionKey =
				emissionScenario as keyof (typeof SCENARIO_NAMES)[keyof typeof SCENARIO_NAMES];

			const rcp = SCENARIO_NAMES[datasetKey][emissionKey]
				.replace(/[\W_]+/g, '')
				.toLowerCase();

			const values = {
				p10: data[rcp]?.p10 || 0,
				p50: data[rcp]?.p50 || 0,
				p90: data[rcp]?.p90 || 0,
			};

			// for temperatures, units are in Kelvin, but values are received in °C. We reconvert them to Kelvin.
			if (units === 'kelvin' && !delta) {
				Object.keys(values).forEach((key) => {
					const typedKey = key as keyof typeof values;
					values[typedKey] = convertToKelvin(values[typedKey]);
				});
			}

			return values;
		};

		// Helper method to generate the median span
		const generateMedianSpan = (medianValue: number) => {
			const formattedValue = valueFormatter(medianValue);
			return `<span style="color:#00F">●</span> ${__('Median')} <b>${formattedValue}</b><br/>`;
		};

		// Helper method to generate the range span
		const generateRangeSpan = (
			rangeStartValue: number,
			rangeEndValue: number
		) => {
			const rangeStart = valueFormatter(rangeStartValue);
			const rangeEnd = valueFormatter(rangeEndValue);
			return `<span style="color:#00F">●</span> ${__('Range')} <b>${rangeStart}</b> ${__('to')} <b>${rangeEnd}</b><br/>`;
		};

		const valueFormatter = (value: number) => {
			const lang = options.lang;

			let unit = units;

			// convert Kelvin to Celsius if needed
			if (unit === 'kelvin') {
				unit = '°C';
				value = delta ? value : convertToCelsius(value); // adjust for delta or non-delta values
			}

			if (!unit) {
				unit = ''; // default to no unit if undefined
			}

			let str = '';

			// add a "+" sign for positive delta values
			if (delta && value > 0) {
				str += '+';
			}

			// handle different units
			switch (units) {
				case 'doy':
					if (delta) {
						str += value.toFixed(decimals); // truncate to the specified number of decimals
						str += ` ${__('days')}`;
					} else {
						str += doyFormatter(value, lang); // use the day-of-year formatter
					}
					break;

				default:
					str += value.toFixed(decimals); // truncate to the specified number of decimals
					str += ` ${unit}`;
					break;
			}

			// TODO: the original implementation applies some localization using a `unitLocalize` function to
			//  this string, but for the current use case it's not needed as `str` is just a temp number + unit string
			return str;
		};

		/**
		 * Helper function to format tooltips
		 *
		 * @param data Data sent by climatedata-api ( get-delta-30y-gridded-values or get-delta-30y-regional-values)
		 * @param event Javascript event that triggered the grid_hover
		 */
		const formatGridHoverTooltip = (
			data: Record<string, PercentileData>,
			event: unknown
		) => {
			const tip = [];

			// TODO: keep for now because it may be used for other cases, when properties has anything other than the gid
			void event;
			// console.log('PROPS', event.layer.properties)
			// add label from layer properties if available
			// if (event.layer.properties.hasOwnProperty(l10nLabels.labelField)) {
			//   tip.push(`${event.layer.properties[l10nLabels.labelField]}<br>`);
			// }

			// console.log(data, rcp)

			// get percentile values (p10, p50, p90) with temperature conversion if needed
			const values = getPercentileValues(data);

			// generate tooltip span elements
			tip.push(generateMedianSpan(values.p50));
			tip.push(generateRangeSpan(values.p10, values.p90));

			return tip.join('\n');
		};

		const handleClick = async (e: { latlng: L.LatLng }) => {
			const { latlng } = e;
			// get location by coords (map.js L3013)
			const locationByCoords = await fetchLocationByCoords(latlng);

			// TODO: we're going to use this but coming from api data instead of hardcoding..
			//  keep it here for now as reference
			// const settings = {
			//   coords: {
			//     ...latlng
			//   },
			//   grid_id: null,
			//   location_id: `${lat}|${lng}`,
			//   sector: 'gridded_data',
			//   title: `Point (${lat}, ${lng})`,
			//   type: 'Grid Point',
			//   var: 'tx_max',
			//   var_id: '311',
			//   var_title: 'Hottest Day'
			// };

			// generate chart data
			const chartData = await generateChartData({
				latlng,
				variable,
				dataset,
				frequency,
			});

			togglePanel(
				<LocationInfoPanel
					title={locationByCoords.title}
					data={chartData}
				/>,
				{
					position: {
						left: remToPx(SIDEBAR_WIDTH),
						right: 0,
						bottom: 0,
					},
					direction: 'bottom',
				}
			);
		};

		const handleMouseOver = (e: {
			latlng: L.LatLng;
			layer: { properties: { gid: number } };
		}) => {
			// clear any opened tooltips to avoid multiple tooltips at the same time
			handleMouseOut();

			// store the gid of the hovered cell
			const { gid } = e.layer.properties;
			hoveredCellRef.current = gid;

			// highlight the hovered cell
			gridLayerRef.current.setFeatureStyle(gid, {
				fill: true,
				fillColor: '#fff',
				fillOpacity: 0.2,
			});

			// show the tooltip after a short delay
			hoverTimeoutRef.current = setTimeout(async () => {
				// TODO: this needs some refactoring to make it simpler to understand and maintain..
				//  currently it only works for gridded_data region
				const { lat, lng } = e.latlng;
				const decadeValue = parseInt(decade, 10) + 1;
				const hasDelta =
					options.var_data[
						options.query.var_id as keyof typeof options.var_data
					]?.acf?.hasdelta ?? false;
				const delta7100 = options.query.delta ? '&delta7100=true' : '';

				if (hasDelta || variable === 'building_climate_zones') {
					const varName =
						variable === 'building_climate_zones'
							? 'hddheat_18'
							: variable;

					let endpoint = `get-delta-30y-regional-values/${interactiveRegion}/${gid}`;
					const params = new URLSearchParams({
						period: String(decadeValue),
						decimals:
							options.var_data[
								options.query
									.var_id as keyof typeof options.var_data
							]?.acf?.decimals ?? undefined,
						delta7100,
						dataset_name: dataset,
					}).toString();

					if (interactiveRegion === 'gridded_data') {
						endpoint = `get-delta-30y-gridded-values/${lat}/${lng}`;
					}

					const data = await fetchDeltaValues({
						endpoint,
						varName,
						frequency,
						params,
					});

					if (data) {
						gridLayerRef.current
							.bindTooltip(formatGridHoverTooltip(data, e), {
								sticky: true,
							})
							.openTooltip(e.latlng);
					} else {
						handleNoDataTooltip(e);
					}
				}
			}, 100);
		};

		const handleMouseOut = () => {
			// close the tooltip
			const gridLayer = gridLayerRef.current;
			gridLayer.unbindTooltip();

			// clear the timeout
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}

			// finally, reset the style of the hovered cell
			gridLayer.resetFeatureStyle(hoveredCellRef.current);
		};

		// Helper function to handle 'no data available'
		const handleNoDataTooltip = (e: { latlng: L.LatLng }) => {
			if (gridLayerRef.current) {
				const tip = [__('No data available for this area.')];
				gridLayerRef.current
					.bindTooltip(tip.join('\n'), { sticky: true })
					.openTooltip(e.latlng);
			}
		};

		const gridOptions = {
			interactive: true,
			maxNativeZoom: DEFAULT_MAX_ZOOM,
			getFeatureId: (feature: { properties: { gid: number } }) =>
				feature.properties.gid,
			vectorTileLayerStyles: {
				[gridName]: function () {
					return {
						weight: 0.5,
						color: '#fff',
						opacity: 0.6,
						fill: true,
						radius: 4,
						fillOpacity: 0,
					};
				},
			},
			bounds: L.latLngBounds(
				L.latLng(41, -141.1), // _southWest
				L.latLng(83.6, -49.9) // _northEast
			),
			maxZoom: DEFAULT_MAX_ZOOM,
			minZoom: 7, // not using DEFAULT_MIN_ZOOM because then the cells would appear before zooming in and it slows the map rendering
			pane: 'grid', // TODO: figure out how `pane` works in the map
		};

		const tileLayerUrl = `${geoserverUrl}/geoserver/gwc/service/tms/1.0.0/CDC:${gridName}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`;

		// @ts-expect-error: suppress leaflet typescript error
		const gridLayer = L.vectorGrid.protobuf(tileLayerUrl, gridOptions);
		gridLayerRef.current = gridLayer;

		gridLayer
			.on('mouseover', handleMouseOver)
			.on('mouseout', handleMouseOut)
			.on('click', handleClick);

		gridLayer.addTo(map);

		return () => {
			map.removeLayer(gridLayer);
		};
	}, [
		map,
		togglePanel,
		__,
		interactiveRegion,
		frequency,
		dataset,
		variable,
		decade,
		emissionScenario,
	]);

	return null;
};

export default CellsGridLayer;
