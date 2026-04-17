import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMessageDisplay } from '@/features/map/map-slice';
import NoticeRSLCCMIP6 from '@/components/map-banners/notice-rslc-cmip6';
import { MapBannerProps } from '@/types/types';
import NoticeAHCCDRedDeerA from '@/components/map-banners/notice-ahccd-red-dear';
import { cn } from '@/lib/utils';

interface MapBannersProps {
	className?: string;
}

/**
 * Container of all the map banners. Can be used in Maps and Download pages.
 *
 * The container contains and displays all the map banners.
 *
 * While the container handles the user's choice when hiding a banner (i.e. when
 * the user clicks the "X" button), it's each banner's responsibility to decide
 * if it should render anything based on the context. For example, a banner
 * about a CMIP6 issue could decide to not render anything unless the selected
 * version is CMIP6.
 */
export default function MapBanners({
	className,
}: MapBannersProps): React.ReactNode {
	const dispatch = useAppDispatch();
	const messageDisplayStates = useAppSelector(
		(state) => state.map.messageDisplayStates
	);

	// List of banners to render. Key is the banner ID, value is the banner
	// component to render. Note that the banner component may decide to render
	// nothing.
	const banners: Record<string, React.ComponentType<MapBannerProps>> = {
		// RLSC CMIP6 issue fixed
		RSLCCMIP6: NoticeRSLCCMIP6,
		// AHCCD issue for "Red Deer A" station
		AHCCDRedDeerA: NoticeAHCCDRedDeerA,
	};

	// While this check seems superfluous, it's there to allow rendering
	// nothing by simply commenting or removing all entries in `banners` above.
	if (!banners) {
		return null;
	}

	const handleHideBanner = (bannerId: string) => {
		dispatch(setMessageDisplay({ message: bannerId, displayed: false }));
	};

	const bannerComponents = Object.entries(banners).map(
		([bannerId, MapBanner]) => {
			const displayed = messageDisplayStates[bannerId] ?? true; // Displayed by default
			return (
				<MapBanner
					key={bannerId}
					displayed={displayed}
					onHide={() => handleHideBanner(bannerId)}
				/>
			);
		}
	);

	return (
		<div className={cn(className, 'flex flex-col gap-2')}>
			{bannerComponents}
		</div>
	);
}
