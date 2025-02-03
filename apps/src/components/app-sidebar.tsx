import { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { BadgeInfo, MessageCircleQuestion } from 'lucide-react';
import { useMap } from '@/hooks/use-map';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorSelect } from '@/components/ui/color-select';
import { RadioGroupFactory } from '@/components/ui/radio-group';
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
import {
	RecentLocationsLink,
	RecentLocationsPanel,
} from '@/components/sidebar-footer-links/recent-locations';
import LinkWithIcon from '@/components/sidebar-footer-links/link-with-icon';
import LayerOpacities from '@/components/ui/layer-opacities';

import { TaxonomyData, PostData } from '@/types/types';

/**
 * A `Sidebar` component that provides a tabbed interface for exploring data or adjusting map settings.
 */
export function AppSidebar() {
	const [selectedDataset, setSelectedDataset] = useState<TaxonomyData | null>(
		null
	);
	const [selectedVariable, setSelectedVariable] = useState<PostData | null>(
		null
	);

	const { setExtendInfo } = useMap();

	const { __ } = useI18n();

	// TODO: This will be fetched from API or maybe a store
	//  also, refactor this to the sidebar-menu-items folder
	//colorPalettes for testing
	const colorPalettes = [
		{
			name: 'Warm Palette',
			colors: ['#FF5733', '#FF8D1A', '#FFC300', '#FFDA6C', '#FFD1A3'],
		},
		{
			name: 'Cool Palette',
			colors: ['#4DA8DA', '#34A7C1', '#378AD5', '#2167A9', '#174A7B'],
		},
		{
			name: 'Neutral Palette',
			colors: ['#D9D9D9', '#BFBFBF', '#A6A6A6', '#8C8C8C', '#737373'],
		},
	];

	const handlePaletteChange = (palette: {
		name: string;
		colors: string[];
	}) => {
		console.log('Selected palette:', palette);
	};

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

									<ThresholdValuesDropdown />
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
									{/* TODO: refactor to the sidebar-menu-items folder once their store is setup */}
									<RadioGroupFactory
										title={__('Values')}
										name="values"
										options={[__('Absolute'), __('Delta')]}
									/>
									<RadioGroupFactory
										title={__('Units')}
										name="units"
										options={[
											{
												value: 'metric',
												label: __('Metric'),
											},
											{
												value: 'imperial',
												label: __('Imperial'),
											},
										]}
									/>
									<SidebarSeparator />

									<SidebarMenuItem>
										<ColorSelect
											options={colorPalettes}
											onChange={handlePaletteChange}
										/>
									</SidebarMenuItem>

									<SidebarMenu>
										<LayerOpacities />
									</SidebarMenu>
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
				selected={selectedDataset}
				onSelect={setSelectedDataset}
			/>
			<VariablesPanel
				selected={selectedVariable}
				onSelect={setSelectedVariable}
			/>
			<RecentLocationsPanel />
		</Sidebar>
	);
}
