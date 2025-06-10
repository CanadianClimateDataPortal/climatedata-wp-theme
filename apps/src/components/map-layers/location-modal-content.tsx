import React from 'react';
import { __ } from '@/context/locale-provider';
import { ArrowRight } from 'lucide-react';
import L from 'leaflet';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useAppSelector } from '@/app/hooks';
import { useLocale } from '@/hooks/use-locale';
import appConfig from '@/config/app.config';

interface LocationModalContentProps {
	title: string;
	latlng: L.LatLng;
	scenario: string;
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
	scenario,
	featureId,
	onDetailsClick,
}) => {
	const { climateVariable } = useClimateVariable();
	const { getLocalized } = useLocale();
	const { dataset } = useAppSelector((state) => state.map);
	const variableList = useAppSelector((state) => state.map.variableList);

	// Displayed info
	const datasetLabel = getLocalized(dataset);
	const climateVariableTitle = climateVariable?.getTitle() || variableList?.[0]?.title || '';
	const thresholds = climateVariable?.getThresholds() ?? [];
	const threshold: string = climateVariable?.getThreshold() ?? '';

	// Get the label associated with a given value.
	const getLabelByValue = (value: string): string =>
		(thresholds.length > 0 && value)
			? thresholds.find(t => t.value === value)?.label || ''
			: '';
	// Get the label for the current threshold, or null if not found.
	const thresholdLabel = getLabelByValue(threshold);
	const versionLabel = appConfig.versions.filter((version) => version.value === climateVariable?.getVersion())[0]?.label;
	const scenarioLabel = appConfig.scenarios.filter((item) => item.value === scenario)[0]?.label;

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
						__(thresholdLabel),
						__(versionLabel),
						__(scenarioLabel)
					].filter(Boolean).join(' - ')
				}
			</p>

			{ climateVariable?.getLocationModalContent({
				latlng,
				featureId,
				scenario,
			}) }

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
