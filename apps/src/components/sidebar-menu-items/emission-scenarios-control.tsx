/**
 * Emission scenarios component.
 *
 * A dropdown component that allows the user to select an emission scenario and compare it
 * with another from a secondary dropdown.
 */
import React from 'react';
import { __ } from '@/context/locale-provider';

import { useClimateVariable } from "@/hooks/use-climate-variable";

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import Dropdown from '@/components/ui/dropdown';
import { useAppDispatch } from '@/app/hooks';
import { clearTransformedLegendEntry } from '@/features/map/map-slice';

// other
import appConfig from "@/config/app.config";

const EmissionScenariosControl: React.FC = () => {
	const { climateVariable, setScenario, setScenarioCompare, setScenarioCompareTo } = useClimateVariable();
	const dispatch = useAppDispatch();

	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
	);

	const Tooltip = () => (
		<div>
			{__('Climate projections are available for multiple emissions scenarios, ranging from lower to higher emissions. ' +
				  'Select from the options available in the dropdown menu to view the climate projection for that emissions scenario.')}
		</div>
	);

	const handleCompareChange = (value: boolean) => {
		setScenarioCompare(value);

		// Also reset the compareTo scenario if the user unchecks the compare checkbox
		if (!value) {
			setScenarioCompareTo(null);
		}

		// Clear the transformed legend entry
		dispatch(clearTransformedLegendEntry());
	}

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
						onCheckedChange={handleCompareChange}
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
