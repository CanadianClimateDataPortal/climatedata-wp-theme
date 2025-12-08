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
import {
	postDownloadToBlobObjectURL,
	assertHasExactlyOneGeographicSelector,
	type PostDownloadToBlobObjectURLPayload,
} from '@/services/download';
import {
	normalizeForApiFrequencyName,
	normalizeForApiVariableId,
} from '@/lib/s2d';

/**
 * Payload descriptor for S2D (Seasonal To Decadal) data download requests.
 *
 * @see {@link https://ccdpwiki.atlassian.net/wiki/spaces/CCDP/pages/2752544799/API+endpoints+downloaded+file#Endpoint API Documentation}
 *
 * @remarks
 * Variable IDs are prefixed with `s2d_` in the frontend but the API expects them without this prefix.
 * Use {@link normalizeForApiVariableId} to transform before sending.
 *
 * Geographic selection requires exactly one of `bbox` or `points` (inherited from base interface).
 */
interface PostDownloadS2DDescriptor extends PostDownloadToBlobObjectURLPayload {
	/**
	 * S2D variable identifier (without `s2d_` prefix)
	 *
	 * @example 'air_temp' | 'precip_accum'
	 */
	var: string;

	/**
	 * Forecast type selection
	 *
	 * @see {@link ForecastTypes}
	 * @example 'expected' | 'unusual'
	 */
	forecast_type: string;

	/**
	 * Selected frequency type (S2D subset only)
	 *
	 * @see {@link S2DFrequencyTypes}
	 * @example 'monthly' | 'seasonal'
	 */
	frequency: string | null;

	/**
	 * List of period start dates in YYYY-MM format
	 *
	 * @remarks
	 * Each string represents the beginning of a requested period.
	 * Valid months depend on the frequency (e.g., decadal has specific valid start months).
	 *
	 * @example ['2025-06', '2025-12'] // Jun-Aug 2025 and Dec 2025-Feb 2026 seasons
	 */
	periods: string[];
}

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
	 * Builds S2D download request and returns blob URL for file download.
	 */
	async getDownloadUrl(): Promise<string | null> {
		const selectedRegion = this.getSelectedRegion?.(); // For a drawn region
		const selectedPoints = this.getSelectedPoints?.(); // For selected points/cells

		const formatPeriod = (date: Date): string => formatUTCDate(date, 'yyyy-MM');

		const payload: PostDownloadS2DDescriptor = {
			var: normalizeForApiVariableId(this.getId() ?? ''),
			format: this.getFileFormat(),
			forecast_type: this.getForecastType(),
			frequency: normalizeForApiFrequencyName(this.getFrequency() ?? ''),
			periods: this.getSelectedPeriods().map(formatPeriod),
		};

		// Add bbox or points based on the selected region
		// Backend requires exactly one: bbox (region) OR points (grid cells)
		if (selectedRegion && selectedRegion.bounds) {
			// Region (bbox) selection
			const bounds = selectedRegion.bounds as [[number, number], [number, number]];
			/**
			 * @see {@link PostDownloadToBlobObjectURLPayload.bbox}
			 */
			payload['bbox'] = [
				bounds[0][0], // minLat
				bounds[0][1], // minLng
				bounds[1][0], // maxLat
				bounds[1][1], // maxLng
			];
		} else if (selectedPoints && Object.keys(selectedPoints).length > 0) {
			/**
			 * Selected grid cell coordinates
			 * @see {@link PostDownloadToBlobObjectURLPayload.points}
			 */
			payload['points'] = Object.values(selectedPoints).map(({ lat, lng }) => [lat, lng]);
		}

		// Validate exactly one geographic selector is present
		assertHasExactlyOneGeographicSelector(payload);

		const url = `${window.DATA_URL}/download-s2d`;
		const blobPayload = await postDownloadToBlobObjectURL(url, payload);
		return blobPayload;
	}

	/**
	 * @returns An empty array as S2D variables do not have scenarios
	 */
	getScenarios(): string[] {
		return [];
	}
}

export default S2DClimateVariable;
