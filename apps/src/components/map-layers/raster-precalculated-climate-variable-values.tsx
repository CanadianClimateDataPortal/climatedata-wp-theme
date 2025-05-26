import React, { useEffect, useState, useMemo, useContext } from 'react';
import { __ } from '@/context/locale-provider';
import L from 'leaflet';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useLocale } from '@/hooks/use-locale';
import { fetchDeltaValues, generateChartData } from '@/services/services';
import { InteractiveRegionOption } from "@/types/climate-variable-interface";
import { doyFormatter } from '@/lib/format';
import { getDefaultFrequency } from "@/lib/utils";
import SectionContext from "@/context/section-provider";

interface RasterPrecalcultatedClimateVariableValuesProps {
	latlng: L.LatLng;
	featureId: number,
	mode: "modal" | "panel"
}

/**
 * RasterPrecalcultatedClimateVariableValues Component
 * ---------------------------
 * Display the climate variable values (median, relative to baseline, range)
 * For Raster/Precalculated climate variable
 *
 * Can be used in the location modal and charts panel
 */
const RasterPrecalcultatedClimateVariableValues: React.FC<RasterPrecalcultatedClimateVariableValuesProps> = ({
	latlng,
	featureId,
	mode,
}) => {
	const { locale } = useLocale();
	const { climateVariable } = useClimateVariable();
	const unit = climateVariable?.getUnit();
	const decimals = climateVariable?.getUnitDecimalPlaces() ?? 0;
	const dateRange = useMemo(() => {
		return climateVariable?.getDateRange() ?? ["2041", "2070"];
	}, [climateVariable]);
	const section = useContext(SectionContext);

	const [ median, setMedian ] = useState<number | null>(null);
	const [ range, setRange ] = useState<number[] | null>(null);
	const [ relativeToBaseline, setRelativeToBaseline ] = useState<number | null>(null);
	const [ noDataAvailable, setNoDataAvailable ] = useState<boolean>(false);

	// useEffect to retrieve location values for the current climate variable
	useEffect(() => {
		const interactiveRegion = climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA;
		const variableId = climateVariable?.getId() ?? '';
		const variable = climateVariable?.getThreshold() ?? '';
		const { lat, lng } = latlng;
		const decadeValue = parseInt(dateRange[0]) - (parseInt(dateRange[0]) % 10) + 1;

		const fetchData = async () => {
			if (!decadeValue && !variableId) return;

			const frequencyConfig = climateVariable?.getFrequencyConfig();
			let frequency = climateVariable?.getFrequency() ?? ''
			if (!frequency && frequencyConfig) {
				frequency = getDefaultFrequency(frequencyConfig, section) ?? ''
			}

			const scenario = climateVariable?.getScenario() ?? '';
			const version = climateVariable?.getVersion() ?? '';

			// Special case variable id
			const varName =
				variableId === 'building_climate_zones'
					? 'hddheat_18'
					: variable;

			// Fetching median and range

			// Endpoint
			let medianRangeEndpoint = `get-delta-30y-regional-values/${interactiveRegion}/${featureId}`;
			if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
				medianRangeEndpoint = `get-delta-30y-gridded-values/${lat}/${lng}`;
			}

			// Params
			const medianRangeParams = new URLSearchParams({
				period: String(decadeValue),
				decimals: decimals.toString(),
				delta7100: climateVariable?.getDataValue() === 'delta' ? 'true' : 'false',
				dataset_name: climateVariable?.getVersion() ?? '',
			}).toString();

			const medianRangeData = await fetchDeltaValues({
				endpoint: medianRangeEndpoint,
				varName,
				frequency: frequency,
				params: medianRangeParams,
			});

			if(medianRangeData === null) {
				// If we don't have data
				setNoDataAvailable(true);
			} else {
				setMedian(medianRangeData[scenario]?.p50 || 0);
				setRange([medianRangeData[scenario]?.p10 || 0, medianRangeData[scenario]?.p90 || 0]);
				setNoDataAvailable(false);
			}

			// Fetching relative to baseline

			// Params
			const chartsData = await generateChartData({
				latlng: latlng,
				variable: varName,
				frequency: frequency,
				dataset: version,
				unit: climateVariable?.getUnit() ?? '',
				unitDecimals: decimals
			});


			const deltaValueKey = 'delta7100_' + scenario + '_median';

			// If annual, we take the first month (so 0)
			// If monthly, we take the frequency month index
			// If seasonal, we take the related month index
			let month = 0;
			const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
			const seasons = ['spring', 'summer', 'fall', 'winter'];
			if(months.includes(frequency)) {
				month = months.indexOf(frequency);
			} else if(seasons.includes(frequency)) {
				if(frequency == 'spring') month = 2;
				else if(frequency == 'summer') month = 5;
				else if(frequency == 'fall') month = 8;
				else if(frequency == 'winter') month = 11;
			}

			const timestamp = Date.UTC(decadeValue, month, 1, 0, 0, 0);

			if(
				chartsData[deltaValueKey] !== undefined
				&& chartsData[deltaValueKey][timestamp] !== undefined
				&& chartsData[deltaValueKey][timestamp][0] !== undefined
			) {
				setRelativeToBaseline(chartsData[deltaValueKey][timestamp][0]);
			} else {
				setRelativeToBaseline(null);
			}
		};

		fetchData();
	}, [climateVariable, decimals, dateRange, featureId, latlng, section]);

	// Value formatter (for delta, for units)
	const valueFormatter = (value: number, delta: boolean = (climateVariable?.getDataValue() === 'delta')) => {
		let str = '';

		switch (unit) {
			case 'doy':
				if (delta) {
					str = `${value.toFixed(decimals)} days`;
				} else {
					str = doyFormatter(value, locale);
				}
				break;
			default:
				str = `${value.toFixed(decimals)} ${unit}`;
				break;
		}

		// If delta, we add a "+" for positive values
		if(delta && value > 0) {
			str = '+' + str;
		}

		return str;
	};

	// Generate display dateRange for UI only (year starting with 1 instead of 0)
	const getDisplayDateRange = () => {
		const displayOnlyDateRange = [...dateRange];
		if (displayOnlyDateRange[0] && parseInt(displayOnlyDateRange[0]) % 10 === 0) {
			displayOnlyDateRange[0] = (parseInt(displayOnlyDateRange[0]) + 1).toString();
		}
		return displayOnlyDateRange;
	};

	// Generate median div
	const generateMedianDiv = (median: number) => {
		const formattedMedian = valueFormatter(median);
		const displayOnlyDateRange = getDisplayDateRange();

		return (
			<div className={mode === "modal" ? "w-1/2" : ""}>
				<div className={`font-semibold text-brand-blue ${mode === 'modal' ? 'mb-1 text-2xl' : 'text-md'}`}>
					{ formattedMedian }
				</div>
				<div className={mode === "modal" ? "" : "flex gap-2"}>
					<div className='text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider'>
						{__('Median')}
					</div>
					<div className='text-xs text-neutral-grey-medium'>
						({ displayOnlyDateRange[0] } - { displayOnlyDateRange[1] })
					</div>
				</div>
			</div>
		);
	};

	// Generate relative to base div
	const generateRelativeToBaselineDiv = (relativeToBaseline: number) => {
		const formattedRelativeToBaseline = valueFormatter(relativeToBaseline, true);

		return (
			<div className={mode === "modal" ? "w-1/2" : ""}>
				<div className={`font-semibold text-brand-blue ${mode === 'modal' ? 'mb-1 text-2xl' : 'text-md'}`}>
					{ formattedRelativeToBaseline }
				</div>
				<div className={mode === "modal" ? "" : "flex gap-2"}>
					<div className='text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider whitespace-nowrap'>
						{__('Relative to baseline')}
					</div>
					<div className='text-xs text-neutral-grey-medium'>
						(1971 - 2000)
					</div>
				</div>
			</div>
		);
	};

	// Generate range div
	const generateRangeDiv = (rangeStartValue: number, rangeEndValue: number) => {
		const rangeStart = valueFormatter(rangeStartValue);
		const rangeEnd = valueFormatter(rangeEndValue);

		return (
			<>
				<div className={`font-semibold text-brand-blue ${mode === 'modal' ? 'mb-1 text-2xl' : 'text-md'}`}>
					{rangeStart} {__('to')} {rangeEnd}
				</div>
				<div className='text-xs font-semibold text-neutral-grey-medium uppercase tracking-wider'>
					{__('Range')}
				</div>
			</>
		);
	};

	return (
		<div className={mode === "modal" ? "mt-4 mb-4" : "flex-grow flex gap-6 justify-end"}>
			{noDataAvailable ? (
				<div>
					<p className='text-base text-neutral-grey-medium italic'>
						{__('No data available.')}
					</p>
				</div>
			) : (
				<>
					<div className={mode === "modal" ? "mb-3 flex" : "flex gap-6"}>
						{ median !== null && generateMedianDiv(median) }
						{ relativeToBaseline !== null && generateRelativeToBaselineDiv(relativeToBaseline) }
					</div>
					<div>
						{ range !== null && generateRangeDiv(range[0], range[1]) }
					</div>
				</>
			)}
		</div>
	);
};

export default RasterPrecalcultatedClimateVariableValues;
