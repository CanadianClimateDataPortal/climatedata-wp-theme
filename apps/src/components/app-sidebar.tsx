import { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { BadgeInfo, MessageCircleQuestion } from 'lucide-react';
import { useMap } from '@/hooks/use-map';
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
import {
	DatasetsMenuItem,
	DatasetsPanel,
} from '@/components/sidebar-menu-items/datasets';
import {
	VariablesMenuItem,
	VariablesPanel,
} from '@/components/sidebar-menu-items/variables';
import { EmissionScenariosControl } from '@/components/sidebar-menu-items/emission-scenarios-control';
import { ThresholdValuesDropdown } from '@/components/sidebar-menu-items/threshold-values-dropdown';
import { InteractiveRegionsDropdown } from '@/components/sidebar-menu-items/interactive-regions-dropdown';
import { FrequenciesDropdown } from '@/components/sidebar-menu-items/frequencies-dropdown';
import { TimePeriodsControl } from '@/components/sidebar-menu-items/time-periods-control';
import { DataValuesControl } from '@/components/sidebar-menu-items/data-values-control';
import { MapColorsDropdown } from '@/components/sidebar-menu-items/map-colors-dropdown';
import { VersionsDropdown } from "@/components/sidebar-menu-items/versions-dropdown";

import {
	RecentLocationsLink,
	RecentLocationsPanel,
} from '@/components/sidebar-footer-links/recent-locations';
import LinkWithIcon from '@/components/sidebar-footer-links/link-with-icon';
import LayerOpacities from '@/components/ui/layer-opacities';

import { PostData } from '@/types/types';
import { setDataset } from '@/features/map/map-slice';
import { useAppDispatch, useAppSelector } from "@/app/hooks";

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
	const { setExtendInfo } = useMap();
	const dispatch = useAppDispatch();

	const { __ } = useI18n();

	const handleSelectVariable = (variable: PostData) => {
		setSelectedVariable(variable);
		selectClimateVariable(variable);
	}

	// We don't need to show if there's only 1 option.
	const showThreshold = climateVariable && climateVariable.getThresholds() && climateVariable.getThresholds().length > 1;

	return (
		<Sidebar>
			<SidebarContent>
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

									<VersionsDropdown />
									{showThreshold && <ThresholdValuesDropdown/>}
									<SidebarSeparator />

									<EmissionScenariosControl />
									<SidebarSeparator />

									<InteractiveRegionsDropdown />
									<SidebarSeparator />

									<FrequenciesDropdown />
									<SidebarSeparator />

									<TimePeriodsControl />
								</SidebarMenu>
							</SidebarGroupContent>
						</TabsContent>
						<TabsContent value="settings">
							<SidebarGroupContent>
								<SidebarMenu>
									<DataValuesControl />
									<SidebarSeparator />

									<MapColorsDropdown />
									<SidebarSeparator />

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
						target="_blank"
						href="/about"
						className="font-normal text-brand-blue hover:text-soft-purple"
					>
						{__('About our data')}
					</LinkWithIcon>
					<LinkWithIcon
						icon={MessageCircleQuestion}
						onClick={() => setExtendInfo(true)}
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
