import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { __ } from '@/context/locale-provider';

export interface MapLegendOpenControlProps {
	children?: React.ReactNode;
	isOpen: boolean;
	toggleOpen: () => void;
}

export const MapLegendOpenControl = (props: MapLegendOpenControlProps) => {
	const {
		children,
		isOpen,
		toggleOpen,
	} = props;
	// This should match what we have in MapLegendControl
	return (
		<div className="space-y-[5px] w-[350px]">
			<button
				id="legend-toggle"
				className="legend-toggle flex items-center space-x-2 bg-white border border-cold-grey-3 rounded-md py-1 px-2.5"
				onClick={toggleOpen}
			>
				<span className="font-sans text-sm font-normal leading-5 text-black">
					{__('Legend')}
				</span>
				{isOpen ? (
					<ChevronUp className="w-4 h-4 text-brand-blue" />
				) : (
					<ChevronDown className="w-4 h-4 text-brand-blue" />
				)}
			</button>
			{isOpen && children && (
				<div
					className="relative flex flex-col items-end gap-1 px-1 py-2 overflow-hidden overflow-y-auto bg-white border rounded-md border-cold-grey-3"
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
