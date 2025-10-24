import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { __ } from '@/context/locale-provider';

export interface MapLegendOpenControlProps {
	children?: React.ReactNode;
	isOpen: boolean;
	toggleOpen: () => void;
}

export const MapLegendOpenControl: React.FC<MapLegendOpenControlProps> = ({
	children,
	isOpen,
	toggleOpen,
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
						{__('Legend')}
					</span>
					{isOpen ? (
						<ChevronUp className="text-brand-blue w-4 h-4" />
					) : (
						<ChevronDown className="text-brand-blue w-4 h-4" />
					)}
				</button>
			</div>
			{isOpen && children && (
				<>
					<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto">
						{children}
					</div>
				</>
			)}
		</>
	);
};

MapLegendOpenControl.displayName = 'MapLegendOpenControl';

export default MapLegendOpenControl;
