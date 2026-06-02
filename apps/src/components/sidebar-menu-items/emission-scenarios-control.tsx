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

const EmissionScenariosTooltip = () => (
	<div>
		{__('Climate projections are available for multiple emissions scenarios, ranging from lower to higher emissions. ' +
			  'Select from the options available in the dropdown menu to view the climate projection for that emissions scenario.')}
	</div>
);

const EmissionScenariosControl: React.FC = () => {
	const { climateVariable, setScenario, setScenarioCompare, setScenarioCompareTo } = useClimateVariable();
	const dispatch = useAppDispatch();

	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
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

	// These need better naming than this
	const scenarioOptionsValueCompareToPredicate /* and proper typing */ = (option) => {
		const outcome = option.value !== climateVariable?.getScenarioCompareTo();
		return outcome;
	};
	// Pretty much one of these 3
	let DEFAULT_CHOICE_WE_WANT = '';
	DEFAULT_CHOICE_WE_WANT = 'ssp245';     // <?dataset=216&var=wet_days&ver=cmip6&scen=ssp245>
	DEFAULT_CHOICE_WE_WANT = 'rcp45';      // <?dataset=216&var=wet_days&ver=cmip5&scen=rcp45>
	DEFAULT_CHOICE_WE_WANT = 'rcp45-p50';  // <?dataset=219&var=sea_level&ver=cmip5&scen=rcp85-p50&th=slr>
	const scenarioOptionsValueContainsWhatWeWantPredicate = (options: Record<'value' | 'label', string>): void | string => {
		if (
			// This will clearly need more than only this, or that exact pattern!
			options && options?.value == DEFAULT_CHOICE_WE_WANT
		) {
			return DEFAULT_CHOICE_WE_WANT;
		}
	};
	const dropdownThingOptions = scenarioOptions.filter(scenarioOptionsValueCompareToPredicate) ?? [];
	let dropdownThingValue = climateVariable?.getScenario() ?? undefined;
	const testing = dropdownThingOptions.find(scenarioOptionsValueContainsWhatWeWantPredicate);
	if (testing !== undefined && testing.value) {
		dropdownThingValue = testing.value;
	}
	console.log('RBx', { dropdownThingValue, scenarioOptions, scenarioOptions2: dropdownThingOptions, testing });

	return (
		<SidebarMenuItem>
			<div className="flex flex-col gap-4">
				<Dropdown
					key={climateVariable?.getId()}
					label={__('Emissions Scenarios') + ' TESTING FOR CLIM-1096: This is from map side'}
					tooltip={<EmissionScenariosTooltip />}
					placeholder={__('Select an option') + ' TESTING FOR CLIM-1096: This is from map side'}
					options={dropdownThingOptions}
					value={dropdownThingValue}
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

export { EmissionScenariosControl, EmissionScenariosTooltip };
