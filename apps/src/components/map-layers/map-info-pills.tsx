import React from 'react';
import appConfig from '@/config/app.config';
import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';
import {
	getGridTypeFor,
	getGridTypeLabel,
} from '@/lib/vocabulary';

/**
 * Pills carrying the variable title and grid resolution into the exported map image.
 *
 * They sit in the DOM at all times and stay hidden until the
 * `html[data-raster="true"]` rules in `Global.css` reveal them, which happens
 * only while a capture is being prepared.
 * Vocabulary: `apps/src/lib/map/image-rastering/README.md`.
 */
const MapInfoPills = (
): React.ReactElement => {

	const { climateVariable } = useClimateVariable();

	const title = climateVariable?.getTitle() || '';
	const versionLabel = appConfig.versions.find(
		(version) => version.value === climateVariable?.getVersion(),
	)?.label;

	// e.g. title 'Hottest Day' + version 'CMIP6' → "Hottest Day - CMIP6"
	const titleContent = [title, versionLabel].filter(Boolean).join(' - ');

	const gridTypeOf = getGridTypeFor(climateVariable);

	// e.g. '~10×6km', rendered further down as "Grid= ~10×6km".
	const gridResolutionLabel = getGridTypeLabel(gridTypeOf);

	return (
		<>
			<div
				className={cn(
					'absolute top-6 left-1/2' /* top-centre */,
					'transform -translate-x-1/2 z-20',
					'hidden',
					'text-sm text-zinc-900 font-normal leading-5',
					'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
					'raster-addition-pill-title'
				)}
			>
				{titleContent}
			</div>

			{
				gridResolutionLabel !== '' &&  (
					<div
						className={cn(
							'absolute bottom-6 left-6' /* bottom-left */,
							'hidden z-20',
							'text-sm text-zinc-900 font-normal leading-5',
							'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
							'raster-addition-pill-resolution'
						)}
					>
						{__('Grid=') + ' ' + gridResolutionLabel}
					</div>
				)
			}
		</>
	);
};

MapInfoPills.displayName = 'MapInfoPills'; // Explicit string literal, or this name would be lost in production.

export default MapInfoPills;
