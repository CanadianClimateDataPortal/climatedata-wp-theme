import React, { useMemo } from 'react';
import { nanoid } from 'nanoid';

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
export interface MapLegendInnerS2DProps {
	//
}

export interface ProbabilityVisualizationRow {
	/**
	 * Label to use for that gradient row
	 */
	label: string; // 'Above', 'Near', 'Below'
	/**
	 * Hexadecimal color codes
	 */
	colors: string[];
}

export type ProbabilityVisualization = {
	scale: number[];
	rows: ProbabilityVisualizationRow[];
};

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

export const MapLegendInnerS2D: React.FC<MapLegendInnerS2DProps> = () => {
	const data = S2D_HARDCODED_LEGEND_DATA;
	const prefix = useMemo(() => nanoid(8), []);

	const labelWidth = 50; // px

	const headingFontSize = '.6rem';

	return (
		<div className="relative">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<span
					className="text-sm font-semibold"
					id={prefix + '-caption'}
				>
					Probability (%)
				</span>
			</div>

			<table className="w-full border-collapse table-fixed">
				<colgroup>
					<col style={{ width: `${labelWidth}px` }} />
					{data.rows[0].colors.map((_, idx, _arr) => {
						let style = {};
						if (idx >= 1 && idx <= _arr.length - 1) {
							style = {
								borderLeft: '1px solid white',
							};
						}
						return <col key={idx} style={style} />;
					})}
				</colgroup>

				<thead>
					<tr>
						<th id={`${prefix}-cat`} scope="col" className=""></th>
						{data.rows[0].colors.map((_, idx) => {
							const startBoundary = data.scale[idx];
							const endBoundary = data.scale[idx + 1];
							const isFirst = idx === 0;

							return (
								<th
									key={idx}
									id={`${prefix}-b${startBoundary}-b${endBoundary}`}
									style={{fontSize: headingFontSize}}
									scope="col"
									className="text-xs font-normal p-0"
								>
									{isFirst ? (
										<div className="flex justify-between">
											<span>{startBoundary}</span>
											<span>{endBoundary}</span>
										</div>
									) : (
										<div className="text-right">
											{endBoundary}
										</div>
									)}
								</th>
							);
						})}
					</tr>
				</thead>

				<tbody>
					{data.rows.map((row) => {
						const rowId = row.label
							.toLowerCase()
							.replace(/\s+/g, '-');

						return (
							<tr key={rowId}>
								<th
									id={`${prefix}-${rowId}`}
									style={{fontSize: headingFontSize}}
									scope="row"
									className="text-right pr-2 text-sm font-normal align-middle"
								>
									{row.label}
								</th>
								{row.colors.map((color, idx) => {
									const startBoundary = data.scale[idx];
									const endBoundary = data.scale[idx + 1];

									return (
										<td
											key={idx}
											headers={`${prefix}-${rowId} ${prefix}-b${startBoundary}-b${endBoundary}`}
											style={{ backgroundColor: color }}
											className="h-6 border-0 p-0"
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HARDCODED_SVG = (
	<>
		<div className="font-sans text-zinc-900 font-semibold text-lg leading-5 text-right">
			cm
		</div>
		<svg height="271" className="w-full">
			<g fill-opacity="1">
				<rect
					width="22"
					height="24.636363636363637"
					fill="#67001F"
					x="59"
					y="0"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#B2182B"
					x="59"
					y="24.636363636363637"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#D6604D"
					x="59"
					y="49.27272727272727"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#F4A582"
					x="59"
					y="73.9090909090909"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#FDDBC7"
					x="59"
					y="98.54545454545455"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#FBF8BF"
					x="59"
					y="123.18181818181819"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#D1E5F0"
					x="59"
					y="147.8181818181818"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#92C5DE"
					x="59"
					y="172.45454545454547"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#4393C3"
					x="59"
					y="197.0909090909091"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#2166AC"
					x="59"
					y="221.72727272727272"
				></rect>
				<rect
					width="22"
					height="24.636363636363637"
					fill="#053061"
					x="59"
					y="246.36363636363637"
				></rect>
			</g>
			<g>
				<text
					x="44"
					y="24.636363636363637"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					150
				</text>
				<line
					x1="49"
					y1="24.636363636363637"
					x2="59"
					y2="24.636363636363637"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="49.27272727272727"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					117
				</text>
				<line
					x1="49"
					y1="49.27272727272727"
					x2="59"
					y2="49.27272727272727"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="73.9090909090909"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					83
				</text>
				<line
					x1="49"
					y1="73.9090909090909"
					x2="59"
					y2="73.9090909090909"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="98.54545454545455"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					50
				</text>
				<line
					x1="49"
					y1="98.54545454545455"
					x2="59"
					y2="98.54545454545455"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="123.18181818181819"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					17
				</text>
				<line
					x1="49"
					y1="123.18181818181819"
					x2="59"
					y2="123.18181818181819"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="147.8181818181818"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					-17
				</text>
				<line
					x1="49"
					y1="147.8181818181818"
					x2="59"
					y2="147.8181818181818"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="172.45454545454547"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					-50
				</text>
				<line
					x1="49"
					y1="172.45454545454547"
					x2="59"
					y2="172.45454545454547"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="197.0909090909091"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					-83
				</text>
				<line
					x1="49"
					y1="197.0909090909091"
					x2="59"
					y2="197.0909090909091"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="221.72727272727272"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					-117
				</text>
				<line
					x1="49"
					y1="221.72727272727272"
					x2="59"
					y2="221.72727272727272"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
			<g>
				<text
					x="44"
					y="246.36363636363637"
					className="legend-temp-text"
					dominant-baseline="middle"
					text-anchor="end"
				>
					-150
				</text>
				<line
					x1="49"
					y1="246.36363636363637"
					x2="59"
					y2="246.36363636363637"
					stroke="black"
					stroke-width="1"
				></line>
			</g>
		</svg>
	</>
);
