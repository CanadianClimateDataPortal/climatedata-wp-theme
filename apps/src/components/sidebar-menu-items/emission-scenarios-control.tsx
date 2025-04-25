/**
 * Emission scenarios component.
 *
 * A dropdown component that allows the user to select an emission scenario and compare it
 * with another from a secondary dropdown.
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { useClimateVariable } from "@/hooks/use-climate-variable";

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import Dropdown from '@/components/ui/dropdown';

// other
import appConfig from "@/config/app.config";

const EmissionScenariosControl: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setScenario, setScenarioCompare, setScenarioCompareTo } = useClimateVariable();

	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
	);

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select an emission scenario.')}
		</div>
	);

	return (
		<SidebarMenuItem>
			<div className="flex flex-col gap-4">
				<Dropdown
					key={climateVariable?.getId()}
					label={__('Emissions Scenarios')}
					tooltip={<Tooltip />}
					placeholder={__('Select an option')}
					options={scenarioOptions.filter(
						(option) => option.value !== climateVariable?.getScenarioCompareTo()
					) ?? []}
					value={climateVariable?.getScenario() ?? undefined}
					onChange={setScenario}
				/>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="compare-scenarios"
						className="text-brand-red"
						checked={climateVariable?.getScenarioCompare() ?? false}
						onCheckedChange={setScenarioCompare}
					/>
					<label
						htmlFor="compare-scenarios"
						className="text-sm font-medium leading-none cursor-pointer"
					>
						{__('Compare scenarios')}
					</label>
				</div>

				{climateVariable?.getScenarioCompare() && (
					<Dropdown
						key={climateVariable?.getId() + '_compare'}
						options={scenarioOptions.filter(
							(option) => option.value !== climateVariable?.getScenario()
						) ?? []}
						value={climateVariable?.getScenarioCompareTo() ?? undefined}
						onChange={setScenarioCompareTo}
					/>
				)}
			</div>
		</SidebarMenuItem>
	);
};
EmissionScenariosControl.displayName = 'EmissionScenariosControl';

export { EmissionScenariosControl };
