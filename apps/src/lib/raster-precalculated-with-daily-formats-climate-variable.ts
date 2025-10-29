import RasterPrecalculatedClimateVariable from "@/lib/raster-precalculated-climate-variable";
import {
  FrequencyType,
	FileFormatType,
} from "@/types/climate-variable-interface";

class RasterPrecalculatedWithDailyFormatsClimateVariable extends RasterPrecalculatedClimateVariable {
  getFileFormatTypes(): FileFormatType[] {
    return this.getFrequency() !== FrequencyType.DAILY
      ? super.getFileFormatTypes()
      : [
        FileFormatType.CSV,
        FileFormatType.NetCDF
      ];
  }
}

export default RasterPrecalculatedWithDailyFormatsClimateVariable;