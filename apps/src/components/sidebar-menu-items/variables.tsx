/**
 * A menu item and panel component that displays a list of variables with some custom filters.
 * TODO: make this work with the new AnimatedPanel component
 */
import React, { useContext, useMemo, useState } from 'react';
import { Map, ChevronRight } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

// components
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarPanel,
} from '@/components/ui/sidebar';
import Grid from '@/components/ui/grid';
import { VariableSearchFilter } from '@/components/variable-search-filter';

// other
import { useSidebar } from '@/hooks/use-sidebar';
import { InteractivePanelProps, PostData } from '@/types/types';
import TaxonomyDropdownFilter from '@/components/taxonomy-dropdown-filter';
import VariableRadioCards from '@/components/variable-radio-cards';
import { useAppSelector } from "@/app/hooks";
import SectionContext from "@/context/section-provider";

// menu and panel slug
const slug = 'variable';

/**
 * A menu item link component that toggles the variables panel.
 */
const VariablesMenuItem: React.FC = () => {
	const { togglePanel, isPanelActive } = useSidebar();
	const { __ } = useI18n();

	const handleClick = () => {
		togglePanel(slug);
	};

	return (
		<SidebarMenuItem className="cursor-pointer">
			<SidebarMenuButton
				size="md"
				isActive={isPanelActive(slug)}
				onClick={handleClick}
			>
				<Map size={16} />
				<span className="grow">{__('Variables')}</span>
				<ChevronRight className="text-brand-blue" />
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
VariablesMenuItem.displayName = 'VariablesMenuItem';

/**
 * A panel component that displays a list of variables.
 */
const VariablesPanel: React.FC<InteractivePanelProps<PostData>> = ({
	selected,
	onSelect,
}) => {
	const [varType, setVarType] = useState<string>('');
	const [sector, setSector] = useState<string>('');
	const section = useContext(SectionContext);
	const { dataset } = useAppSelector((state) => state.map);

	const { __ } = useI18n();

	const { searchQuery } = useAppSelector((state) => state.climateVariable);

	const filterValues = useMemo(
		() => ({
			'var-type': varType,
			sector,
			search: searchQuery,
		}),
		[varType, sector, searchQuery]
	);

	return (
		<SidebarPanel id={slug} className="w-[36rem]">
			<Card className="border-0 shadow-none h-full flex flex-col">
				<CardHeader className="p-4 sticky top-0 bg-white z-10">
					<CardTitle className="text-lg">
						{__('Select a variable')}
					</CardTitle>
					<CardDescription>
						{__(
							'Here you can browse all the variables contained in the selected dataset.'
						)}
					</CardDescription>
					<Grid columns={2} className="gap-4 mt-4">
						<TaxonomyDropdownFilter
							className="sm:w-52"
							onFilterChange={(value) => setVarType(value)}
							slug="var-type"
							label={__('Variable Types')}
							tooltip={__('Select a variable type')}
							placeholder={__('All')}
							value={filterValues['var-type'] || ''}
						/>
						<TaxonomyDropdownFilter
							className="sm:w-52"
							onFilterChange={(value) => setSector(value)}
							slug="sector"
							label={__('Sectors')}
							tooltip={__('Select a sector')}
							placeholder={__('All')}
							value={filterValues.sector || ''}
						/>
					</Grid>
					<div className="mt-6">
						<VariableSearchFilter />
					</div>
				</CardHeader>
				<CardContent className="p-4 pt-0 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">
					<Grid columns={2} className="gap-4">
						{dataset && <VariableRadioCards
							dataset={dataset}
							section={section}
							filterValues={filterValues}
							selected={selected}
							onSelect={onSelect}
						/>}
					</Grid>
				</CardContent>
			</Card>
		</SidebarPanel>
	);
};
VariablesPanel.displayName = 'VariablesPanel';

export { VariablesMenuItem, VariablesPanel };
