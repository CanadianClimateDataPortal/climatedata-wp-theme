import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';
import { getOrdinalSuffix } from '@/lib/format';
import TooltipWidget from '@/components/ui/tooltip-widget';

/**
 * Single row in a probability visualization showing one forecast category
 */
export interface ProbabilityVisualizationRow {
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
export type ProbabilityVisualization = {
	/**
	 * Boundary values defining probability ranges
	 *
	 * @example [40, 50, 60, 70, 80, 90, 100]
	 * @see {@link ProbabilityVisualizationRow.colors} - Must have length equal to `scale.length - 1`
	 */
	scale: number[];

	/**
	 * Probability categories with their respective color gradients
	 *
	 * @remarks
	 * Constraint: Each row's `colors` array length must equal `scale.length - 1`
	 */
	rows: ProbabilityVisualizationRow[];
};

/**
 * Props for component contextual information to rendering a probability forecast statement
 */
interface ProbabilityStatementProps {
	/**
	 * Climate variable being forecasted
	 *
	 * @example 'total precipitation', 'mean temperature'
	 */
	variableName: string;

	/**
	 * Qualitative description of the forecasted outcome
	 *
	 * @example 'unusually high or low', 'above normal'
	 */
	outcome: string;

	/**
	 * Locale for number formatting and translations
	 */
	locale: Intl.LocalesArgument;
}

/**
 * Single row in the probability statement tooltip explaining percentile thresholds
 *
 * Describes what each probability category means in terms of historical distribution
 *
 * @example
 * Renders as: "Unusually high: Above the 80th percentile (top fifth of historical data)"
 */
interface ProbabilityStatementTooltipRow {
	/**
	 * Percentile threshold value (0-100)
	 *
	 * @example 80 for "80th percentile"
	 */
	value: number;

	/**
	 * User-facing category label
	 *
	 * @example 'Unusually high', 'Above normal'
	 */
	label: string;

	/**
	 * Template string with `%s` placeholder for percentile value
	 *
	 * @example 'Above the %s percentile' becomes "Above the 80th percentile"
	 */
	text: string;

