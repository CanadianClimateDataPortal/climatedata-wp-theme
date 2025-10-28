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
