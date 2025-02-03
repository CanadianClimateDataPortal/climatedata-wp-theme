/**
 * MapHeader component
 *
 * A component serving as the header for the map. It displays the breadcrumbs
 * for the selected state of the map, a toggle for the variable details panel,
 * and buttons that toggle share and download map modals.
 *
 */
import React, { useEffect, useRef, useState } from 'react';
import { Info, Share2, Download } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { Button } from '@/components/ui/button';

// components
import VariableDetailsPanel from '@/components/map-info/variable-details-panel';
import ShareMapModal from '@/components/map-info/share-map-modal';
import DownloadMapModal from '@/components/map-info/download-map-modal';

// other
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { MapInfoProps, ProviderPanelProps } from '@/types/types';

/**
 * MapHeader component, displays the header for the map with breadcrumbs and buttons for extra information.
 */
const MapHeader: React.FC<MapInfoProps> = ({
	data,
	mapRef,
}): React.ReactElement => {
	const [shareInfo, setShareInfo] = useState<boolean>(false);
	const [downloadInfo, setDownloadInfo] = useState<boolean>(false);
	const [panelProps, setPanelProps] = useState<
		ProviderPanelProps | undefined
	>(undefined);

	const { togglePanel } = useAnimatedPanel();

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			// set the position of the panel to be below the header.. ref here is the toggle buttons container element
			setPanelProps({
				direction: 'right',
				position: {
					top: ref.current?.getBoundingClientRect().bottom || 0,
				},
			});
		}
	}, [ref]);

	/**
	 * Toggles the visibility of the Share modal.
	 */
	const toggleShareInfo = () => {
		setShareInfo((prev) => !prev);
		setDownloadInfo(false);
	};

	/**
	 * Toggles the visibility of the Download modal.
	 */
	const toggleDownloadInfo = () => {
		setDownloadInfo((prev) => !prev);
		setShareInfo(false);
	};

	/**
	 * Toggles the visibility of the Variable Details panel.
	 */
	const toggleVariableDetailsPanel = () => {
		togglePanel(<VariableDetailsPanel mapInfo={data} />, panelProps);
	};

	return (
		<aside className="map-header">
			<div
				ref={ref}
				className="absolute top-0 left-0 z-[9999] overflow-y-auto w-full"
			>
				<div className="flex items-center gap-x-2 bg-white p-4">
					<Breadcrumbs
						title={data.title}
						onClick={toggleVariableDetailsPanel}
					/>
					<ModalToggleButtons
						onToggleShare={toggleShareInfo}
						onToggleDownload={toggleDownloadInfo}
					/>
				</div>

				<ShareMapModal isOpen={shareInfo} onClose={toggleShareInfo} />
				<DownloadMapModal
					isOpen={downloadInfo}
					onClose={toggleDownloadInfo}
					title={data.title}
					mapRef={mapRef}
				/>
			</div>
		</aside>
	);
};
MapHeader.displayName = 'MapHeader';

/**
 * Breadcrumbs component, displays the breadcrumbs for the selected state of the map.
 */
const Breadcrumbs: React.FC<{ title: string; onClick: () => void }> = ({
	title,
	onClick,
}) => {
	const { __ } = useI18n();

	// TODO: replace this with dynamically generated breadcrumbs
	return (
		<div>
			<span className="me-2">{__('ClimateData Canada')}</span>/
			<span className="mx-2">{__('Map')}</span>/
			<Button
				variant="ghost"
				className="text-md text-cdc-black hover:text-dark-purple hover:bg-transparent ms-2 p-0 h-auto"
				onClick={onClick}
				aria-label={__('View details')}
			>
				{title}
				<Info />
			</Button>
		</div>
	);
};
Breadcrumbs.displayName = 'Breadcrumbs';

/**
 * ModalToggleButtons component, shows buttons that toggle modals with extra functionality for the map.
 */

const ModalToggleButtons: React.FC<{
	onToggleShare: () => void;
	onToggleDownload: () => void;
}> = ({ onToggleShare, onToggleDownload }) => {
	const { __ } = useI18n();

	return (
		<div className="flex gap-2 ml-auto">
			<Button
				variant="outline"
				className="rounded-full"
				onClick={onToggleShare}
			>
				{__('Share')}{' '}
				<span className="sr-only">{__('the current visible map')}</span>
				<Share2 />
			</Button>

			<Button
				variant="destructive"
				className="rounded-full"
				onClick={onToggleDownload}
			>
				{__('Download')}{' '}
				<span className="sr-only">
					{__('image from your viewport')}
				</span>
				<Download />
			</Button>
		</div>
	);
};
ModalToggleButtons.displayName = 'ModalToggleButtons';

export default MapHeader;
