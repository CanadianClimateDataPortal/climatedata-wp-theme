import React from 'react';
import { __ } from '@/context/locale-provider';
import { ArrowRight } from 'lucide-react';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useAppSelector } from '@/app/hooks';

import {
	 type LocationModalContentParams as BaseLocationModalContentParams,
} from '@/types/climate-variable-interface';

import { useLocale } from '@/hooks/use-locale';

import appConfig from '@/config/app.config';

import S2DClimateVariable from '@/lib/s2d-climate-variable';

interface LocationModalContentProps extends BaseLocationModalContentParams {
	title: string;
	scenario: string;
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

	const isS2D = climateVariable && climateVariable instanceof S2DClimateVariable;

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
			<h2 className="mb-1 text-2xl font-semibold leading-7 text-cdc-black">
				{title}
			</h2>
			<p className="m-0 text-sm leading-5 text-neutral-grey-medium">
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

			{!isS2D && (
				<p className="text-right">
					<a
						href="#"
						aria-label={__('Go to details section')}
						className="text-sm font-normal leading-6"
						onClick={onDetailsClick}
					>
						<span className="inline-flex items-center gap-2 text-brand-blue">
							{__('See details')}
							<ArrowRight size={16} />
						</span>
					</a>
				</p>
			)}
		</div>
	);
};
