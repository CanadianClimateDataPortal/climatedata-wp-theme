import React from 'react';
import appConfig from '@/config/app.config';
import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';
import {
	getGridTypeFor,
	getGridTypeLabel,
} from '@/lib/grid-resolution';

/**
 * MapInfoPills
 * ------------
 * Export-only (i.e. what we see when clicking "Download" map image)
 * informational pills overlaid on the map: present in the DOM at all times,
 * but shown only when an ancestor `SidebarProvider` carries `data-raster="true"`
 * via the `group-data-[raster=true]/sidebar-wrapper:block` variant
 * (see the `data-raster` comment in `App.tsx`).
 *  - Title pill (top-centre): climate variable title joined with the dataset version.
 *  - Grid pill (bottom-left): grid resolution note.
 *
 * Mirrors the scenario ("SSP") pill chrome in `map-container.tsx`.
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

	const gridResolutionLabel = getGridTypeLabel(gridTypeOf);

	return (
		<>
			{/* Title pill — top-centre */}
			<div
				className={cn(
					'absolute top-6 left-1/2 transform -translate-x-1/2 z-20',
					'hidden group-data-[raster=true]/sidebar-wrapper:block',
					'text-sm text-zinc-900 font-normal leading-5',
					'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
					'raster-addition-pill-title'
				)}
			>
				{titleContent}
			</div>

			{
				/* Grid resolution pill — bottom-left */
				gridResolutionLabel !== '' &&  (
					<div
						className={cn(
							'absolute bottom-6 left-6 z-20',
							'hidden group-data-[raster=true]/sidebar-wrapper:block',
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

export default MapInfoPills;
