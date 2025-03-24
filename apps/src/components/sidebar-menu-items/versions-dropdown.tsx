import React from "react";
import { useI18n } from "@wordpress/react-i18n";
import { useClimateVariable } from "@/hooks/use-climate-variable";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";

/**
 * Versions dropdown component.
 */
const VersionsDropdown: React.FC = () => {
	const { climateVariable, setVersion } = useClimateVariable();
	const { __ } = useI18n();

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a version.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<Dropdown
				label={__('Versions')}
				options={climateVariable?.getVersions() ?? []}
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
