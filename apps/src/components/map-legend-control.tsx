import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { ColourType, LegendConfig } from '@/types/climate-variable-interface';
import { ColourMap } from '@/types/types';
import { getUnitName } from '@/lib/utils';
import { doyFormatter, formatValue } from '@/lib/format.ts';

const GRADIENT_WIDTH = 22;
const TICK_WIDTH = 10;
const MIN_LABEL_SPACING = 30; // Minimum spacing between labels

interface MapLegendControlProps {
	data: ColourMap;
	isOpen: boolean;
	toggleOpen: () => void;
	isCategorical?: boolean;
	isDelta: boolean;
	unit?: string;
	legendConfig?: LegendConfig;
	colourType?: string;
	locale?: string;
}

/**
 * Map legend control component, displays the toggle button to collapse/expand the svg legend element.
 */
const MapLegendControl: React.FC<MapLegendControlProps> = (
	{ data, isOpen, toggleOpen, isCategorical, isDelta, unit, legendConfig, colourType, locale = 'en' }
) => {
	const [svgWidth, setSvgWidth] = useState(0);
	const [legendHeight, setLegendHeight] = useState<number | undefined>(undefined);
	const svgRef = useRef<SVGSVGElement>(null);
	const isBlocksGradient = isCategorical || colourType === ColourType.DISCRETE;
	let unitName = getUnitName(unit ?? '');
	const legendValues = [...data.quantities].reverse();
	const legendColors = [...data.colours].reverse();

	// We add an extra value and color at the top of the legend, to show a color
	// exceeding the maximum value. The value won't be shown (hence it's NaN)
	if (legendConfig?.addTopPadding) {
		legendValues.unshift(NaN);
		legendColors.unshift(legendColors[0]);
	}

	if (legendConfig?.hideBottomValue) {
		legendValues[legendValues.length - 1] = NaN;
	}

	if (legendConfig?.hideTopValue) {
		legendValues[0] = NaN;
	}

	if (legendConfig?.valuesInKelvin) {
		legendValues.forEach((value, index) => {
			legendValues[index] -= 273.15;
		});
	}

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
	let previousValue = NaN;

	const [itemHeight, setItemHeight] = useState<number>(0);

	useEffect(() => {
		const currentItemHeight = GRADIENT_HEIGHT / totalLabels;
		setItemHeight(currentItemHeight);
	}, [GRADIENT_HEIGHT, totalLabels]);

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
									return (
										<rect
											key={index}
											width={GRADIENT_WIDTH}
											height={itemHeight}
											fill={color}
											x={gradientX}
											y={index * itemHeight}
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
											const offset = (index  / totalLabels) * 100;

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

						{legendValues.map((value, index) => {

							if (Number.isNaN(value)) {
								return;
							}

							if (value === previousValue) {
								return;
							}
							previousValue = value;

							let label;

							if (unit === 'DoY' && !isDelta) {
								label = doyFormatter(value, locale, 'short');
							} else {
								const decimals = legendConfig?.decimals ?? 0;
								label = formatValue(value, undefined, decimals, locale, isDelta);
							}

							const labelY = index * itemHeight;

							return (
								<g key={index}>
									<text
										x={labelX}
										y={labelY}
										className="legend-temp-text"
										dominantBaseline="middle"
										textAnchor="end"
									>
										{label}
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
