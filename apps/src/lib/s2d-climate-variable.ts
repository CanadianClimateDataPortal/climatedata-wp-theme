import { createElement } from 'react';
import {
	type ClimateVariableConfigInterface,
	type LocationModalContentParams,
	ForecastDisplays,
	ForecastTypes,
	FrequencyType,
	InteractiveRegionConfig,
	InteractiveRegionDisplay,
	InteractiveRegionOption,
} from '@/types/climate-variable-interface';
import S2DVariableValues from '@/components/map-layers/s2d-variable-values';
import RasterPrecalculatedClimateVariable from '@/lib/raster-precalculated-climate-variable';
import { WMSParams } from '@/types/types';
import { formatUTCDate, utc } from '@/lib/utils';
import { normalizeForApiVariableId } from '@/lib/s2d';

/**
 * Seasonal To Decadal
 */
class S2DClimateVariable extends RasterPrecalculatedClimateVariable {
	constructor(
		config: ClimateVariableConfigInterface,
	) {
		super(config);
	}

	getFrequency(): string | null {
		return super.getFrequency() ?? FrequencyType.SEASONAL;
	}

	getColourOptionsStatus(): boolean {
		// No colour options for S2D variables
		return false;
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return super.getInteractiveRegionConfig() ?? {
			[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
		};
	}

	getGridType(): string | null {
		return 'canadagrid';
	}

	hasDelta(): boolean | undefined {
		return false;
	}

	/**
	 * Generate and return the GeoServer layer name for the data map.
	 *
	 * The name depends on which "Forecast display" is selected:
	 * - Forecast: `CDC:s2d-forecast-<VAR>-<F>-<FT>`
	 * - Climatology: `CDC:s2d-climatology-<VAR>-<F>`
	 *
	 * Where:
	 * - <VAR>: the API variable's ID
	 * - <F>: the frequency (e.g. "seasonal" or "monthly")
	 * - <FT>: the forecast type (e.g. "expected" or "unusual")
	 */
	getLayerValue(): string {
		const forecastType = this.getForecastType();
		const isForecast = this.getForecastDisplay() === ForecastDisplays.FORECAST;
		const frequency = this.getFrequency() ?? FrequencyType.SEASONAL;
		const variable = normalizeForApiVariableId(this.getId());

		const frequencyNameMap: Record<string, string> = {
			[FrequencyType.SEASONAL]: 'seasonal',
			[FrequencyType.MONTHLY]: 'monthly',
		}

		const forecastTypeMap: Record<string, string> = {
			[ForecastTypes.EXPECTED]: 'expected',
			[ForecastTypes.UNUSUAL]: 'unusual',
		}

		const frequencyName = frequencyNameMap[frequency];
		const forecastTypeName = forecastTypeMap[forecastType];

		if (isForecast) {
			return `CDC:s2d-forecast-${variable}-${frequencyName}-${forecastTypeName}`;
		}

		return `CDC:s2d-climatology-${variable}-${frequencyName}`;
	}

	/**
	 * Set the TIME and version attribute based on the selected values.
	 */
	updateMapWMSParams(params: WMSParams, isComparisonMap: boolean): WMSParams {
		const updatedParams = {
			...super.updateMapWMSParams(params, isComparisonMap),
			version: '1.3.0',
		};
		const isClimatology = this.getForecastDisplay() === ForecastDisplays.CLIMATOLOGY;
		const dateRange = this.getDateRange();

		if (dateRange) {
			const periodStartDate = utc(dateRange[0]);

			if (periodStartDate) {
				// For climatology, the year is always fixed to 1991
				if (isClimatology) {
					periodStartDate?.setUTCFullYear(1991);
				}

				updatedParams.TIME = formatUTCDate(periodStartDate, "yyyy-MM-dd'T00:00:00Z'");
			}
		}

		return updatedParams;
	}

	getLocationModalContent(
		params: LocationModalContentParams,
	): React.ReactNode | null {
		const { latlng } = params;
		return createElement(
			S2DVariableValues,
			{
				latlng,
			},
		);
	}

	/**
	 * TODO: For now, only outputs in the console the payload to send to the API
	 */
	async getDownloadUrl(): Promise<string | null> {
		const selectedRegion = this.getSelectedRegion?.(); // For a drawn region
		const selectedPoints = this.getSelectedPoints?.(); // For selected points/cells

		const formatPeriod = (date: Date): string => formatUTCDate(date, 'yyyy-MM');

		const payload: Record<string, unknown> = {
			var: this.getId(), // TODO: use getApiVariableId()
			format: this.getFileFormat(),
			forecast_type: this.getForecastType(), // TODO: use getApiForecastType()
			frequency: this.getFrequency(), // TODO: use getApiFrequency()
			periods: this.getSelectedPeriods().map(formatPeriod),
		}

		// Add bbox or points based on the selected region
		if (selectedRegion && selectedRegion.bounds) {
			// Region (bbox) selection
			const bounds = selectedRegion.bounds as [[number, number], [number, number]];
			payload['bbox'] = [
				bounds[0][0], // minLat
				bounds[0][1], // minLng
				bounds[1][0], // maxLat
				bounds[1][1], // maxLng
			];
		} else if (selectedPoints && Object.keys(selectedPoints).length > 0) {
			payload['points'] = Object.values(selectedPoints).map(({ lat, lng }) => [lat, lng]);
		}

		console.log(payload);

		// Must return a blob URL, look at the fetchDownloadUrl() method in raster-precalculated-climate-variable.tsx
		// return await this.fetchDownloadUrl(payload);
		return 'https://example.com/';
	}

	/**
	 * @returns An empty array as S2D variables do not have scenarios
	 */
	getScenarios(): string[] {
		return [];
	}
}

export default S2DClimateVariable;
