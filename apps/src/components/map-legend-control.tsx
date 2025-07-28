import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { TransformedLegendEntry } from '@/types/types';
import { ColourType } from '@/types/climate-variable-interface';
import { ColorMap } from '@/types/types';
import { getUnitName } from "@/lib/utils";

const GRADIENT_WIDTH = 22;
const TICK_WIDTH = 10;
const MIN_LABEL_SPACING = 30; // Minimum spacing between labels

interface MapLegendControlProps {
	data: ColorMap;
	isOpen: boolean;
	toggleOpen: () => void;
	isCategorical?: boolean;
	isDelta: boolean;
	isDefaultColourScheme: boolean;
	isSeaLevel: boolean;
	hasCustomScheme?: boolean;
	unit?: string;
	colourType?: string;
}

/**
 * Map legend control component, displays the toggle button to collapse/expand the svg legend element.
 */
const MapLegendControl: React.FC<MapLegendControlProps> = (
	{ data, isOpen, toggleOpen, isCategorical, isDelta, isDefaultColourScheme, isSeaLevel, hasCustomScheme, unit, colourType }
) => {
	const [svgWidth, setSvgWidth] = useState(0);
	const [legendHeight, setLegendHeight] = useState<number | undefined>(undefined);
	const svgRef = useRef<SVGSVGElement>(null);
	const isBlocksGradient = isCategorical || colourType === ColourType.DISCRETE;
	let unitName = getUnitName(unit ?? '');
	const legendValues = [...data.quantities].reverse();
	const legendColors = [...data.colors].reverse();

	// We add an extra value and color at the top of the legend, to show a color
	// exceeding the maximum value. The value won't be shown (hence it's NaN)
	legendValues.unshift(NaN);
	legendColors.unshift(legendColors[0]);

	
	if (unit === 'DoY' && isDelta) {
		unitName = getUnitName('days');
	}

	// Calculate dynamic height based on number of labels and minimum spacing
	const totalLabels = legendValues.length;
	const GRADIENT_HEIGHT = legendHeight !== undefined ? legendHeight : totalLabels * MIN_LABEL_SPACING;
	const LEGEND_HEIGHT = GRADIENT_HEIGHT;

	// Position gradient box, label and line horizontally
	const gradientX = svgWidth - GRADIENT_WIDTH;
	const labelX = gradientX - TICK_WIDTH - 5;
	const lineStartX = gradientX - TICK_WIDTH;
	const lineEndX = gradientX;

	// Used to skip a legend label if it's the same as the previous one
	let previousLabel = '';

	// If first or last color should be bigger
	//const [maxItemExtra, setMaxItemExtra] = useState<number>(0);
	const [itemHeight, setItemHeight] = useState<number>(0);
	//const [maxItemHeight, setMaxItemHeight] = useState<number>(0);
	//const [minItemHeight, setMinItemHeight] = useState<number>(0);

	useEffect(() => {
		//const currentMaxItemExtra = isCategorical || !isDefaultColourScheme || (isDefaultColourScheme && isDelta) || isSeaLevel ? 0 : 0.5;
		//const currentMinItemExtra = isCategorical || (isDefaultColourScheme && isDelta) || isSeaLevel
		//	? 0 :
		//	(isDefaultColourScheme && !isDelta)
		//		? 0.5
		//		: 1;

		//const currentItemHeight = GRADIENT_HEIGHT / (totalLabels + currentMaxItemExtra + currentMinItemExtra);
		const currentItemHeight = GRADIENT_HEIGHT / totalLabels;
		//const currentMaxItemHeight = currentItemHeight * (1 + currentMaxItemExtra);
		//const currentMinItemHeight = currentItemHeight * (1 + currentMinItemExtra);

		//setMaxItemExtra(currentMaxItemExtra)
		setItemHeight(currentItemHeight);
		//setMaxItemHeight(currentMaxItemHeight);
		//setMinItemHeight(currentMinItemHeight);
	}, [isCategorical, isDefaultColourScheme, isDelta, GRADIENT_HEIGHT, totalLabels]);

	useEffect(() => {
		if (svgRef.current) {
			setSvgWidth(svgRef.current.getBoundingClientRect().width);
		}
	}, []);

	useEffect(() => {
		function updateLegendHeight() {
			if (svgRef.current) {
				const svgTop = svgRef.current.getBoundingClientRect().y;
				const available = window.innerHeight - svgTop - 15; // 15px leaflet banner.
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
					<div className="font-sans text-zinc-900 font-semibold text-lg leading-5 text-right">
						{unitName}
					</div>
					<svg ref={svgRef} height={LEGEND_HEIGHT} className="w-full">
						{isBlocksGradient ? (
							<g>
								{legendColors.map((color, index) => {
									let height = itemHeight;
									/*if (index === 0) {
										height = maxItemHeight;
									} else if (index === legendColors.length - 1) {
										height = minItemHeight;
									}*/

									// let paddingTop = PADDING_TOP;
									const rectY = index * itemHeight;
									/*if(index > 0) {
										paddingTop += maxItemHeight + (index - 1) * itemHeight;
									}*/

									return (
										<rect
											key={index}
											width={GRADIENT_WIDTH}
											height={height}
											fill={color}
											x={gradientX}
											y={rectY}
										/>
									);
								})}
							</g>
						) : (
							<>
								<defs>
									<linearGradient
										id="temperatureGradient"
										gradientTransform="rotate(90)"
									>
										{legendColors.map((color, index) => {
											// let offset = 0;
											let offset = (index  / totalLabels) * 100;
											/*if(index > 0) {
												offset = ((index + maxItemExtra) / totalLabels) * 100;
											}*/

											return (
												<stop
													key={index}
													offset={`${offset}%`}
													stopColor={color}
												/>
											)
										})}
									</linearGradient>
								</defs>

								<rect
									width={GRADIENT_WIDTH}
									height={GRADIENT_HEIGHT}
									fill="url(#temperatureGradient)"
									x={gradientX}
								/>
							</>
						)}

						{legendValues.map((quantity, index) => {
							const labelY = index * itemHeight;
							let parsedLabel = '';

							if (!Number.isNaN(quantity)) {
								parsedLabel = String(quantity);
								// Add '+' for delta values
								const prefix = isDelta && quantity > 0 ? '+' : '';
								parsedLabel = prefix + String(parsedLabel);
							}

							// Custom scheme variables like "building_climate_zones" may have labels that can be parsed but shouldn't
							//  eg. 7A, 7B, 8 -- so those even if parseable we should keep them as they are

							/*let parsedLabel = hasCustomScheme
								? entry.label
								: parseFloat(String(entry.label));*/
							// Still getting NaN for labels like dates -- Jul 01, Jun 21, etc so fall back to the received label instead
							/*if (isNaN(Number(parsedLabel))) {
								parsedLabel = entry.label;
							}*/


							// Skip if the current parsedLabel is the same as the previous one
							if (parsedLabel === previousLabel) {
								return null;
							}
							previousLabel = parsedLabel;

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
