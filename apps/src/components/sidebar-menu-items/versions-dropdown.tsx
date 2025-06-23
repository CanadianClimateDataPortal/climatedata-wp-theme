import React from "react";
import { __ } from '@/context/locale-provider';
import { useClimateVariable } from "@/hooks/use-climate-variable";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";
import appConfig from "@/config/app.config"

const VersionsTooltip = () => (
	<div>
		{__('Climate datasets are updated regularly meaning that more than one version may be available. ' +
				'The most recent version is selected by default, but you can switch between versions by clicking on the options in the dropdown menu.')}
	</div>
);

/**
 * Versions dropdown component.
 */
const VersionsDropdown: React.FC = () => {
	const { climateVariable, setVersion, setScenarioCompare, setScenarioCompareTo } = useClimateVariable();

	const options = appConfig.versions.filter((version) =>
		climateVariable?.getVersions()?.includes(version.value)
	);

	const handleChange = (value: string) => {
		setVersion(value);

		// Also reset compare scenarios checkbox
		setScenarioCompare(false);
		setScenarioCompareTo(null);
	};

	return (
		<SidebarMenuItem>
			<Dropdown
				key={climateVariable?.getId()}
				label={__('Versions')}
				options={options}
				value={climateVariable?.getVersion() ?? undefined}
				onChange={handleChange}
				tooltip={<VersionsTooltip />}
			/>
		</SidebarMenuItem>
	);
}

export {
	VersionsDropdown, VersionsTooltip
};
