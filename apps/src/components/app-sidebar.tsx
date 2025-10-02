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
import TooltipWidget from '@/components/ui/tooltip-widget';
import { DataValuesControl } from '@/components/sidebar-menu-items/data-values-control';
import { MapColorsDropdown } from '@/components/sidebar-menu-items/map-colors-dropdown';

import SidebarInnerProjection from '@/components/sidebar-inner-projection';
import SidebarInnerSeasonalDecadal from '@/components/sidebar-inner-seasonal-decadal';

import { RecentLocationsLink, RecentLocationsPanel } from '@/components/sidebar-footer-links/recent-locations';
import LinkWithIcon from '@/components/sidebar-footer-links/link-with-icon';
import LayerOpacities from '@/components/ui/layer-opacities';

import { PostData } from '@/types/types';
import { INTERNAL_URLS } from '@/lib/constants';
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

	// Show the data values control if the climate variable has delta
	const hasDelta = climateVariable && climateVariable.hasDelta();
	// Show the map colors dropdown if the climate variable has color options
	const hasColourOptions = climateVariable && climateVariable.getColourOptionsStatus();

	const about_url = INTERNAL_URLS[`about-data-${currentLocale}`] || '';
	const support_url = INTERNAL_URLS[`support-${currentLocale}`] || '';

	const currentVarId = climateVariable?.getId() || '';


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

									{currentVarId.startsWith('s2d_') ? (
										<SidebarInnerSeasonalDecadal />
									) : (
										<SidebarInnerProjection />
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
					{currentVarId.startsWith('s2d_') ? (
						<div className="flex flex-row justify-start gap-2 p-2 my-2 text-xs font-semibold tracking-wider uppercase text-dark-purple">
							<span>{__('Release date:')}&nbsp;</span>
							<time
								className="font-medium"
								dateTime={'2025-09-30'}
							>
								{'2025-09-30'}
							</time>
							<TooltipWidget tooltip={__('TODO')} />
						</div>
					) : null}
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
