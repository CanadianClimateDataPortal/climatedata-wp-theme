import { ClimateVariableInterface, TemporalScaleConfig } from "@/types/climate-variable-interface";
import { DEFAULT_COLOUR_SCHEMES } from "@/lib/constants";
import { ColourScheme } from "@/types/types";
import { getDefaultFrequency, getFrequencyCode } from "@/lib/utils";

export function generateColourScheme(
	climateVariable: ClimateVariableInterface
): ColourScheme | undefined {
	if (!climateVariable) {
		return;
	}

	const colourScheme = climateVariable?.getColourScheme();
	if (!colourScheme || !(colourScheme in DEFAULT_COLOUR_SCHEMES)) {
		return;
	}

	const { colours, type: schemeType } = DEFAULT_COLOUR_SCHEMES[colourScheme];

	const { thresholds, decimals = 1 } = climateVariable.getTemporalThresholdConfig() ?? {};
	if (!thresholds) {
		return;
	}

	const threshold = climateVariable.getThreshold();
	if (!threshold) {
		return;
	}

	const temporalScales = thresholds[threshold];
	if (!temporalScales) {
		return;
	}

	const frequencyConfig = climateVariable.getFrequencyConfig() ?? null;
	if (!frequencyConfig) {
		return
	}

	const frequency = climateVariable.getFrequency() ?? getDefaultFrequency(frequencyConfig, 'map');
	if (!frequency) {
		return;
	}

	const frequencyCode = getFrequencyCode(frequency);
	const temporalScaleConfig = temporalScales[frequencyCode];
	if (!temporalScaleConfig) {
		return;
	}

	const useDelta = climateVariable?.hasDelta() ?? false;

	return {
		colours,
		type: schemeType,
		quantities: calculateQuantities({
			temporalScaleConfig,
			useDelta: useDelta && climateVariable?.getDataValue() === "delta",
			colours,
			schemeType,
			decimals
		}),
		isDivergent: schemeType === 'divergent'
	};
}

interface CalculateQuantitiesParams {
	temporalScaleConfig: TemporalScaleConfig;
	useDelta: boolean;
	colours: string[];
	schemeType: string;
	decimals: number;
}

function calculateQuantities({
	temporalScaleConfig,
	useDelta,
	colours,
	schemeType,
	decimals
}: CalculateQuantitiesParams): number[] {
	const quantities: number[] = [];
	const { absolute, delta, unit } = temporalScaleConfig;
	const schemeLength = colours.length;

	let low = useDelta ? delta.low : absolute.low;
	let high = useDelta ? delta.high : absolute.high;

	if (schemeType === 'divergent') {
		high = Math.max(Math.abs(low), Math.abs(high));
		low = high * -1;

		if ((high - low) * 10**decimals < schemeLength) {
			low = -(schemeLength / 10**decimals / 2.0);
			high = schemeLength / 10**decimals / 2.0;
		}
	} else {
		if ((high - low) * 10**decimals < schemeLength) {
			high = low + schemeLength / 10**decimals;
		}
	}

	if (unit === 'K' && !useDelta) {
		low += 273.15;
		high += 273.15;
	}

	if (schemeType === 'divergent') {
		// For divergent palettes, create symmetric ranges around zero
		const step = (high - low) / (schemeLength - 1);
		for (let i = 0; i < schemeLength; i++) {
			quantities.push(low + i * step);
		}
	} else {
		// For non-divergent palettes, use the original logic
		const step = (high - low) / schemeLength;
		for (let i = 0; i < schemeLength - 1; i++) {
			quantities.push(low + i * step);
		}
		quantities.push((high + 1) * (high + 1));
	}

	return quantities;
}
