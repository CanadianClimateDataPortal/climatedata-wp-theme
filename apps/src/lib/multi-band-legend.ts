import { type ColourQuantitiesMap } from '@/types/types';

/**
 * @file Multi-Band Legend Transformation (S2D Forecasts Only)
 *
 * This module handles transformation of S2D (Sub-seasonal to Decadal) forecast data
 * into a format suitable for rendering horizontal multi-band probability legends.
 *
 * ⚠️ SPECIALIZED MODULE - Only accepts GXYY-encoded multi-band format
 * ⚠️ NOT for standard single-gradient legends (use regular legend components instead)
 *
 * @see EXAMPLE_COLOR_MAP_S2D_MULTIBAND (`@/hooks/use-color-map.examples`) - Example input format
 */

/**
 * Single row in a probability visualization showing one forecast category
 */
export interface MultiBandLegendGroup {
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
export type MultiBandLegend = {
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
 * Base error class for multi-band legend operations
 */
export class MultiBandLegendError extends Error {
	constructor(
		//
		message: string,
		options?: ErrorOptions
	) {
		super(message, options);
		this.name = this.constructor.name;
	}
}

/**
 * Thrown when quantity format is invalid
 */
export class InvalidQuantityFormatError extends MultiBandLegendError {
	quantity: number;
	reason: string;

	constructor(
		//
		quantity: number,
		reason: string,
		options?: ErrorOptions
	) {
		super(`Invalid quantity format: ${quantity}. ${reason}`, options);
		this.quantity = quantity;
		this.reason = reason;
	}
}

/**
 * Thrown when scales don't match across groups
 */
export class ScaleMismatchError extends MultiBandLegendError {
	groupIndex: number;
	expectedScale: number[];
	actualScale: number[];

	constructor(
		groupIndex: number,
		expectedScale: number[],
		actualScale: number[],
		options?: ErrorOptions
	) {
		super(
			`
				Scale mismatch in group ${groupIndex}.
				We're expecting [${expectedScale.join(', ')}]
				and we got [${actualScale.join(', ')}]
			`
				.replace(/(\n|\s){2,}/g, ' ')
				.trim(),
			options
		);

		this.groupIndex = groupIndex;
		this.expectedScale = expectedScale;
		this.actualScale = actualScale;
	}
}

/**
 * Extracts percentage value from quantity with validation
 *
 * @throws {InvalidQuantityFormatError} When quantity format is invalid
 *
 *
 * @example
 * ```typescript
 * extractPercentage(1040) // 40
 * extractPercentage(2050) // 50
 * extractPercentage(3100) // 100
 * ```
 */
const extractPercentage = (quantity: number): number => {
	const str = String(quantity);

	if (str.length !== 4) {
		throw new InvalidQuantityFormatError(
			quantity,
			`Quantity must be 4 digits (format: GXYY). Got ${str.length} digits`
		);
	}

	const secondDigit = str[1];
	if (secondDigit !== '0' && secondDigit !== '1') {
		throw new InvalidQuantityFormatError(
			quantity,
			`Second digit must be 0 or 1 (represents 0-100%). Got '${secondDigit}'`
		);
	}

	const percentageStr = str.substring(1, 4);
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

/**
 * Validates that all groups have identical scales
 */
const validateScaleConsistency = (
	quantities: number[],
	ranges: GroupRange[]
): void => {
	if (ranges.length === 0) {
		return;
	}

	// Extract scale from first group as reference
	const firstRange = ranges[0];
	const expectedScale = quantities
		.slice(firstRange.startIndex, firstRange.endIndex + 1)
		.map(extractPercentage);

	// Validate all other groups match
	for (let i = 1; i < ranges.length; i++) {
		const range = ranges[i];
		const actualScale = quantities
			.slice(range.startIndex, range.endIndex + 1)
			.map(extractPercentage);

		// Check length first
		if (actualScale.length !== expectedScale.length) {
			throw new ScaleMismatchError(
				range.groupIndex,
				expectedScale,
				actualScale
			);
		}

		// Check values match
		const scalesMatch = actualScale.every(
			(val, idx) => val === expectedScale[idx]
		);

		if (!scalesMatch) {
			throw new ScaleMismatchError(
				range.groupIndex,
				expectedScale,
				actualScale
			);
		}
	}
};

/**
 * Validates no duplicate quantities exist
 */
const validateNoDuplicates = (quantities: number[]): void => {
	const seen = new Set<number>();

	for (const quantity of quantities) {
		if (seen.has(quantity)) {
			throw new MultiBandLegendError(
				`Duplicate quantity found: ${quantity}. Each quantity must be unique`
			);
		}
		seen.add(quantity);
	}
};

/**
 * Transforms colorMap data into MultiBandLegend format
 *
 * @param colorMap - Input color map from backend
 * @param labels - Optional labels for each group (if fewer than groups, generates defaults)
 */
export const transformColorMapToMultiBandLegend = ({
	quantities = [],
	colours = [],
}: ColourQuantitiesMap): MultiBandLegend => {
	const ranges = findGroupRanges(quantities);

	// Validate scale consistency across groups
	validateNoDuplicates(quantities);
	validateScaleConsistency(quantities, ranges);

	// Extract scale from first group (they're all the same)
	const firstRange = ranges[0];
	const scale = quantities
		.slice(firstRange.startIndex, firstRange.endIndex + 1)
		.map(extractPercentage);

	// Build rows for each group
	const rows: MultiBandLegendGroup[] = ranges.map((range) => {
		// Skip first color in each group (placeholder)
		const colors = colours.slice(range.startIndex + 1, range.endIndex + 1);

		return {
			label: `Line ${range.groupIndex}`,
			colors,
		};
	});

	return {
		scale,
		rows,
	};
};
