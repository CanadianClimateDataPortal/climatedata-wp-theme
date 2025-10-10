import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

import {
	 type LocationModalContentParams as BaseLocationModalContentParams,
} from '@/types/climate-variable-interface';

import { __ } from '@/context/locale-provider';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';

import { useAppSelector } from '@/app/hooks';

import appConfig from '@/config/app.config';

import S2DClimateVariable from '@/lib/s2d-climate-variable';
import S2DVariableValues from '@/components/map-layers/s2d-variable-values';

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

	const [isS2D, setIsS2D] = useState<boolean>(false);

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

	useEffect(() => {
		if (climateVariable) {
			const testing = climateVariable instanceof S2DClimateVariable;
			if (testing !== isS2D) {
				setIsS2D(testing);
			}
		}
	}, [
		climateVariable,
		isS2D,
		setIsS2D,
	]);

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

			{isS2D && (
				<S2DVariableValues />
			)}

			{!isS2D &&
				climateVariable?.getLocationModalContent({
					latlng,
					featureId,
					scenario,
				})}
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
