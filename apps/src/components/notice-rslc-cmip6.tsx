import React from 'react';
import { __ } from '@/context/locale-provider';
import NoticeBanner from '@/components/ui/notice-banner';
import { useClimateVariable } from '@/hooks/use-climate-variable';

interface NoticeRSLCCMIP6Props extends React.HTMLProps<HTMLDivElement> {
	displayed?: boolean;
	onHide?: () => void;
}

/**
 * Notice banner specific to the RSLC CMIP6 issue.
 *
 * Renders a "notice banner" with a message and modal content specific to the
 * RSLC CMIP6 fix. Can be used in both "Maps" and "Download" apps.
 *
 * @param displayed Display the banner if true. But the banner will display only
 *                  if the selected variable is RSLC and the version is CMIP6.
 * @param onHide Callback called when the user clicks the banner's close button.
 * @param className Classes for the banner container (passed to <WarningBanner>)
 */
export default function NoticeRSLCCMIP6({
	displayed,
	onHide = () => {},
	className,
}: NoticeRSLCCMIP6Props) {
	const { climateVariable } = useClimateVariable();

	const displayBanner =
		displayed &&
		climateVariable?.getId() === 'sea_level' &&
		climateVariable?.getVersion() === 'cmip6';

	if (!displayBanner) {
		return null;
	}

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

	const handleOnHide = () => {
		if (onHide) {
			onHide();
		}
	};

	return (
		<NoticeBanner
			type="success"
			display={displayBanner}
			onHide={handleOnHide}
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
