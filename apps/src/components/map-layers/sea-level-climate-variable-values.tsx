import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import L from 'leaflet';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { fetchDeltaValues } from '@/services/services';
import SectionContext from "@/context/section-provider";

interface SeaLevelClimateVariableValuesProps {
	latlng: L.LatLng;
	featureId: number,
	mode: "modal" | "panel"
}

/**
 * SeaLevelClimateVariableValues Component
 * ---------------------------
 * Display the climate variable median
 * For Seal Level climate variable
 *
 * Can be used in the location modal and charts panel
 */
const SeaLevelClimateVariableValues: React.FC<SeaLevelClimateVariableValuesProps> = ({
	latlng,
	featureId,
	mode,
}) => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();
	const decimals = climateVariable?.getUnitDecimalPlaces() ?? 0;
	const dateRange = useMemo(() => {
		return climateVariable?.getDateRange() ?? ["2040", "2050"];
	}, [climateVariable]);
	const section = useContext(SectionContext);

	const [ median, setMedian ] = useState<number | null>(null);
	const [ noDataAvailable, setNoDataAvailable ] = useState<boolean>(false);

	// useEffect to retrieve location values for the current climate variable
	useEffect(() => {
		const variableId = climateVariable?.getId() ?? '';
		const { lat, lng } = latlng;
		const decadeValue = parseInt(dateRange[1]); // We get end date for this variable

		const fetchData = async () => {
			if (!decadeValue && !variableId) return;

			const scenario = climateVariable?.getScenario() ?? '';
			const version = climateVariable?.getVersion() ?? '';

			// Fetching median

			// Endpoint
			const medianEndpoint = `get-slr-gridded-values/${lat}/${lng}`;

			// Params
			const medianParams = new URLSearchParams({
				period: String(decadeValue),
				dataset_name: version,
			}).toString();

			const medianData = await fetchDeltaValues({
				endpoint: medianEndpoint,
				varName: null,
				frequency: null,
				params: medianParams,
			});

			if(medianData === null) {
				// If we don't have data
				setNoDataAvailable(true);
			} else {
				let scenarioName, percentile;

				// If the scenario name already contains the percentile, use it, else
				// default to 'p50' if it exists
				if (/-p\d+$/.test(scenario)) {
					[scenarioName, percentile] = scenario.split('-');
				} else {
					const defaultPercentile = 'p50';
					if (medianData[scenario]?.[defaultPercentile]) {
						scenarioName = scenario;
						percentile = defaultPercentile;
					}
				}

				if(scenarioName && percentile) {
					setMedian(medianData[scenarioName]?.[percentile] || 0);
					setNoDataAvailable(false);
				} else {
					// If we don't have data
					setNoDataAvailable(true);
				}
			}
		};

		fetchData();
	}, [climateVariable, decimals, dateRange, featureId, latlng, section]);

	// Value formatter (for units)
	const valueFormatter = (value: number) => {
		const unit = climateVariable?.getUnit();
		return `${value.toFixed(decimals)} ${unit}`;
	};

	// Generate median div
	const generateMedianDiv = (median: number) => {
		const formattedMedian = valueFormatter(median);

		return (
			<div className={mode === "modal" ? "w-1/2" : ""}>
				<div className={`font-semibold text-brand-blue ${mode === 'modal' ? 'mb-1 text-2xl' : 'text-md'}`}>
					{ formattedMedian }
				</div>
			</div>
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
					</div>
				</>
			)}
		</div>
	);
};

export default SeaLevelClimateVariableValues;
