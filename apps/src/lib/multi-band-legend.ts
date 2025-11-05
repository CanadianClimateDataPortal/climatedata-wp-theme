import { type ColourMap } from '@/types/types';

/**
 * Single row in a probability visualization showing one forecast category
 *
 */
export interface MultiBandLegendGroup /*ProbabilityVisualizationRow*/ {
	/**
	 * Category label for this probability band
	 *
	 * @example 'Above', 'Near', 'Below'
	 */
	label: string;

	/**
	 * Hexadecimal color codes for each segment, length must equal `scale.length - 1`
	 *
	 * Each color represents one interval between adjacent scale values
	 *
	 * @example
	 * ```
	 * { colors: ['#FDD0BB', '#FBAD94', '#F88B6E'] }
	 * ```
	 */
	colors: string[];
}

/**
 * Complete probability visualization data
 *
 * Contains scale boundaries and color-coded probability bands for multiple categories
 */
export type MultiBandLegend /*ProbabilityVisualization*/ = {
	/**
	 * Boundary values defining probability ranges
	 *
	 * @example [40, 50, 60, 70, 80, 90, 100]
	 * @see {@link MultiBandLegendGroup.colors} - Must have length equal to `scale.length - 1`
	 */
	scale: number[];

	/**
	 * Probability categories with their respective color gradients
	 *
	 * @remarks
	 * Constraint: Each row's `colors` array length must equal `scale.length - 1`
	 */
	rows: MultiBandLegendGroup[];
};

/**
 * Extracts grouping index from first digit of quantity
 *
 * @example
 * ```typescript
 * extractGroupingIndex(1040) // 1
 * extractGroupingIndex(2050) // 2
 * extractGroupingIndex(3100) // 3
 * ```
 */
const extractGroupingIndex = (quantity: number): number => {
	const firstChar = String(quantity)[0];
	return Number(firstChar);
};

/**
 * Extracts percentage value from quantity
 *
 * @example
 * ```typescript
 * extractPercentage(1040) // 40
 * extractPercentage(2050) // 50
 * extractPercentage(3100) // 100
 * ```
 */
const extractPercentage = (quantity: number): number => {
	const percentageStr = String(quantity).substring(1, 4);
	return Number(percentageStr);
};

type GroupRange = {
	groupIndex: number;
	startIndex: number;
	endIndex: number;
};

/**
 * Finds ranges for each group in the quantities array
 *
 * @returns Array of group ranges with their start/end indices
 */
const findGroupRanges = (quantities: number[]): GroupRange[] => {
	const ranges: GroupRange[] = [];
	let currentGroup: number | null = null;
	let startIndex = 0;

	quantities.forEach((quantity, index) => {
		const group = extractGroupingIndex(quantity);

		if (currentGroup === null) {
			currentGroup = group;
			startIndex = index;
		} else if (group !== currentGroup) {
			ranges.push({
				groupIndex: currentGroup,
				startIndex,
				endIndex: index - 1,
			});
			currentGroup = group;
			startIndex = index;
		}

		// Handle last group
		if (index === quantities.length - 1) {
			ranges.push({
				groupIndex: group,
				startIndex,
				endIndex: index,
			});
		}
	});

	return ranges;
};

export type TransformColorMapInput = Pick<ColourMap, 'colours' | 'quantities'>;

/**
 * Transforms colorMap data into MultiBandLegend format
 *
 * @param colorMap - Input color map from backend
 * @param labels - Optional labels for each group (if fewer than groups, generates defaults)
 */
export const transformColorMapToMultiBandLegend = (
	{ quantities = [], colours = [] }: TransformColorMapInput,
	labels?: string[]
): MultiBandLegend => {
	const ranges = findGroupRanges(quantities);

	// Extract scale from first group (they're all the same)
	const firstRange = ranges[0];
	const scale = quantities
		.slice(firstRange.startIndex, firstRange.endIndex + 1)
		.map(extractPercentage);

	// Build rows for each group
	const rows: MultiBandLegendGroup[] = ranges.map((range, index) => {
		// Skip first color in each group (placeholder)
		const colors = colours.slice(range.startIndex + 1, range.endIndex + 1);

		return {
			label: labels?.[index] || `Line ${range.groupIndex}`,
			colors,
		};
	});

	return {
		scale,
		rows,
	};
};
