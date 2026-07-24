import React from 'react';
import appConfig from '@/config/app.config';
import { __ } from '@/context/locale-provider';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { cn } from '@/lib/utils';

/**
 * MapInfoPills
 * ------------
 * Always-on informational pills overlaid on the map:
 *  - Title pill (top-centre): climate variable title joined with the dataset version.
 *  - Grid pill (bottom-left): grid resolution note.
 *
 * Mirrors the scenario ("SSP") pill chrome in map-container.tsx — same intent, same pattern.
 */
const MapInfoPills = (): React.ReactElement => {
	const { climateVariable } = useClimateVariable();

	const title = climateVariable?.getTitle() || '';
	const versionLabel = appConfig.versions.find(
		(version) => version.value === climateVariable?.getVersion(),
	)?.label;

	// e.g. title 'Hottest Day' + version 'CMIP6' → "Hottest Day-CMIP6"
	const titleContent = [title, versionLabel].filter(Boolean).join('-');

	// Grid resolution value kept out of the i18n msgid — only 'Grid=' is translatable.
	const hardcodedString = '~10x6km';

	return (
		<>
			{/* Title pill — top-centre */}
			<div className={cn(
				'absolute top-6 left-1/2 transform -translate-x-1/2 z-20',
				'text-sm text-zinc-900 font-normal leading-5',
				'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
			)}>
				{titleContent}
			</div>

			{/* Grid resolution pill — bottom-left */}
			<div className={cn(
				'absolute bottom-6 left-6 z-20',
				'text-sm text-zinc-900 font-normal leading-5',
				'bg-neutral-grey-light border border-cold-grey-4 shadow-md rounded-xl px-3.5 py-1.5',
			)}>
				{__('Grid=') + ' ' + hardcodedString}
			</div>
		</>
	);
};

export default MapInfoPills;
