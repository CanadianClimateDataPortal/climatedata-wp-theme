import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import { SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar';

import {
	ForecastDisplayFieldDropdown,
	ForecastDisplaySkillFieldCheckbox,
	ForecastTypeFieldDropdown,
} from '@/components/fields/forecast';
import { FrequencyFieldDropdown } from '@/components/fields/frequency';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	FrequencyType,
} from '@/types/climate-variable-interface';
import { TimePeriodsControlS2D } from '@/components/sidebar-menu-items/time-periods-control-s2d';

import { getForecastTypeName } from '@/lib/s2d';

const tooltipForecastTypes = __(
	'S2D forecasts are shown as probabilities for how conditions will compare to historical climate conditions between 1991 and 2020. ' +
		'“Expected conditions” show whether conditions are expected to be above, near or below normal. ' +
		'“Unusual conditions” show whether conditions are expected to be unusually high or low. ' +
		'Select a forecast type from the options in the dropdown menu.'
);

const tooltipForecastDisplay = __(
	'S2D forecasts provide information on how future conditions may compare to historical conditions between 1991 and 2020. ' +
		'Use the dropdown menu to view the forecast or the historical climatology for 1991 to 2020.'
);

const tooltipForecastDisplayLowSkill = __(
	'Forecasts at locations with no or low skill should be used with caution, or the climatology should be consulted instead. ' +
		'Click the box to apply cross-hatching over locations with no skill or low skill.'
);

const tooltipFrequencies = __(
	'Forecasts are available for different frequencies, from a month to 5 years. ' +
		'The available time periods will change based on the frequency selected. ' +
		'Select a temporal frequency from the options in the dropdown menu. ' +
		'Note: Only the first three months are available individually, as skill tends to be low for later months.'
);

const tooltipTimePeriods = __(
	'The available time periods will change if a different frequency is selected. ' +
		'Move the slider to select the forecast for your time period of interest.'
);

const SidebarInnerS2D = () => {
	return (
		<>
			<SidebarMenuItem>
				<ForecastTypeFieldDropdown
					tooltip={tooltipForecastTypes}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem>
				<div className="flex flex-col gap-4">
					<ForecastDisplayFieldDropdown
						tooltip={tooltipForecastDisplay}
					/>
					<ForecastDisplaySkillFieldCheckbox
						tooltip={tooltipForecastDisplayLowSkill}
					/>
				</div>
			</SidebarMenuItem>

			<SidebarSeparator />

			<SidebarMenuItem>
				<FrequencyFieldDropdown
					tooltip={tooltipFrequencies}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlS2D
					tooltip={tooltipTimePeriods}
				/>
			</SidebarMenuItem>
		</>
	);
};

SidebarInnerS2D.displayName = 'SidebarInnerS2D';

export default SidebarInnerS2D;
