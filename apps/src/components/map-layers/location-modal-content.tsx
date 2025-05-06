import React from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { ArrowRight } from 'lucide-react';
import L from 'leaflet';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useAppSelector } from '@/app/hooks';
import appConfig from '@/config/app.config';

interface LocationModalContentProps {
	title: string;
	latlng: L.LatLng;
	featureId: number,
	onDetailsClick: () => void;
}

/**
 * LocationModalContent
 * --------------------
 * Contains the general content of the location modal
 *  - title
 *  - subtitle (current dataset, current climate variable, current version, current scenario)
 *  - button to open charts panel
 */
export const LocationModalContent: React.FC<LocationModalContentProps> = ({
	title,
	latlng,
	featureId,
	onDetailsClick,
}) => {
	const { __ } = useI18n();
	const { climateVariable } = useClimateVariable();
	const { dataset } = useAppSelector((state) => state.map);

	// Displayed info
	const datasetLabel = dataset?.title.en ?? '';
	const versionLabel = appConfig.versions.filter((version) => version.value === climateVariable?.getVersion())[0]?.label;
	const scenarioLabel = appConfig.scenarios.filter((scenario) => scenario.value === climateVariable?.getScenario())[0]?.label;

	return (
		<div>
			<h2 className="text-2xl text-cdc-black font-semibold leading-7 mb-1">
				{title}
			</h2>
			<p className="text-sm text-neutral-grey-medium leading-5 m-0">
				{
					[
						__(datasetLabel),
						__(climateVariable?.getTitle() ?? ''),
						__(versionLabel),
						__(scenarioLabel)
					].filter(Boolean).join(' - ')
				}
			</p>

			{ climateVariable?.getLocationModalContent(latlng, featureId) }

			<p className="text-right">
				<a
					href="#"
					aria-label={__('Go to details section')}
					className="font-normal text-sm leading-6"
					onClick={onDetailsClick}
				>
					<span className="text-brand-blue inline-flex items-center gap-2">
						{__('See details')}
						<ArrowRight size={16}/>
					</span>
				</a>
			</p>
		</div>
	);
};
