import React from 'react';
import { __ } from '@/context/locale-provider';
import WarningBanner from '@/components/ui/warning-banner';
import { useClimateVariable } from '@/hooks/use-climate-variable';

interface WarningRSLCCMIP6Props extends React.HTMLProps<HTMLDivElement> {
	displayed?: boolean;
	onHide?: () => void;
}

export default function WarningRSLCCMIP6({
	displayed,
	onHide = () => {},
	className,
}: WarningRSLCCMIP6Props) {
	const { climateVariable } = useClimateVariable();

	const displayWarningBanner =
		displayed &&
		climateVariable?.getId() === 'sea_level' &&
		climateVariable?.getVersion() === 'cmip6';

	if (!displayWarningBanner) {
		return null;
	}

	const warningModalContent = (
		<div>
			<p>
				{__(
					'The ClimateData.ca team has been made aware of an error in the CMIP6 Relative Sea Level change ' +
						'data. This error affects only those data in the St. Lawrence River south of Rimouski. ' +
						'During data processing, the contribution of ocean dynamics to sea level change was not ' +
						'applied in this area due to its proximity to land. We are working with the data owners to ' +
						'address this as soon as possible. In the meantime, the CMIP5 projections can be used in ' +
						'this area.'
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
		<WarningBanner
			className={className}
			display={displayWarningBanner}
			onHide={handleOnHide}
			bannerContent={__(
				'Note: Issue with St. Lawrence River CMIP6 Relative Sea Level Change'
			)}
			modalContent={warningModalContent}
			modalTitle={__(
				'Note: Issue with St. Lawrence River CMIP6 Relative Sea Level Change'
			)}
		/>
	);
}
