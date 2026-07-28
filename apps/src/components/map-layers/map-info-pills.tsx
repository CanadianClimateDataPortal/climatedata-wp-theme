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
 * Export-only informational pills overlaid on the map (gated by the `data-raster`
 * flag — present in the DOM but shown only in raster/export mode, hidden in the
 * live app):
 *  - Title pill (top-centre): climate variable title joined with the dataset version.
 *  - Grid pill (bottom-left): grid resolution note.
 *
 * Mirrors the scenario ("SSP") pill chrome in map-container.tsx — same intent, same pattern.
 * The `group-data-[raster=true]/sidebar-wrapper:block` variant reveals each pill only when
 * an ancestor `SidebarProvider` carries `data-raster="true"` (set in App.tsx during export).
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

	console.log('MapInfoPills', { gridType: gridTypeOf,  gridResolutionLabel })

	return (
		<>
			{/* Title pill — top-centre (export-only) */}
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
				/* Grid resolution pill — bottom-left (export-only) */
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
