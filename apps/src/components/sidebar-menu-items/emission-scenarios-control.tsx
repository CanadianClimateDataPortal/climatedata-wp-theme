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
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setEmissionScenarioCompare,
	setEmissionScenarioCompareTo,
} from '@/features/map/map-slice';
import appConfig from "@/config/app.config";

const EmissionScenariosControl: React.FC = () => {
	const { __ } = useI18n();
	const dispatch = useAppDispatch();
	const { climateVariable, setScenario } = useClimateVariable();

	const {
		emissionScenarioCompare,
		emissionScenarioCompareTo,
	} = useAppSelector((state) => state.map);

	const handleEmissionScenarioCompareChange = (checked: boolean) => {
		dispatch(setEmissionScenarioCompare(checked));
	};

	const handleEmissionScenarioCompareToChange = (value: string) => {
		dispatch(setEmissionScenarioCompareTo(value));
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
						checked={emissionScenarioCompare}
						onCheckedChange={handleEmissionScenarioCompareChange}
					/>
					<label
						htmlFor="compare-scenarios"
						className="text-sm font-medium leading-none cursor-pointer"
					>
						{__('Compare scenarios')}
					</label>
				</div>

				{emissionScenarioCompare && (
					<Dropdown
						options={scenarioOptions.filter(
							(option) => option.value !== climateVariable?.getScenario()
						) ?? []}
						value={emissionScenarioCompareTo}
						onChange={handleEmissionScenarioCompareToChange}
					/>
				)}
			</div>
		</SidebarMenuItem>
	);
};
EmissionScenariosControl.displayName = 'EmissionScenariosControl';

export { EmissionScenariosControl };
