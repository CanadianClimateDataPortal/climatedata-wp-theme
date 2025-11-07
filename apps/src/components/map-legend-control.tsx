import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { nanoid } from 'nanoid';

import { __ } from '@/context/locale-provider';

import { ColourType, LegendConfig } from '@/types/climate-variable-interface';
import { ColourMap } from '@/types/types';
import { getUnitName } from '@/lib/utils';
import { doyFormatter, formatValue } from '@/lib/format';
import { TooltipContent } from '@radix-ui/react-tooltip';

import TooltipWidget from '@/components/ui/tooltip-widget';

const GRADIENT_WIDTH = 22;
const TICK_WIDTH = 10;
const MIN_LABEL_SPACING = 30; // Minimum spacing between labels

export type MapLegendControlProps = {
	data: ColourMap;
	opacity: number;
	isCategorical?: boolean;
	isDelta: boolean;
	unit?: string;
	legendConfig?: LegendConfig;
	colourType?: string;
	locale?: string;
	title?: string;
	tooltipContents?: React.ReactNode;
}

export type MapLegendControl = typeof MapLegendControl;

export const MapLegendControl = (
	props: MapLegendControlProps
): JSX.Element => {
	const {
		data,
		opacity,
		isCategorical,
		isDelta,
		unit,
		legendConfig,
		colourType,
		locale = 'en',
		title,
		tooltipContents,
	} = props;

	const [svgWidth, setSvgWidth] = useState(0);
	const [availableHeight, setAvailableHeight] = useState<number | undefined>(undefined);
	const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
	const svgRef = useCallback((element: SVGSVGElement | null) => {
		setSvgElement(element);
	}, []);
	const isBlocksGradient = isCategorical || colourType === ColourType.DISCRETE;
	let unitName = getUnitName(unit ?? '');
	const legendValues = [...data.quantities].reverse();
	const legendColors = [...data.colours].reverse();

	if (legendConfig?.addTopPadding) {
		// A label won't be generated for an NaN value.
		legendValues.unshift(NaN);
		legendColors.unshift(legendColors[0]);
	}

	if (legendConfig?.hideBottomLabel) {
		legendValues[legendValues.length - 1] = NaN;
	}

	if (legendConfig?.hideTopLabel) {
		legendValues[0] = NaN;
	}

	if (legendConfig?.valuesInKelvin) {
		for (let i = 0; i < legendValues.length; i++) {
			legendValues[i] -= 273.15;
		}
	}

	if (unit === 'DoY' && isDelta) {
		unitName = getUnitName('days');
	}

	// Calculate dynamic height based on the number of labels and minimum spacing
	const totalLabels = legendValues.length;
	const legendHeight = availableHeight !== undefined ? availableHeight : totalLabels * MIN_LABEL_SPACING;

	// Position gradient box, label and line horizontally

	const gradientX = svgWidth - GRADIENT_WIDTH;
	const labelX = gradientX - TICK_WIDTH - 5;
	const lineStartX = gradientX - TICK_WIDTH;
	const lineEndX = gradientX;

	// Used to skip a legend label if it's the same as the previous one
	let previousLabel = '';

	const [itemHeight, setItemHeight] = useState<number>(0);

	useEffect(() => {
		const currentItemHeight = legendHeight / totalLabels;
		setItemHeight(currentItemHeight);
	}, [legendHeight, totalLabels]);

	/**
	 * Save the SVG width
	 */
	useEffect(() => {
		if (!svgElement) {
			return;
		}

		const width = svgElement.getBoundingClientRect().width;
		setSvgWidth(width);
	}, [svgElement]);

	/**
	 * Update the available height for the SVG element.
	 */
	useEffect(() => {
		if (!svgElement) {
			return;
		}

		function updateLegendHeight() {
			if (svgElement) {
				const svgTop = svgElement.getBoundingClientRect().y;
				const available = window.innerHeight - svgTop - 15; // 15px leaflet banner.
				setAvailableHeight(available);
			}
		}
		updateLegendHeight();
		window.addEventListener('resize', updateLegendHeight);

		return () => {
			window.removeEventListener('resize', updateLegendHeight);
		}
	}, [svgElement]);

	// To make sure no collisions with IDs
	const prefix = useMemo(() => nanoid(4), []);

	const titleBlock = typeof title === 'string' && (
		<header
			className="flex justify-center mb-1 text-center"
			id={prefix + '-legend-header'}
		>
			<span className="text-sm font-medium leading-none text-cdc-black">
				{__(title)}!
			</span>
			{tooltipContents ? (<TooltipWidget tooltip={tooltipContents} />) : (void 0)}
		</header>
	)

	return (
		<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto">
			{titleBlock}
			<div className="font-sans text-zinc-900 font-semibold text-lg leading-5 text-right">
				{unitName}
			</div>
			<svg
				ref={svgRef}
				height={legendHeight}
				className="w-full"
				aria-labelledby={titleBlock ? prefix + '-legend-header' : void 0}
			>
				{isBlocksGradient ? (
					<g fillOpacity={opacity}>
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
							height={legendHeight}
							fill="url(#temperatureGradient)"
							x={gradientX}
							fillOpacity={opacity}
						/>
					</>
				)}

				{legendValues.map((value, index) => {

					if (Number.isNaN(value)) {
						return;
					}

					let label = '';

					if (legendConfig?.labels && legendConfig?.labels[index]) {
						// The values' list was reversed, so we have to take the reverse of the custom labels
						const customLabel = legendConfig.labels[legendValues.length - 1 - index];
						if (customLabel != undefined) {
							label = __(customLabel);
						}
					} else if (unit === 'DoY' && !isDelta) {
						label = doyFormatter(value, locale, 'short');
					} else {
						const decimals = legendConfig?.decimals ?? 0;
						label = formatValue(value, undefined, decimals, locale, isDelta);
					}

					if (label === previousLabel) {
						return;
					}
					previousLabel = label;

					let labelY = index * itemHeight;

					if (legendConfig?.centerLabels) {
						labelY += itemHeight / 2;
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
	);
};

MapLegendControl.displayName = 'MapLegendControl';

export default React.memo(MapLegendControl);
