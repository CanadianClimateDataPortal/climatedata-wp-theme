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
import {
	createPropsForS2DVariableValues,
} from '@/lib/s2d-variable-values';
import { WMSParams } from '@/types/types';
import { formatUTCDate, utc } from '@/lib/utils';

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

	/**
	 * Generate and return the GeoServer layer name for the data map.
	 *
	 * The name depends on which "Forecast display" is selected:
	 * - Forecast: `CDC:s2d-forecast-<VAR>-<F>-<FT>`
	 * - Climatology: `CDC:s2d-climatology-<VAR>-<F>`
	 *
	 * Where:
	 * - <VAR>: the variable ID (without the "s2d_" prefix)
	 * - <F>: the frequency (e.g. "seasonal" or "monthly")
	 * - <FT>: the forecast type (e.g. "expected" or "unusual")
	 */
	getLayerValue(): string {
		const forecastType = this.getForecastType();
		const isForecast = this.getForecastDisplay() === ForecastDisplays.FORECAST;
		const frequency = this.getFrequency() ?? FrequencyType.SEASONAL;
		let variable = this.getId();

		const frequencyNameMap: Record<string, string> = {
			[FrequencyType.SEASONAL]: 'seasonal',
			[FrequencyType.MONTHLY]: 'monthly',
		}

		const forecastTypeMap: Record<string, string> = {
			[ForecastTypes.EXPECTED]: 'expected',
			[ForecastTypes.UNUSUAL]: 'unusual',
		}

		if (variable.startsWith('s2d_')) {
			variable = variable.substring(4);
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
		_params: LocationModalContentParams // eslint-disable-line @typescript-eslint/no-unused-vars
	): React.ReactNode | null {
		// TODO: Figure out where we will resolve the values. Probably from this class, and not outside.
		const props = createPropsForS2DVariableValues({});
		return createElement(
			S2DVariableValues,
			props,
		);
	}
}

export default S2DClimateVariable;
