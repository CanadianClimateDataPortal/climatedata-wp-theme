import { __ } from '@/context/locale-provider';
import NoticeBanner from '@/components/ui/notice-banner';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { MapBannerProps } from '@/types/types';

/**
 * Notice banner saying there is an issue with the "Red Deer A" station for the
 * daily AHCCD data.
 *
 * Only displayed if the selected variable is "Daily AHCCD" and the "Red Deer A"
 * station is selected.
 */
export default function NoticeAHCCDRedDeerA({
	displayed,
	onHide = () => {},
	className,
}: MapBannerProps) {
	const { climateVariable } = useClimateVariable();
	const selectedStations = climateVariable?.getSelectedPoints() || {};
	const displayBanner =
		displayed === true &&
		climateVariable?.getId() === 'daily_ahccd_temperature_and_precipitation' &&
		'3025484' in selectedStations; // ID of the Red Deer A station

	return (
		<NoticeBanner
			type="warning"
			display={displayBanner}
			onHide={onHide}
			bannerContent={__(
				'NOTE: The data owner has informed us that there are errors in the daily AHCCD ' +
				'data for Red Deer A (station number 3025484). These will be corrected as soon ' +
				'as possible.'
			)}
			className={className}
		/>
	);
}
