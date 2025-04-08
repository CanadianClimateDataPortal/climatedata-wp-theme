/**
 * Emission scenarios component.
 *
 * A dropdown component that allows the user to select an emission scenario and compare it
 * with another from a secondary dropdown.
 */
import React, { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { useClimateVariable } from "@/hooks/use-climate-variable";

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import Dropdown from '@/components/ui/dropdown';

// other
import appConfig from "@/config/app.config";

const EmissionScenariosControl: React.FC = () => {
	const [compareScenarios, setCompareScenarios] = useState<boolean>(false);
	const { __ } = useI18n();
	const { climateVariable, setScenario, setScenarioCompared } = useClimateVariable();

	const toggleCompareScenarios = () => {
		setCompareScenarios(prev => {
			const newCompare = !prev;
			if (!newCompare) {
				setScenarioCompared(null);
			}
			return newCompare;
		});
	};

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select an emission scenario.')}
		</div>
	);

	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
	);

	return (
		<SidebarMenuItem>
			<div className="flex flex-col gap-4">
				<Dropdown
					label={__('Emissions Scenarios')}
					tooltip={<Tooltip />}
					placeholder={__('Select an option')}
					options={scenarioOptions}
					value={climateVariable?.getScenario() ?? undefined}
					onChange={setScenario}
				/>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="compare-scenarios"
						className="text-brand-red"
						checked={compareScenarios}
						onCheckedChange={toggleCompareScenarios}
					/>
					<label
						htmlFor="compare-scenarios"
						className="text-sm font-medium leading-none cursor-pointer"
					>
						{__('Compare scenarios')}
					</label>
				</div>

				{compareScenarios && (
					<Dropdown
						options={scenarioOptions.filter(
							(option) => option.value !== climateVariable?.getScenario()
						) ?? []}
						value={climateVariable?.getScenarioCompared() ?? undefined}
						onChange={setScenarioCompared}
					/>
				)}
			</div>
		</SidebarMenuItem>
	);
};
EmissionScenariosControl.displayName = 'EmissionScenariosControl';

export { EmissionScenariosControl };
