/**
 * Hook that returns event handlers for interactive map layers.
 */
import React, { useMemo, useRef } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import L from 'leaflet';

import LocationInfoPanel from '@/components/map-info/location-info-panel';
import { LocationModalContent } from '@/components/map-layers/location-modal-content';

import { useAppSelector } from '@/app/hooks';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';

import { remToPx } from '@/lib/utils';
import { fetchDeltaValues, fetchLocationByCoords, generateChartData, } from '@/services/services';
import { SIDEBAR_WIDTH } from '@/lib/constants';
import { PercentileData } from '@/types/types';
import { doyFormatter } from '@/lib/format';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionOption } from "@/types/climate-variable-interface";

export const useInteractiveMapEvents = (
	// @ts-expect-error: suppress leaflet typescript error
	layerInstanceRef: React.MutableRefObject<L.VectorGrid | null>,
	getColor: (value: number) => string,
	onLocationModalOpen?: (content: React.ReactNode) => void,
	onLocationModalClose?: () => void
) => {
	const { __ } = useI18n();
	const { togglePanel } = useAnimatedPanel();
	const { climateVariable } = useClimateVariable();

	const {
		decade,
	} = useAppSelector((state) => state.map);

	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hoveredRef = useRef<number | null>(null);

	// TODO: these should not be hardcoded.. we want to revisit once we get the data from the API
	const options = useMemo(
		() => ({
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
			} as Record<
				string,
				{ acf: { hasdelta: boolean; decimals: string; units: string } }
			>,
		}),
		[]
	);

	// units of the value (ex: 'kelvin' or 'doy' for day-of-year)
	const units =
		options.var_data[options.query.var_id as keyof typeof options.var_data]
			?.acf?.units ?? '';

	// number of decimals to truncate to
	const decimals = parseInt(
		options.var_data[options.query.var_id as keyof typeof options.var_data]
			?.acf?.decimals ?? '0'
	);

	// if true, the value is formatted as a delta
	const delta = options.query.delta;

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
		if (!climateVariable) {
			return;
		}
		// RCP scenario selection
		const scenario = climateVariable?.getScenario() ?? ''

		const values = {
			p10: data[scenario]?.p10 || 0,
			p50: data[scenario]?.p50 || 0,
			p90: data[scenario]?.p90 || 0,
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
			// TODO: currently unreachable because data is hardcoded but let's keep it here for when we get the data from the API
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

		// get percentile values (p10, p50, p90) with temperature conversion if needed
		const values = getPercentileValues(data);

		if (values) {
			// generate tooltip span elements
			tip.push(generateMedianSpan(values.p50));
			tip.push(generateRangeSpan(values.p10, values.p90));
		}

		return tip.join('\n');
	};

	const getFeatureId = (properties: {
		gid?: number;
		id?: number;
	}): number | null => {
		return properties.gid ?? properties.id ?? null;
	};

	// Handle click on a location
	const handleClick = async (e: {
		latlng: L.LatLng;
		layer: { properties: { gid?: number; id?: number } };
	}) => {
		if (onLocationModalOpen) {
			// Get feature id
			const featureId = getFeatureId(e.layer.properties);
			if (!featureId) {
				return;
			}

			const { latlng } = e;
			const locationByCoords = await fetchLocationByCoords(latlng);

			// Handle click on details button of a location (to open the chart panel)
			const handleDetailsClick = async () => {
				if(onLocationModalClose) {
					onLocationModalClose();
				}

				const chartData = await generateChartData({
					latlng,
					variable: climateVariable?.getThreshold() ?? '',
					frequency: climateVariable?.getFrequency() ?? '',
					dataset: climateVariable?.getVersion() ?? '',
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
			}

			// Open location modal
			onLocationModalOpen(
				<LocationModalContent
					title={locationByCoords.title}
					latlng={latlng}
					featureId={featureId}
					onDetailsClick={handleDetailsClick}
				/>
			);
		}
	};

	const handleOver = (e: {
		latlng: L.LatLng;
		layer: { properties: { gid?: number; id?: number } };
	}) => {
		handleOut();

		const featureId = getFeatureId(e.layer.properties);
		if (!featureId) {
			return;
		}

		hoveredRef.current = featureId;
		const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;

		layerInstanceRef.current.setFeatureStyle(featureId, {
			fill: true,
			fillColor: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? '#fff' : getColor(featureId),
			fillOpacity: interactiveRegion === InteractiveRegionOption.GRIDDED_DATA ? 0.2 : 1,
			weight: 1.5,
			color: '#fff',
		});

		hoverTimeoutRef.current = setTimeout(async () => {
			const variableId = climateVariable?.getId() ?? '';
			const variable = climateVariable?.getThreshold() ?? '';
			const { lat, lng } = e.latlng;
			const decadeValue = parseInt(decade, 10) + 1;
			const hasDelta =
				options.var_data?.[options.query?.var_id]?.acf?.hasdelta ??
				false;
			const delta7100 = options.query?.delta ? '&delta7100=true' : '';

			if (hasDelta || variableId) {
				const varName =
					variableId === 'building_climate_zones'
						? 'hddheat_18'
						: variable;

				let endpoint = `get-delta-30y-regional-values/${interactiveRegion}/${featureId}`;
				const params = new URLSearchParams({
					period: String(decadeValue),
					decimals:
						options.var_data?.[options.query?.var_id]?.acf
							?.decimals ?? undefined,
					delta7100,
					dataset_name: climateVariable?.getVersion() ?? '',
				}).toString();

				if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
					endpoint = `get-delta-30y-gridded-values/${lat}/${lng}`;
				}

				const data = await fetchDeltaValues({
					endpoint,
					varName,
					frequency: climateVariable?.getFrequency() ?? '',
					params,
				});

				if (data) {
					layerInstanceRef.current
						?.bindTooltip(formatGridHoverTooltip(data, e), {
							sticky: true,
						})
						.openTooltip(e.latlng);
				} else {
					handleNoDataTooltip(e);
				}
			}
		}, 100);
	};

	const handleOut = () => {
		if (!layerInstanceRef.current) {
			return;
		}

		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		if (hoveredRef.current !== null) {
			layerInstanceRef.current.resetFeatureStyle(hoveredRef.current);
			layerInstanceRef.current.unbindTooltip();
			hoveredRef.current = null;
		}
	};

	// Helper function to handle 'no data available'
	const handleNoDataTooltip = (e: { latlng: L.LatLng }) => {
		if (layerInstanceRef.current) {
			const tip = [__('No data available for this area.')];
			layerInstanceRef.current
				.bindTooltip(tip.join('\n'), { sticky: true })
				.openTooltip(e.latlng);
		}
	};

	return {
		handleClick,
		handleOver,
		handleOut,
		handleNoDataTooltip,
	};
};
