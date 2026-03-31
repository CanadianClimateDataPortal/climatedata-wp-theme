import { __ } from '@/context/locale-provider';
import NoticeBanner from '@/components/ui/notice-banner';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { MapBannerProps } from '@/types/types';

/**
 * Notice banner saying that the RSLC CMIP6 issue is now fixed.
 *
 * Only displayed if the selected variable is RSLC and the version is CMIP6.
 */
export default function NoticeRSLCCMIP6({
	displayed,
	onHide = () => {},
	className,
}: MapBannerProps) {
	const { climateVariable } = useClimateVariable();

	const displayBanner =
		displayed === true &&
		climateVariable?.getId() === 'sea_level' &&
		climateVariable?.getVersion() === 'cmip6';

	const modalContent = (
		<div>
			<p>
				{__(
					'The ClimateData.ca team has addressed the error in the St. Lawrence River in the CMIP6 Relative ' +
					'Sea Level change data. Users should note that re-running the data resulted in changes on the ' +
					'order of millimeters in other parts of the dataset.'
				)}
			</p>
			<p
				dangerouslySetInnerHTML={{
					__html: __(
						'We’re here to help. For further details, please contact <a href="/feedback/">the Climate ' +
							'Services Support Desk</a>.'
					),
				}}
			/>
		</div>
	);

	return (
		<NoticeBanner
			type="success"
			display={displayBanner}
			onHide={onHide}
			bannerContent={__(
				'Issue addressed: St. Lawrence River in CMIP6 Relative Sea Level Change'
			)}
			modalContent={modalContent}
			modalTitle={__(
				'Issue addressed: St. Lawrence River in CMIP6 Relative Sea Level Change'
			)}
			className={className}
		/>
	);
}
