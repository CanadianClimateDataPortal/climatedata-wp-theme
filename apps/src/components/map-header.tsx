/**
 * MapHeader component
 *
 * A component serving as the header for the map. It displays the breadcrumbs
 * for the selected state of the map, a toggle for the variable details panel,
 * a button that opens the share map modal, and the Map and Data download
 * buttons.
 *
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Info, Share2 } from 'lucide-react';
import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';

// components
import VariableDetailsPanel from '@/components/map-info/variable-details-panel';
import ShareMapModal from '@/components/map-info/share-map-modal';
import DownloadButtonGroup, {
	MAP_HEADER_BUTTON_CLASS_NAME,
} from '@/components/map-header/download-button-group';
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

			<ShareMapModal isOpen={shareModalOpen} onClose={toggleShareModal} />
		</>
	);
};
MapHeader.displayName = 'MapHeader';

/**
 * Breadcrumb component, displays the breadcrumbs for the selected state of the map.
 */
const Breadcrumb: React.FC<{ onClick: () => void }> = ({
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
					className="breadcrumb-button text-md text-cdc-black hover:text-dark-purple hover:bg-transparent p-0 h-auto whitespace-normal"
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
Breadcrumb.displayName = 'Breadcrumb';

interface ActionButtonsProps {
	onToggleShare: () => void;
	className: string[];
}

/**
 * ActionButtons, the buttons on the right of the breadcrumb to do actions about the map.
 * Share button (instead of copying the map link) and Download buttons
 */

const ActionButtons = (
	props: ActionButtonsProps,
): React.ReactElement => {
	const{
		onToggleShare,
		className,
	} = props;

	return (
		<div className={cn('flex gap-3', className)}>

			<Button
				variant="outline"
				className={cn(MAP_HEADER_BUTTON_CLASS_NAME, 'border border-cold-grey-4')}
				onClick={onToggleShare}
			>
				<div className="sr-only sm:not-sr-only text-dark-purple">
					{__('Share')}{' '}
					<span className="sr-only">
						{__('the current visible map')}
					</span>
				</div>
				<Share2 aria-hidden="true" />
			</Button>

			<DownloadButtonGroup />

		</div>
	);
};
ActionButtons.displayName = 'ActionButtons';

export default MapHeader;
