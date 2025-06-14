import { useContext, useEffect, useState } from 'react';
import { __, LocaleContext } from '@/context/locale-provider';
import { BadgeInfo, MessageCircleQuestion } from 'lucide-react';
import { useClimateVariable } from "@/hooks/use-climate-variable";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatasetsMenuItem, DatasetsPanel } from '@/components/sidebar-menu-items/datasets';
import { VariablesMenuItem, VariablesPanel } from '@/components/sidebar-menu-items/variables';
import { EmissionScenariosControl } from '@/components/sidebar-menu-items/emission-scenarios-control';
import { ThresholdValuesDropdown } from '@/components/sidebar-menu-items/threshold-values-dropdown';
import { InteractiveRegionsMenuItem } from '@/components/sidebar-menu-items/interactive-regions-menu-item';
import { FrequenciesDropdown } from '@/components/sidebar-menu-items/frequencies-dropdown';
import { TimePeriodsControl } from '@/components/sidebar-menu-items/time-periods-control';
import { TimePeriodsControlSingle } from "@/components/sidebar-menu-items/time-periods-control-single";
import { TimePeriodsControlForSeaLevel } from '@/components/sidebar-menu-items/time-periods-control-for-sea-level';
import { DataValuesControl } from '@/components/sidebar-menu-items/data-values-control';
import { MapColorsDropdown } from '@/components/sidebar-menu-items/map-colors-dropdown';
import { VersionsDropdown } from "@/components/sidebar-menu-items/versions-dropdown";

import { RecentLocationsLink, RecentLocationsPanel } from '@/components/sidebar-footer-links/recent-locations';
import LinkWithIcon from '@/components/sidebar-footer-links/link-with-icon';
import LayerOpacities from '@/components/ui/layer-opacities';

import { PostData } from '@/types/types';
import { INTERNAL_URLS } from '@/lib/constants';
import { setDataset } from '@/features/map/map-slice';
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	ScenariosConfig,
} from "@/types/climate-variable-interface";

/**
 * A `Sidebar` component that provides a tabbed interface for exploring data or adjusting map settings.
 */
export function AppSidebar() {
	const { climateVariable, selectClimateVariable } = useClimateVariable();
	const {
		dataset,
	} = useAppSelector((state) => state.map);
	const [selectedVariable, setSelectedVariable] = useState<PostData | null>(
		null
	);
	const dispatch = useAppDispatch();
	const localeContext = useContext(LocaleContext);
	const currentLocale = localeContext?.locale || 'en';

	// Update the selected variable when the climate variable changes
	useEffect(() => {
		if (climateVariable) {
			const currentVarId = climateVariable.getId();

			if (!selectedVariable || selectedVariable.id !== currentVarId) {
				// Create a basic PostData object from the climate variable
				const varData: PostData = {
					id: currentVarId,
					postId: climateVariable.toObject().postId || 0,
					title: currentVarId, // @TODO: Update this after merging the breadcrumsb PR, as there we have the title in the map state
				};
				setSelectedVariable(varData);
			}
		}
	}, [climateVariable, selectedVariable]);

	const handleSelectVariable = (variable: PostData) => {
		setSelectedVariable(variable);
		selectClimateVariable(variable, dataset);
	}

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
	// Show the data values control if the climate variable has delta
	const hasDelta = climateVariable && climateVariable.hasDelta();
	// Show the map colors dropdown if the climate variable has color options
	const hasColourOptions = climateVariable && climateVariable.getColourOptionsStatus();

	const about_url = INTERNAL_URLS[`about-data-${currentLocale}`] || '';
	const support_url = INTERNAL_URLS[`support-${currentLocale}`] || '';

	return (
		<Sidebar>
			<SidebarContent className={'overflow-x-hidden'}>
				<SidebarGroup>
					<Tabs defaultValue="explore" className="mb-6">
						<TabsList>
							<TabsTrigger value="explore">
								{__('Explore Data')}
							</TabsTrigger>
							<TabsTrigger value="settings">
								{__('Map Settings')}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="explore">
							<SidebarGroupContent>
								<SidebarMenu>
									<DatasetsMenuItem />
									<VariablesMenuItem />
									<SidebarSeparator />

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
								</SidebarMenu>
							</SidebarGroupContent>
						</TabsContent>
						<TabsContent value="settings">
							<SidebarGroupContent>
								<SidebarMenu>
									{hasDelta && (
										<>
											<DataValuesControl />
											<SidebarSeparator />
										</>
									)}

									{hasColourOptions && (
										<>
											<MapColorsDropdown/>
											<SidebarSeparator />
										</>
									)}

									<LayerOpacities />
								</SidebarMenu>
							</SidebarGroupContent>
						</TabsContent>
					</Tabs>
				</SidebarGroup>

				<SidebarGroup className="mt-auto gap-0">
					<RecentLocationsLink />
					<LinkWithIcon
						icon={BadgeInfo}
						href={about_url}
						className="font-normal text-brand-blue hover:text-soft-purple"
					>
						{__('About our data')}
					</LinkWithIcon>
					<LinkWithIcon
						icon={MessageCircleQuestion}
						href={support_url}
						className="font-normal text-brand-blue hover:text-soft-purple"
					>
						{__('Support')}
					</LinkWithIcon>
				</SidebarGroup>
			</SidebarContent>

			<DatasetsPanel
				selected={dataset ?? null}
				onSelect={(selectedDataset) => {
					if (selectedDataset) {
						dispatch(setDataset(selectedDataset));
					}
				}}
			/>
			<VariablesPanel
				selected={selectedVariable}
				onSelect={handleSelectVariable}
			/>
			<RecentLocationsPanel />
		</Sidebar>
	);
}
