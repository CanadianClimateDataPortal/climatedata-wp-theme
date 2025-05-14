/**
 * A menu item and panel component that displays a list of datasets.
 * TODO: make this work with the new AnimatedPanel component
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Database, ChevronRight, ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// components
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarPanel,
} from '@/components/ui/sidebar';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { RadioCard, RadioCardFooter } from '@/components/ui/radio-card';
import Grid from '@/components/ui/grid';
import Link from '@/components/ui/link';

// other
import { useSidebar } from '@/hooks/use-sidebar';
import { useLocale } from '@/hooks/use-locale';
import { fetchTaxonomyData } from '@/services/services';
import { InteractivePanelProps, TaxonomyData } from '@/types/types';
import { setVariableList, setVariableListLoading } from '@/features/map/map-slice';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { fetchPostsData } from '@/services/services';
import { normalizePostData } from '@/lib/format';

// menu and panel slug
const slug = 'datasets';

/**
 * A menu item link component that toggles the datasets panel.
 */
const DatasetsMenuItem: React.FC = () => {
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
				tooltip={{ panelId: slug }}
				data-panel-id={slug}
			>
				<Database size={16} />
				<span className="grow">{__('Datasets')}</span>
				<ChevronRight className="text-brand-blue" />
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
DatasetsMenuItem.displayName = 'DatasetsMenuItem';

/**
 * A panel component that displays a list of datasets.
 */
const DatasetsPanel: React.FC<InteractivePanelProps<TaxonomyData | null>> = ({
	selected,
	onSelect,
}) => {
	const [datasets, setDatasets] = useState<TaxonomyData[]>([]);
	const { __ } = useI18n();
	const { locale } = useLocale();
	const dispatch = useAppDispatch();
	const { selectClimateVariable } = useClimateVariable();
	const hasSelectedVariable = useAppSelector((state) => !!state.climateVariable.data?.id);
	const urlParamsLoaded = useAppSelector((state) => state.urlSync.isLoaded);
	
	// Tracking refs
	const initialLoadCompletedRef = useRef<boolean>(false);
	const isUserSelectedDatasetRef = useRef<boolean>(false);

	const handleDatasetSelect = useCallback(async (dataset: TaxonomyData, isUserSelection = true) => {
		// Mark this as a user selection (not from URL)
		isUserSelectedDatasetRef.current = isUserSelection;
		
		onSelect(dataset);
		dispatch(setVariableListLoading(true));
		dispatch(setVariableList([]));

		try {
			// Load variables for this dataset
			const data = await fetchPostsData('variables', 'map', dataset, {});
			const variables = await normalizePostData(data, locale);

			// Store the variables in Redux
			dispatch(setVariableList(variables));
			
			// Always select first variable for user selections regardless of URL params
			// For URL-driven selections, only select if no variable is specified
			if (variables.length > 0) {
				if (isUserSelection || (!hasSelectedVariable && urlParamsLoaded)) {
					selectClimateVariable(variables[0], dataset);
				}
			}
		} catch (error) {
			console.error('Error fetching variables for dataset:', error);
		} finally {
			dispatch(setVariableListLoading(false));
		}
	}, [dispatch, onSelect, selectClimateVariable, locale, urlParamsLoaded, hasSelectedVariable]);

	// Fetch datasets on component mount
	useEffect(() => {
		const fetchDatasets = async () => {
			try {
				const fetchedDatasets = await fetchTaxonomyData(slug, 'map');
				setDatasets(fetchedDatasets);
				
				// Auto-select first dataset only if:
				// 1. We have datasets available
				// 2. No dataset is already selected 
				// 3. URL params are loaded
				// 4. Initial load hasn't been completed yet
				if (
					fetchedDatasets.length > 0 && 
					!selected && 
					urlParamsLoaded && 
					!initialLoadCompletedRef.current
				) {
					initialLoadCompletedRef.current = true;
					// This is not a user selection - it's automatic
					await handleDatasetSelect(fetchedDatasets[0], false);
				}
			} catch (error) {
				console.error('Error fetching datasets:', error);
				setDatasets([]);
			}
		};
		
		fetchDatasets();
	}, [handleDatasetSelect, selected, urlParamsLoaded]);

	// When URL params finish loading, handle any delayed auto-selection
	useEffect(() => {
		if (
			urlParamsLoaded && 
			selected && 
			!hasSelectedVariable && 
			!isUserSelectedDatasetRef.current &&
			!initialLoadCompletedRef.current
		) {
			initialLoadCompletedRef.current = true;
			// Re-select the dataset to trigger first variable selection (not a user selection)
			handleDatasetSelect(selected, false);
		}
	}, [urlParamsLoaded, selected, hasSelectedVariable, handleDatasetSelect]);

	if (!datasets) {
		return null;
	}

	return (
		<SidebarPanel id={slug} className="w-96">
			<Card className="h-full flex flex-col">
				<CardHeader className="p-4 sticky top-0 bg-white z-10">
					<CardTitle className="text-lg">
						{__('Select a dataset')}
					</CardTitle>
					<CardDescription>
						{__(
							'Climate Data provides a selection of historical and future climate datasets.'
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-4 pt-0 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">
					<Grid columns={1} className="gap-4">
						{datasets.map((item) => (
							<RadioCard
								key={item.term_id}
								value={item}
								radioGroup={slug}
								title={item.title?.[locale] ?? ''}
								description={
									item?.card?.description?.[locale] ?? ''
								}
								selected={Boolean(selected && item.term_id === selected.term_id)}
								onSelect={() => handleDatasetSelect(item, true)}
							>
								{item?.card?.link && (
									<RadioCardFooter>
										<Link
											icon={<ExternalLink size={16} />}
											href={
												item.card.link?.[locale]?.url ??
												'#'
											}
											className="text-sm text-brand-blue"
										>
											{__('Learn more')}
										</Link>
									</RadioCardFooter>
								)}
							</RadioCard>
						))}
					</Grid>
				</CardContent>
			</Card>
		</SidebarPanel>
	);
};
DatasetsPanel.displayName = 'DatasetsPanel';

export { DatasetsMenuItem, DatasetsPanel };