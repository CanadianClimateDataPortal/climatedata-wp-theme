import { EmissionScenariosControl } from '@/components/sidebar-menu-items/emission-scenarios-control';
import { FrequenciesDropdown } from '@/components/sidebar-menu-items/frequencies-dropdown';
import { InteractiveRegionsMenuItem } from '@/components/sidebar-menu-items/interactive-regions-menu-item';
import { ThresholdValuesDropdown } from '@/components/sidebar-menu-items/threshold-values-dropdown';
import { TimePeriodsControl } from '@/components/sidebar-menu-items/time-periods-control';
import { TimePeriodsControlForSeaLevel } from '@/components/sidebar-menu-items/time-periods-control-for-sea-level';
import { TimePeriodsControlSingle } from '@/components/sidebar-menu-items/time-periods-control-single';
import { VersionsDropdown } from '@/components/sidebar-menu-items/versions-dropdown';
import { SidebarSeparator } from '@/components/ui/sidebar';

import { useClimateVariable } from '@/hooks/use-climate-variable';

import {
	FrequencyDisplayModeOption,
	FrequencyType,
	type FrequencyConfig,
	type ScenariosConfig,
} from '@/types/climate-variable-interface';

export default function SidebarInnerProjection() {

	const { climateVariable } = useClimateVariable();

	// Show version dropdown if the climate variable has versions
	const showVersionDropdown = (climateVariable?.getVersions()?.length ?? 0) > 0;
	// We don't need to show if there's only 1 option.
	const showThreshold = climateVariable && climateVariable.getThresholds() && climateVariable.getThresholds().length > 1;

	// Show emission scenarios control if the climate variable has scenarios
	const scenariosConfig = climateVariable?.getScenariosConfig() ?? {} as ScenariosConfig;
	const showEmissionScenariosControl = Object.keys(scenariosConfig).length > 0;

	// Show interactive regions menu item if the climate variable is in region interactive mode
	const showInteractiveRegionsMenuItem = climateVariable?.getInteractiveMode() === 'region';
	// show the frequencies dropdown if the climate variable has frequency config
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;
	const showFrequenciesDropdown = Object.keys(frequencyConfig).length > 0
		&& (frequencyConfig[FrequencyType.ANNUAL] !== FrequencyDisplayModeOption.NONE
			|| frequencyConfig[FrequencyType.MONTHLY] !== FrequencyDisplayModeOption.NONE
			|| frequencyConfig[FrequencyType.SEASONAL] !== FrequencyDisplayModeOption.NONE
			|| frequencyConfig[FrequencyType.ALL_MONTHS] !== FrequencyDisplayModeOption.NONE);
	// Show the time periods control if the climate variable has date range config
	const showTimePeriodsControl = climateVariable?.getDateRangeConfig() !== null;
	const isTimePeriodsControlRanged = climateVariable?.isTimePeriodARange();


	return (
		<>
			{showVersionDropdown && <VersionsDropdown />}
			{showThreshold && <ThresholdValuesDropdown />}
			{(showVersionDropdown || showThreshold) && <SidebarSeparator />}

			{showEmissionScenariosControl && (
					<>
							<EmissionScenariosControl />
							<SidebarSeparator />
					</>
			)}

			{showInteractiveRegionsMenuItem && (
					<>
							<InteractiveRegionsMenuItem />
							<SidebarSeparator />
					</>
			)}

			{showFrequenciesDropdown && (
					<>
							<FrequenciesDropdown />
							<SidebarSeparator />
					</>
			)}

			{showTimePeriodsControl && (
					climateVariable?.getId() === 'sea_level' ? (
							<TimePeriodsControlForSeaLevel />
					) : (
							isTimePeriodsControlRanged ? (
									<TimePeriodsControl />
							) : (
									<TimePeriodsControlSingle />
							)
					)
			)}
		</>
	)
}