	/**
	 * Explanatory clarification in parentheses
	 *
	 * @example 'top fifth of historical data', 'middle three-fifths'
	 */
	parens: string;
}

// BEGIN: HARDCODED DATA
const S2D_HARDCODED_LEGEND_DATA: ProbabilityVisualization = {
	scale: [40, 50, 60, 70, 80, 90, 100],
	rows: [
		{
			label: 'Above',
			colors: [
				'#FDD0BB',
				'#FBAD94',
				'#F88B6E',
				'#F26A49',
				'#E54E29',
				'#C73518',
			], // (coral gradient)
		},
		{
			label: 'Near',
			colors: [
				'#E5E5E5',
				'#D0D0D0',
				'#BABABA',
				'#A5A5A5',
				'#8F8F8F',
				'#7A7A7A',
			], //  (gray gradient)
		},
		{
			label: 'Below',
			colors: [
				'#D4E8F5',
				'#B5D9EE',
				'#96CAE7',
				'#77BBE0',
				'#58ACD9',
				'#3A9DD2',
			], // (blue gradient)
		},
	],
};
const S2D_HARDCODED_LEGEND_VAR_NAME = 'total precipitation';
const S2D_HARDCODED_LEGEND_OUTCOME = 'unusually high or low';
const S2D_HARDCODED_STMT_ROW_1_VALUE = 80;
const S2D_HARDCODED_STMT_ROW_2_VALUE = 20;
const S2D_HARDCODED_STMT_ROWS: ProbabilityStatementTooltipRow[] = [
	{
		// Unusually high: Above the 80th percentile (top fifth of historical data)
		value: S2D_HARDCODED_STMT_ROW_1_VALUE,
		label: 'Unusually high',
		text: 'Above the %s percentile',
		parens: 'top fifth of historical data',
	},
	{
		// Unusually low: Below the 20th percentile (bottom fifth of historical data)
		value: S2D_HARDCODED_STMT_ROW_2_VALUE,
		label: 'Unusually low',
		text: 'Below the %s percentile',
		parens: 'bottom fifth of historical data',
	},
];
const S2D_HARDCODED_STMT_ROWS_LAST_LINE = __(
	'If the probability is below 30%, no single outcome is significantly more likely ' +
		'than the others, and the climatology should be used instead.'
);
// END: HARDCODED DATA

/**
 * Renders the introductory probability statement for forecast tooltips.
 * Example: "Probability that the total precipitation will be unusually high
 * or low relative to the 1991 to 2020 historical climatology."
 */
const ProbabilityStatement = (props: ProbabilityStatementProps) => {
	const {
		variableName,
		outcome,
		locale,
	} = props;
	const statementRows = S2D_HARDCODED_STMT_ROWS;
	const afterStatementRows = S2D_HARDCODED_STMT_ROWS_LAST_LINE;

	const firstLine = sprintf(
		__(
			'%s: probability that this variable will be %s relative to the 1991 to 2020 historical climatology.'
		),
		__(variableName),
		__(outcome),
	);

	const renderRow = (
		v: ProbabilityStatementTooltipRow,
		idx: number,
	): JSX.Element => {
		const { value, label, text, parens } = v;
		const formattedValue = value + getOrdinalSuffix(value, locale);
		return (
			<div key={idx} className="space-y-0.5">
				<dt className="font-semibold text-gray-900">{__(label)}</dt>
				<dd className="text-gray-700">
					{sprintf(__(text), formattedValue)}
					{parens && (
						<span className="ml-1 text-gray-600">
							({__(parens)})
						</span>
					)}
				</dd>
			</div>
		);
	};

	return (
		<div className="space-y-3 text-sm leading-relaxed">
			<p>{firstLine}</p>
			{statementRows.length > 0 ? (
				<dl className="pl-3 space-y-2 border-l-2 border-gray-300">
					{statementRows.map((v, idx) => renderRow(v, idx))}
				</dl>
			) : (
				void 0
			)}
			{afterStatementRows && <p>{__(afterStatementRows)}</p>}
		</div>
	);
};

export const MapLegendInnerS2D = () => {
	const data = S2D_HARDCODED_LEGEND_DATA;

	/**
	 * Code-Review note: For some reason, we can't use useLocale because the present component says it can't find it. @TODO
	 */
	const { lang = 'fr' } = window.document.documentElement as {
		lang: Intl.LocalesArgument;
	};

	const probabilityStatement: ProbabilityStatementProps = {
		variableName: S2D_HARDCODED_LEGEND_VAR_NAME,
		outcome: S2D_HARDCODED_LEGEND_OUTCOME,
		locale: lang,
	};

	let errorMessage: string | undefined
	const scaleLength = data.scale.length;
	const rowsLengthMustBe = scaleLength - 1;
	for (const [idx, row] of (data?.rows ?? []).entries()) {
		const { colors } = row;
		const curLen = colors.length;
		if (curLen !== rowsLengthMustBe) {
			const message = `
				Inconsistency error at row index ${idx}:
				We're expecting to have exactly ${rowsLengthMustBe}
				and we got an array of ${curLen} color codes
			`
				.replace(/(\n|\s){2,}/g, ' ')
				.trim();
			console.error(message);
			errorMessage = message;
		}
	}

	// Table heading on the left
	const labelWidth = 78; // px
	// Padding around the table
	// Font size to for table headings on the top and left.
	const headingFontSize = '.8rem';
	// The little notch between each levels
	const tickHeight = 6; // px
	// Gap between the tick notch and the level's number
	const numberToTickGap = 2; // px
	// Distance to skew off to mimick aligning. But this is assuming numbers will only be no longer than 3 digits.
	const offsetToAlignInMiddleOfTwoDigitsNumber = 0.5; // em

	// To make sure no collisions with IDs
	const prefix = useMemo(() => nanoid(4), []);

	if (errorMessage) {
		return (<div title={errorMessage}>&hellip;</div>)
	}

	return (
		<div className="w-full font-sans px-2 pt-3">
			{/* Header */}
			<header className="flex justify-center mb-1" id={prefix + '-legend-header'}>
				<span className="mr-1 text-sm font-medium leading-none whitespace-nowrap text-cdc-black">
					{__('Probability') + ' (%)'}
				</span>
				<TooltipWidget
					tooltip={<ProbabilityStatement {...probabilityStatement} />}
				/>
			</header>

			<table
				className="w-full table-fixed px-3 border-separate border-spacing-y-2"
				aria-labelledby={prefix + '-legend-header'}
			>
				<colgroup>
					<col
						style={{ width: `${labelWidth}px` }}
						className="whitespace-nowrap"
					/>
					{data.rows[0].colors.map((_, idx) => {
						return (<col key={idx} />); // Should redistribute equally
					})}
				</colgroup>

				<thead>
					<tr className="translate-y-2">
						<th id={`${prefix}-cat`} scope="col"></th>
						{data.rows[0].colors.map((_, idx) => {
							const startBoundary = data.scale[idx];
							const endBoundary = data.scale[idx + 1];
							const isFirst = idx === 0;

							const ariaLabel = sprintf(
								__('Between %s and %s'),
								startBoundary,
								endBoundary
							);

							return (
								<th
									key={idx}
									id={`${prefix}-b${startBoundary}-b${endBoundary}`}
									aria-label={ariaLabel}
									scope="col"
									className="relative p-0 pb-1 text-sm font-normal"
								>
									{isFirst ? (
										<div className="flex justify-between font-[font-variant-numeric:tabular-nums]">
											{/* First item has 2 marks, 1/2, left boundary, on the left edge */}
											<div className="relative">
												<span
													className="block pb-0.5"
													style={{
														marginLeft: `-${offsetToAlignInMiddleOfTwoDigitsNumber}em`,
													}}
												>
													{startBoundary}
												</span>
												<div
													className="absolute w-px bg-black left-0"
													style={{
														top: `calc(1em + ${numberToTickGap}px)`,
														height: `${tickHeight}px`,
													}}
												></div>
											</div>

											{/* First item has 2 marks, 2/2, right boundary, on the right edge */}
											<div className="relative">
												<span
													className="block pb-0.5"
													style={{
														marginRight: `-${offsetToAlignInMiddleOfTwoDigitsNumber}em`,
													}}
												>
													{endBoundary}
												</span>
												<div
													className="absolute w-px bg-black right-0"
													style={{
														top: `calc(1em + ${numberToTickGap}px)`,
														height: `${tickHeight}px`,
													}}
												></div>
											</div>
										</div>
									) : (
										<div className="relative text-right font-[font-variant-numeric:tabular-nums]">
											{/* Every other items. Boundary at right edge */}
											<span
												className="inline-block pb-0.5"
												style={{
													marginRight: `-${offsetToAlignInMiddleOfTwoDigitsNumber}em`,
												}}
											>
												{endBoundary}
											</span>
											<div
												className="absolute w-px bg-black right-0"
												style={{
													top: `calc(1em + ${numberToTickGap}px)`,
													height: `${tickHeight}px`,
												}}
											></div>
										</div>
									)}
								</th>
							);
						})}
					</tr>
				</thead>

				<tbody>
					{data.rows.map((row, idx) => {
						const rowId = row.label
							.toLowerCase()
							.replace(/\s+/g, '-');
						const isFirst = idx === 0;

						const style: React.CSSProperties = {
							height: 40,
						};
						if (!isFirst) {
							/**
							 * Fidelity with design issue:
							 *
							 * The design describes some white space between each items.
							 * Since we also need to align all gradient between themselves, and because this is tabular data,
							 * there is no other way to have each bar with some spacing than a border.
							 */
							style.borderTop = '10px solid white';
						}

						return (
							<tr key={rowId} style={style}>
								<th
									id={`${prefix}-${rowId}`}
									style={{ fontSize: headingFontSize }}
									scope="row"
									className="pr-2 text-sm font-normal text-right align-middle"
								>
									{__(row.label)}
								</th>
								{row.colors.map((color, idx, arr) => {
									const startBoundary = data.scale[idx];
									const endBoundary = data.scale[idx + 1];
									const isFirst = idx === 0;
									const isLast = idx === arr.length - 1;

									const borderRadius = 3;
									const style: React.CSSProperties = {
										backgroundColor: color,
									};
									/**
									 * Fidelity with design issue:
									 *
									 * We can't have each gradient line have border radius on top and bottom because this is a table and
									 * there is no other way to have each bar with some spacing than a border which then affects how border radius
									 * is calculated.
									 *
									 * So, the following properties are effectively useless:
									 * - borderTopRightRadius
									 * - borderTopLeftRadius
									 */

									if (isFirst) {
										style.borderTopLeftRadius = borderRadius;
										style.borderBottomLeftRadius = borderRadius;
									}
									if (isLast) {
										style.borderTopRightRadius = borderRadius;
										style.borderBottomRightRadius = borderRadius;
									}
									return (
										<td
											key={idx}
											headers={`${prefix}-${rowId} ${prefix}-b${startBoundary}-b${endBoundary}`}
											style={style}
											className="p-0 border-0"
										/>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

MapLegendInnerS2D.displayName = 'MapLegendInnerS2D';

export default MapLegendInnerS2D;
