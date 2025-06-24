/**
 * ThresholdDownloadFields component
 *
 * A dropdown component that allows the user to select a threshold value
 * associated with the currently selected climate variable.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';
import appConfig from "@/config/app.config.ts";

// UI components
import Dropdown from '@/components/ui/dropdown';
import {useClimateVariable} from "@/hooks/use-climate-variable";
import {VersionsTooltip} from "@/components/sidebar-menu-items/versions-dropdown.tsx";

/**
 * ThresholdDownloadFields
 *
 * Renders a dropdown menu populated with threshold options
 * retrieved from the selected climate variable.
 */
const VersionDownloadFields: React.FC = () => {
	// Hooks
	const { climateVariable, setVersion } = useClimateVariable();

	const versionOptions = appConfig.versions.filter((version) =>
		climateVariable?.getVersions()?.includes(version.value)
	);
	return (
		<Dropdown
			className="sm:w-64"
			placeholder={__('Select an option')}
			options={versionOptions}
			value={climateVariable?.getVersion() ?? undefined}
			label={__('Versions of the dataset')}
			tooltip={<VersionsTooltip />}
			onChange={setVersion}
		/>
	);
};

VersionDownloadFields.displayName = 'VersionDownloadFields';

export { VersionDownloadFields };
