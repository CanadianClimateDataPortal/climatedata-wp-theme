import { __ } from '@/context/locale-provider';
import NoticeBanner from '@/components/ui/notice-banner';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { MapBannerProps } from '@/types/types';

/**
 * Notice banner saying there is an issue with the "Red Deer A" station for the
 * daily AHCCD data.
 *
 * Only displayed when the selected dataset is "AHCCD".
 */
export default function NoticeAHCCDRedDeerA({
	displayed,
	onHide = () => {},
	className,
}: MapBannerProps) {
	const { climateVariable } = useClimateVariable();
	const displayBanner =
		displayed === true &&
		climateVariable?.getDatasetType() === 'ahccd'

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
