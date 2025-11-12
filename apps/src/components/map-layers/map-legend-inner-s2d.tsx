import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { sprintf } from '@wordpress/i18n';

import { __ } from '@/context/locale-provider';
import { getOrdinalSuffix } from '@/lib/format';
import TooltipWidget from '@/components/ui/tooltip-widget';
import { type ColourQuantitiesMap } from '@/types/types';
import {
	ForecastTypes,
	type ForecastType,
} from '@/types/climate-variable-interface';

import {
	transformColorMapToMultiBandLegend,
	type MultiBandLegend,
} from '@/lib/multi-band-legend';

/**
 * Props for component contextual information to rendering a probability forecast statement
 */
interface ProbabilityStatementProps {
	/**
	 * Climate variable being shown
	 *
	 * @example 'total precipitation', 'mean temperature'
	 */
	variableName: string;

	/**
	 * Qualitative description
	 *
	 * @example 'unusually high or low', 'above normal'
	 */
	outcome: string;

	/**
	 * The type of forecast being described
	 */
	forecastType?: ForecastType | null;
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
	 * Description Term item title
	 *
	 * @example 'Unusually high'
	 */
	label: string;

	/**
	 * Description Term Details -- one or many lines under that label
	 *
	 * @example 'Above the 66th percentile ...'
	 */
	text: string;
}

/**
 * Renders the introductory probability statement for forecast tooltips.
 * Example: "Probability that the total precipitation will be unusually high
 * or low relative to the 1991 to 2020 historical climatology."
 */
const ProbabilityStatement = (props: ProbabilityStatementProps) => {
	const {
		variableName,
		outcome,
		forecastType,
	} = props;
	const statementRows: ProbabilityStatementTooltipRow[] = [];
	let afterStatementParagraph: string | undefined = void 0;

	const beforeStatement = sprintf(
		__(
			'%s: probability that this variable will be %s relative to the 1991 to 2020 historical climatology.'
		),
		__(variableName),
		__(outcome),
	);

	if (forecastType === ForecastTypes.EXPECTED) {
		statementRows.push({
			label: __('Above normal'),
			text: __('Above the 66th percentile (upper third of historical data)'),
		});
		statementRows.push({
			label: __('Near normal'),
			text: __('Between the 33rd and 66th percentiles (middle third of historical data)'),
		});
		statementRows.push({
			label: __('Below normal'),
			text: __('Below the 33rd percentile (lower third of historical data)'),
		});
		afterStatementParagraph = __(
			'If the probability is below 40%, no single outcome is significantly more likely ' +
				'than the others, and the climatology should be used instead.'
		);
	} else if (forecastType === ForecastTypes.UNUSUAL) {
		statementRows.push({
			label: __('Unusually high'),
			text: __('Above the 80th percentile (top fifth of historical data)'),
		});
		statementRows.push({
			label: __('Unusually low'),
			text: __('Below the 20th percentile (bottom fifth of historical data)'),
		});
		afterStatementParagraph = __(
			'If the probability is below 30%, no single outcome is significantly more likely ' +
				'than the others, and the climatology should be used instead.'
		);
	}

	const renderRow = (
		v: ProbabilityStatementTooltipRow,
		idx: number,
	): JSX.Element => {
		const { label, text } = v;
		return (
			<div key={idx} className="space-y-0.5">
				<dt className="font-semibold text-gray-900">{label}</dt>
				<dd className="text-gray-700">
					{text}
				</dd>
			</div>
		);
	};

	return (
		<div className="space-y-3 text-sm leading-relaxed">
			<p>{beforeStatement}</p>
			{statementRows.length > 0 ? (
				<dl className="pl-3 space-y-2 border-l-2 border-gray-300">
					{statementRows.map((v, idx) => renderRow(v, idx))}
				</dl>
			) : (
				void 0
			)}
			{afterStatementParagraph && <p>{afterStatementParagraph}</p>}
		</div>
	);
};

export interface MapLegendInnerS2DProps {
	data: ColourQuantitiesMap;
	forecastType?: ForecastType | null;
}

export type MapLegendInnerS2D = typeof MapLegendInnerS2D;

export const MapLegendInnerS2D = (
	props: MapLegendInnerS2DProps
): JSX.Element => {

	let data: MultiBandLegend = {
		rows: [
			{ label: '', colors: [] },
		],
		scale: [],
	};

	const {
		data: colorMap,
		forecastType,
	} = props;

	const transformed = transformColorMapToMultiBandLegend(colorMap);
	if (transformed && transformed?.rows) {
		if (transformed.rows.length === 3) {
			// We know it's for Forecast
			data = transformed;
			// There's probably a better way to do this
			Reflect.set(data.rows?.[0], 'label', 'Above');
			Reflect.set(data.rows?.[1], 'label', 'Near');
			Reflect.set(data.rows?.[2], 'label', 'Below');
		} else if (transformed.rows.length === 2) {
			// We know it's climatology
			data = transformed;
			Reflect.set(data.rows?.[0], 'label', 'Unusually high');
			Reflect.set(data.rows?.[1], 'label', 'Unusually low');
		}
	}

	const probabilityStatement: ProbabilityStatementProps = {
		variableName: 'total precipitation',
		outcome: 'unusually high or low',
		forecastType,
	};

	let errorMessage: string | undefined
	const scaleLength = (data?.scale ?? []).length;
	if (scaleLength > 0) {
		const rowsLengthMustBe = scaleLength - 1;
		for (const [idx, row] of (data?.rows ?? []).entries()) {
			const { colors = [] } = row ?? {};
			const curLen = colors.length;
			if (curLen > 0 && curLen !== rowsLengthMustBe) {
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
		return (<div title={errorMessage}>&hellip;</div>);
	}

	return (
		<div className="w-full font-sans px-2 pt-3">
			{/* Header */}
			<header
				className="flex justify-center mb-1"
				id={prefix + '-legend-header'}
			>
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
					{data.rows.map(({ label = '', colors = [] }, idx) => {
						const rowId = label
							.toLowerCase()
							.replace(/\s+/g, '-');
						const isFirst = idx === 0;

						if (colors.length < 1) {
							return (
								<tr>
									<th>&nbsp;</th>
								</tr>
							)
						}

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
									{__(label)}
								</th>
								{colors.map((color, idx, arr) => {
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
