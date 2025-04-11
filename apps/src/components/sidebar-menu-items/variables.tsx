/**
 * A menu item and panel component that displays a list of variables with some custom filters.
 * TODO: make this work with the new AnimatedPanel component
 */
import { useI18n } from '@wordpress/react-i18n';
import { ChevronRight, Map } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

// components
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import Grid from '@/components/ui/grid';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarPanel,
} from '@/components/ui/sidebar';
import { VariableSearchFilter } from '@/components/variable-search-filter';

// other
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TaxonomyDropdownFilter from '@/components/taxonomy-dropdown-filter';
import VariableRadioCards from '@/components/variable-radio-cards';
import SectionContext from "@/context/section-provider";
import { setVariableList } from '@/features/map/map-slice';
import { useSidebar } from '@/hooks/use-sidebar';
import { clearSearchQuery } from '@/store/climate-variable-slice';
import { InteractivePanelProps, PostData } from '@/types/types';

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
	const dispatch = useAppDispatch();
	const { dataset } = useAppSelector((state) => state.map);
	const prevDatasetRef = useRef(dataset?.term_id);

	const { __ } = useI18n();

	// Clear filters and search when dataset changes
	useEffect(() => {
		// Skip if dataset is undefined (initial load) or if it's the same dataset
		if (!dataset || (prevDatasetRef.current === dataset.term_id)) {
			prevDatasetRef.current = dataset?.term_id;
			return;
		}

		prevDatasetRef.current = dataset.term_id;
		setVarType('');
		setSector('');
		dispatch(clearSearchQuery());
		dispatch(setVariableList([]));
	}, [dataset, dispatch]);

	const filterValues = useMemo(
		() => ({
			'var-type': varType,
			sector,
		}),
		[varType, sector]
	);

	const handleVarTypeChange = (value: string) => {
		setVarType(value);
	};

	const handleSectorChange = (value: string) => {
		setSector(value);
	};

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
							onFilterChange={handleVarTypeChange}
							slug="var-type"
							label={__('Variable Types')}
							tooltip={__('Select a variable type')}
							placeholder={__('All')}
							value={filterValues['var-type'] || ''}
						/>
						<TaxonomyDropdownFilter
							className="sm:w-52"
							onFilterChange={handleSectorChange}
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
						{dataset ? (
							<VariableRadioCards
								dataset={dataset}
								section={section}
								filterValues={filterValues}
								selected={selected}
								onSelect={onSelect}
							/>
						) : (
							<div className="col-span-2 p-4 text-center">
								{__('Please select a dataset first')}
							</div>
						)}
					</Grid>
				</CardContent>
			</Card>
		</SidebarPanel>
	);
};
VariablesPanel.displayName = 'VariablesPanel';

export { VariablesMenuItem, VariablesPanel };
