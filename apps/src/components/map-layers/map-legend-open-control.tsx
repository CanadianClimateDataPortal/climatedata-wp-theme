import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';

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

	const maxLegendWidth = 500; // px
	const rootElementStyle: React.CSSProperties = {
		width: `${maxLegendWidth}px`,
	};

	// This should match what we have in MapLegendControl
	return (
		<div
			className="relative space-y-[5px]"
			style={rootElementStyle}
		>
			<div className="flex flex-col items-end">
				<button
					id="legend-toggle"
					className={cn(
						'flex items-center space-x-2  py-1 px-2.5' /* alignment */,
						'bg-white border border-cold-grey-3 rounded-md' /* visual */,
					)}
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
			</div>
			{isOpen && children && (
				<div
					className={cn(
						'relative flex flex-col overflow-hidden overflow-y-auto' /* positioning and overflow */,
						'items-end gap-1 px-2 py-4' /* alignment */,
						'bg-white border rounded-md border-cold-grey-3' /* visual */,
					)}
					style={{
						paddingRight: 20,
						paddingLeft: 20,
					}}
				>
					{children}
				</div>
			)}
		</div>
	);
};

MapLegendOpenControl.displayName = 'MapLegendOpenControl';

export default MapLegendOpenControl;
