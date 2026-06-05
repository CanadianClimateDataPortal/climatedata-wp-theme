import RasterPrecalculatedClimateVariable from '@/lib/raster-precalculated-climate-variable';
import {
	AveragingType, FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	LegendConfigSet,
} from '@/types/climate-variable-interface';
import { MapDisplayType } from '@/types/types';


class ReturnPeriodClimateVariable extends RasterPrecalculatedClimateVariable {

	getVersions(): string[] {
		const config = this.getConfig();
		return config.versions ?? [ "cmip6" ];
	}

	getAveragingOptions(): AveragingType[] {
		const config = this.getConfig();
		return config.averagingOptions ?? [ AveragingType.THIRTY_YEARS ];
	}

	getLegendConfigs(): LegendConfigSet {
		const config = this.getConfig();
		return config.legendConfigs ?? {
			[MapDisplayType.ABSOLUTE]: {
				addTopPadding: true,
			},
			[MapDisplayType.DELTA]: {
				hideTopLabel: true,
				decimals: 1,
			},
		};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		const config = this.getConfig();
		return config.frequencyConfig ?? {
			[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
		};
	}
}

export default ReturnPeriodClimateVariable;
