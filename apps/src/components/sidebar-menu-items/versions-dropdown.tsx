import React from "react";
import { __ } from '@/context/locale-provider';
import { useClimateVariable } from "@/hooks/use-climate-variable";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";
import appConfig from "@/config/app.config"

/**
 * Versions dropdown component.
 */
const VersionsDropdown: React.FC = () => {
	const { climateVariable, setVersion, setScenarioCompare, setScenarioCompareTo } = useClimateVariable();

	const options = appConfig.versions.filter((version) =>
		climateVariable?.getVersions()?.includes(version.value)
	);

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a version.')}
		</div>
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
				tooltip={<Tooltip />}
			/>
		</SidebarMenuItem>
	);
}

export {
	VersionsDropdown,
};
