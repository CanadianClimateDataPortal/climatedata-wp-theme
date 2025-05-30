import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { TransformedLegendEntry } from '@/types/types';
import { ColourType } from '@/types/climate-variable-interface';

const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;
const GRADIENT_WIDTH = 22;
const TICK_WIDTH = 10;
const MIN_LABEL_SPACING = 30; // Minimum spacing between labels

/**
 * Map legend control component, displays the toggle button to collapse/expand the svg legend element.
 */
const MapLegendControl: React.FC<{
	data: TransformedLegendEntry[];
	isOpen: boolean;
	toggleOpen: () => void;
	isCategorical?: boolean;
	hasCustomScheme?: boolean;
	unit?: string;
	colourType?: string;
}> = ({ data, isOpen, toggleOpen, isCategorical, hasCustomScheme, unit, colourType }) => {
	const [svgWidth, setSvgWidth] = useState(0);
	const [legendHeight, setLegendHeight] = useState<number | undefined>(undefined);
	const svgRef = useRef<SVGSVGElement>(null);

	const isBlocksGradient = isCategorical || colourType === ColourType.DISCRETE;

	// Calculate dynamic height based on number of labels and minimum spacing
	const totalLabels = isBlocksGradient ? data.length : data.length;
	const GRADIENT_HEIGHT = legendHeight !== undefined ? legendHeight : (totalLabels - 1) * MIN_LABEL_SPACING + PADDING_TOP + PADDING_BOTTOM;
	const LEGEND_HEIGHT = GRADIENT_HEIGHT + (isBlocksGradient ? PADDING_BOTTOM : 0);

	// For categorical/discrete data, we want equal height blocks for each category
	const ITEM_HEIGHT = GRADIENT_HEIGHT / (isBlocksGradient ? data.length : (data.length - 1));

	// Position gradient box, label and line horizontally
	const gradientX = svgWidth - GRADIENT_WIDTH;
	const labelX = gradientX - TICK_WIDTH - 5;
	const lineStartX = gradientX - TICK_WIDTH;
	const lineEndX = gradientX;

	useEffect(() => {
		if (svgRef.current) {
			setSvgWidth(svgRef.current.getBoundingClientRect().width);
		}
	}, []);

	useEffect(() => {
		function updateLegendHeight() {
			if (svgRef.current) {
				const svgTop = svgRef.current.getBoundingClientRect().y;
				const available = window.innerHeight - svgTop - PADDING_TOP - 20; // 15px leaflet banner.
				setLegendHeight(available);
			}
		}
		updateLegendHeight();
		window.addEventListener('resize', updateLegendHeight);
		return () => window.removeEventListener('resize', updateLegendHeight);
	}, []);

	return (
		<div className="space-y-[5px] w-[91px]">
			<button
				id="legend-toggle"
				className="legend-toggle flex items-center space-x-2 bg-white border border-cold-grey-3 rounded-md py-1 px-2.5"
				onClick={toggleOpen}
			>
				<span className="font-sans text-black text-sm font-normal leading-5">
					{__('Legend')}
				</span>
				{isOpen ? (
					<ChevronUp className="text-brand-blue w-4 h-4" />
				) : (
					<ChevronDown className="text-brand-blue w-4 h-4" />
				)}
			</button>

			{isOpen && (
				<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto">
					<div className="font-sans text-zinc-900 font-semibold text-lg leading-5 capitalize text-right">
						{unit}
					</div>
					<svg ref={svgRef} height={LEGEND_HEIGHT} className="w-full">
						{isBlocksGradient ? (
							<g>
								{data.map((entry, index) => (
									<rect
										key={index}
										width={GRADIENT_WIDTH}
										height={ITEM_HEIGHT}
										fill={entry.color}
										opacity={entry.opacity}
										x={gradientX}
										y={PADDING_TOP + index * ITEM_HEIGHT}
									/>
								))}
							</g>
						) : (
							<>
								<defs>
									<linearGradient
										id="temperatureGradient"
										gradientTransform="rotate(90)"
									>
										{data.map((entry, index) => (
											<stop
												key={index}
												offset={`${(index / (data.length - 1)) * 100}%`}
												stopColor={entry.color}
												stopOpacity={entry.opacity}
											/>
										))}
									</linearGradient>
								</defs>

								<rect
									width={GRADIENT_WIDTH}
									height={LEGEND_HEIGHT}
									fill="url(#temperatureGradient)"
									x={gradientX}
								/>
							</>
						)}

						{data.map((entry, index) => {
							const y = PADDING_TOP + index * ITEM_HEIGHT;
							// For categorical/discrete data, center the label in the block
							const labelY = isBlocksGradient ? y + (ITEM_HEIGHT / 2) : y;

							// Custom scheme variables like "building_climate_zones" may have labels that can be parsed but shouldn't
							//  eg. 7A, 7B, 8 -- so those even if parseable we should keep them as they are
							let parsedLabel = hasCustomScheme
								? entry.label
								: parseFloat(entry.label);

							// Still getting NaN for labels like dates -- Jul 01, Jun 21, etc so fall back to the received label instead
							if (isNaN(Number(parsedLabel))) {
								parsedLabel = entry.label;
							}

							return (
								<g key={index}>
									<text
										x={labelX}
										y={labelY}
										className="legend-temp-text"
										dominantBaseline="middle"
										textAnchor="end"
									>
										{parsedLabel}
									</text>
									<line
										x1={lineStartX}
										y1={labelY}
										x2={lineEndX}
										y2={labelY}
										stroke="black"
										strokeWidth="1"
									/>
								</g>
							);
						})}
					</svg>
				</div>
			)}
		</div>
	);
};

export default React.memo(MapLegendControl);
