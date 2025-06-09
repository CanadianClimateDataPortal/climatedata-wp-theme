/**
 * MapHeader component
 *
 * A component serving as the header for the map. It displays the breadcrumbs
 * for the selected state of the map, a toggle for the variable details panel,
 * and buttons that toggle share and download map modals.
 *
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Info, Share2, Download } from 'lucide-react';
import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';

// components
import VariableDetailsPanel from '@/components/map-info/variable-details-panel';
import ShareMapModal from '@/components/map-info/share-map-modal';
import DownloadMapModal from '@/components/map-info/download-map-modal';
import { Button } from '@/components/ui/button';

// other
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import { MapInfoProps, ProviderPanelProps } from '@/types/types';
import { useLocale } from "@/hooks/use-locale";
import { useAppSelector } from "@/app/hooks";
import { useClimateVariable } from "@/hooks/use-climate-variable";

/**
 * MapHeader component, displays the header for the map with breadcrumbs and buttons for extra information.
 */
const MapHeader: React.FC<MapInfoProps> = ({ data = null }): React.ReactElement => {
	const [shareInfo, setShareInfo] = useState<boolean>(false);
	const [downloadInfo, setDownloadInfo] = useState<boolean>(false);
	const [panelProps, setPanelProps] = useState<
		ProviderPanelProps | undefined
	>(undefined);
	const { togglePanel } = useAnimatedPanel();

	const { locale } = useLocale();
	const dataset = useAppSelector((state) => state.map.dataset);

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
	if (!data) return;
	togglePanel(<VariableDetailsPanel mapInfo={data} />, panelProps);
};

	return (
		<>
			<aside id="header-map" className="map-header relative z-20">
				<div
					ref={ref}
					className="absolute top-0 left-0 overflow-y-auto w-full"
				>
					<div className="flex items-center gap-x-2 bg-white p-4">
						<Breadcrumbs
							onClick={toggleVariableDetailsPanel}
						/>
						<ModalToggleButtons
							onToggleShare={toggleShareInfo}
							onToggleDownload={toggleDownloadInfo}
						/>
					</div>
				</div>
			</aside>

			<ShareMapModal isOpen={shareInfo} onClose={toggleShareInfo} />
			<DownloadMapModal
				isOpen={downloadInfo}
				onClose={toggleDownloadInfo}
			/>
		</>
	);
};
MapHeader.displayName = 'MapHeader';

/**
 * Breadcrumbs component, displays the breadcrumbs for the selected state of the map.
 */
const Breadcrumbs: React.FC<{ onClick: () => void }> = ({
	onClick,
}) => {
	const { locale, getLocalized } = useLocale();
	const dataset = useAppSelector((state) => state.map.dataset);
	const variableList = useAppSelector((state) => state.map.variableList);
	const { climateVariable } = useClimateVariable();

	const datasetName = useMemo(() => {
		if (!dataset) return '';

		return getLocalized(dataset);
	}, [dataset, locale]);

	const variableTitle = useMemo(() => {
		if (climateVariable && climateVariable.toObject().postId) {
			return climateVariable.getTitle() || '';
		}

		// If no explicit climate variable selection, but we have variableList data,
		// show the first variable as a fallback
		if (variableList && variableList.length > 0) {
			return variableList[0].title || '';
		}

		// Don't show anything if we can't determine the variable
		return '';
	}, [climateVariable, variableList]);

	return (
		<div className="flex items-center gap-2 breadcrumb">
			{datasetName && <span className='hidden md:inline'>{datasetName}</span>}
			{datasetName && variableTitle && <span className='hidden md:inline'>/</span>}
			{variableTitle && (
				<Button
					variant="ghost"
					className="breadcrumb-button text-md text-cdc-black hover:text-dark-purple hover:bg-transparent p-0 h-auto"
					onClick={onClick}
					aria-label={__('View details')}
				>
					{variableTitle}
					<Info />
				</Button>
			)}
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
	const buttonClasses =
		'text-md font-normal leading-6 tracking-[0.8px] uppercase rounded-full h-7 sm:h-9 max-sm:py-1.5 max-sm:px-3';

	return (
		<div className="flex gap-3 sm:gap-5 ml-auto">
			<Button
				variant="outline"
				className={cn(buttonClasses, 'border border-cold-grey-4')}
				onClick={onToggleShare}
			>
				<div className="hidden sm:block text-dark-purple">
					{__('Share')}{' '}
					<span className="sr-only">
						{__('the current visible map')}
					</span>
				</div>
				<Share2 />
			</Button>

			<Button
				variant="destructive"
				className={buttonClasses}
				onClick={onToggleDownload}
			>
				<div className="hidden sm:block">
					{__('Download')}{' '}
					<span className="sr-only">
						{__('image from your viewport')}
					</span>
				</div>
				<Download />
			</Button>
		</div>
	);
};
ModalToggleButtons.displayName = 'ModalToggleButtons';

export default MapHeader;
