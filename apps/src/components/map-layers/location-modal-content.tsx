import React from 'react';
import { __ } from '@/context/locale-provider';
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
	const { climateVariable } = useClimateVariable();
	const { dataset } = useAppSelector((state) => state.map);
	const variableList = useAppSelector((state) => state.map.variableList);

	// Displayed info
	const datasetLabel = dataset?.title.en ?? '';
	const climateVariableTitle = climateVariable?.getTitle() || variableList?.[0]?.title || '';
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
						__(climateVariableTitle),
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
