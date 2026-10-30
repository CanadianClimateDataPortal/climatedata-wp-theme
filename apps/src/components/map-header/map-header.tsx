/**
 * MapHeader component
 *
 * A component serving as the header for the map. It displays the breadcrumbs
 * for the selected state of the map, a toggle for the variable details panel,
 * a button that opens the share map modal, and the Map and Data download
 * buttons.
 *
 */
import React, { useEffect, useRef, useState } from 'react';

// components
import VariableDetailsPanel from '@/components/map-info/variable-details-panel';
import { ShareModal } from './share-modal';
import { ActionButtons } from './action-buttons';
import { Breadcrumb } from './breadcrumb';

// other
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import type { MapInfoData, ProviderPanelProps } from '@/types/types';

interface MapHeaderProps {
	data: MapInfoData | null;
}

/**
 * MapHeader component, displays the header for the map with breadcrumbs and buttons for extra information.
 */
export const MapHeader = (
	props: MapHeaderProps,
): React.ReactElement => {
	const {
		data = null,
	} = props;
	const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
	const [panelProps, setPanelProps] = useState<
		ProviderPanelProps | undefined
	>(undefined);
	const { togglePanel } = useAnimatedPanel();

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			// set the position of the panel to be below the header. ref here is the toggle buttons container element
			setPanelProps({
				direction: 'right',
				// prevent full width on desktop
				className: 'md:!left-auto',
				position: {
					top: ref.current?.getBoundingClientRect().top || 0,
					left: 0,
				},
			});
		}
	}, [ref]);

	/**
	 * Toggles the visibility of the Share modal.
	 */
	const toggleShareModal = () => {
		setShareModalOpen((prev) => !prev);
	};

	/**
	* Toggles the visibility of the Variable Details panel.
	*/
	const toggleVariableDetailsPanel = () => {
		if (!data) return;
		togglePanel(<VariableDetailsPanel mapInfo={data} />, panelProps);
	};

	return (
		<>
			<aside
				className="relative z-20"
				data-raster="false"
			>
				<div
					ref={ref}
					className="absolute top-0 left-0 overflow-y-auto w-full"
				>
					<div className="flex items-center gap-x-2 bg-white p-4">
						<Breadcrumb
							onClick={toggleVariableDetailsPanel}
						/>
						<ActionButtons
							className="flex gap-3 sm:gap-5 ml-auto"
							onToggleShare={toggleShareModal}
						/>
					</div>
				</div>
			</aside>

			<ShareModal isOpen={shareModalOpen} onClose={toggleShareModal} />
		</>
	);
};
MapHeader.displayName = 'MapHeader'; // Explicit string literal, or this name would be lost in production.

export default MapHeader;
