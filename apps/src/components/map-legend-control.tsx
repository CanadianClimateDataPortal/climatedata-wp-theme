import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

import { TransformedLegendEntry } from '@/types/types';

const LEGEND_HEIGHT = 420;
const LEGEND_WIDTH = 54;
const MAX_LABELS = 10;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;
const GRADIENT_WIDTH = 22;

/**
 * Map legend control component, displays the toggle button to collapse/expand the svg legend element.
 */
const MapLegendControl: React.FC<{
	data: TransformedLegendEntry[];
	isOpen: boolean;
	toggleOpen: () => void;
}> = ({ data, isOpen, toggleOpen }) => {
	const { __ } = useI18n();

	// TODO: all these calculations were made so that we could match the design as closely as possible
	//  because the space between the labels is larger than in the original implementation.. confirm this is correct
	const GRADIENT_HEIGHT = LEGEND_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
	const ITEM_HEIGHT = GRADIENT_HEIGHT / (data.length - 1);

	const reducedLabels = useMemo(() => {
		const interval = Math.ceil(data.length / MAX_LABELS);
		return data.filter((_, index) => index % interval === 0);
	}, [data]);

	return (
		<div className="space-y-[5px] w-[91px]">
			<button
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
				<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1">
					<div className="font-sans text-zinc-900 font-semibold text-lg leading-5">
						°C
					</div>

					<svg width={LEGEND_WIDTH} height={LEGEND_HEIGHT}>
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
							x="35"
						/>

						{reducedLabels.map((entry) => {
							const index = data.indexOf(entry);
							const y = PADDING_TOP + index * ITEM_HEIGHT;

							return (
								<g key={entry.label}>
									<text
										x="20"
										y={y}
										className="legend-temp-text"
										dominantBaseline="middle"
										textAnchor="end"
									>
										{parseInt(entry.label)}
									</text>
									<line
										x1="25"
										y1={y - 2}
										x2="35"
										y2={y - 2}
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
