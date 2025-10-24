import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { ColourMap } from '@/types/types';

export interface MapLegendVizProps {
	data: ColourMap;
	children: React.ReactNode,
}

export interface MapLegendControlS2DProps extends Partial<MapLegendVizProps> {
	isOpen: boolean;
	toggleOpen: () => void;
}

const MapLegendViz: React.FC<MapLegendVizProps> = ({
	children,
}) => {
	return (
		<>
			<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto">
				{children}
			</div>
		</>
	);
};

export const MapLegendControlS2D: React.FC<MapLegendControlS2DProps> = ({
	data,
	toggleOpen,
	isOpen,
	children,
}) => {
	return (
		<>
			<div className="space-y-[5px] w-[230px]">
				<button
					id="legend-toggle"
					className="legend-toggle flex items-center space-x-2 bg-white border border-cold-grey-3 rounded-md py-1 px-2.5"
					onClick={toggleOpen}
				>
					<span className="font-sans text-black text-sm font-normal leading-5">
						S2D Specific Legend
					</span>
					{isOpen ? (
						<ChevronUp className="text-brand-blue w-4 h-4" />
					) : (
						<ChevronDown className="text-brand-blue w-4 h-4" />
					)}
				</button>
			</div>
			{isOpen && <MapLegendViz data={data} children={children} />}
		</>
	);
};

MapLegendControlS2D.displayName = 'MapLegendControlS2D';

export default MapLegendControlS2D;
