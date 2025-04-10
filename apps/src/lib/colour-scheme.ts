import { ClimateVariableInterface, TemporalScaleConfig } from "@/types/climate-variable-interface";
import { DEFAULT_COLOUR_SCHEMES } from "@/lib/constants";
import { ColourScheme } from "@/types/types";
import { getFrequencyCode } from "@/lib/utils";

export function generateColourScheme(
	climateVariable: ClimateVariableInterface,
	dataValue: string
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

	const frequencies = thresholds[threshold];
	if (!frequencies) {
		return;
	}

	const frequency = climateVariable.getFrequency();
	if (!frequency) {
		return;
	}

	const frequencyCode = getFrequencyCode(frequency);
	const frequencyConfig = frequencies[frequencyCode];
	if (!frequencyConfig) {
		return;
	}

	return {
		colours,
		type: schemeType,
		quantities: calculateQuantities({
			frequencyConfig,
			dataValue,
			colours,
			schemeType,
			decimals
		})
	};
}

interface CalculateQuantitiesParams {
	frequencyConfig: TemporalScaleConfig;
	dataValue: string;
	colours: string[];
	schemeType: string;
	decimals: number;
}

function calculateQuantities({
	frequencyConfig,
	dataValue,
	colours,
	schemeType,
	decimals
}: CalculateQuantitiesParams): number[] {
	const quantities: number[] = [];
	const useDelta = dataValue === 'delta';
	const { absolute, delta, unit } = frequencyConfig;
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

	const step = (high - low) / schemeLength;

	for (let i = 0; i < schemeLength - 1; i++) {
		quantities.push(low + i * step);
	}

	quantities.push((high + 1) * (high + 1));

	return quantities;
}
