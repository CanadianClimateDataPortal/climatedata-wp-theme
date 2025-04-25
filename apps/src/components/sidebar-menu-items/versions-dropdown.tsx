import React from "react";
import { useI18n } from "@wordpress/react-i18n";
import { useClimateVariable } from "@/hooks/use-climate-variable";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";
import appConfig from "@/config/app.config"

/**
 * Versions dropdown component.
 */
const VersionsDropdown: React.FC = () => {
	const { climateVariable, setVersion } = useClimateVariable();
	const { __ } = useI18n();

	const options = appConfig.versions.filter((version) =>
		climateVariable?.getVersions()?.includes(version.value)
	);

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a version.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				key={climateVariable?.getId()}
				label={__('Versions')}
				options={options}
				value={climateVariable?.getVersion() ?? undefined}
				onChange={setVersion}
				tooltip={<Tooltip />}
			/>
		</SidebarMenuItem>
	);
}

export {
	VersionsDropdown,
};
