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
	// This should match what we have in MapLegendControl
	return (
		<div className="space-y-[5px] w-[350px]">
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
			{isOpen && children && (
				<div
					className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto relative overflow-hidden"
					style={{ paddingRight: 10 }}
				>
					{children}
				</div>
			)}
		</div>
	);
};

MapLegendOpenControl.displayName = 'MapLegendOpenControl';

export default MapLegendOpenControl;
