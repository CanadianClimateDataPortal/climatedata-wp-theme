/**
 * A menu item and panel component that displays a list of datasets.
 * TODO: make this work with the new AnimatedPanel component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Database, ChevronRight, ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useAppDispatch } from '@/app/hooks';

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

	const handleDatasetSelect = useCallback(async (dataset: TaxonomyData) => {
		onSelect(dataset);
		dispatch(setVariableListLoading(true));
		dispatch(setVariableList([]));

		// Load the first variable for this dataset immediately
		const data = await fetchPostsData('variables', 'map', dataset, {});
		const variables = await normalizePostData(data, locale);

		// Store the variables in Redux
		dispatch(setVariableList(variables));

		// Select the first variable if available
		if (variables.length > 0) {
			selectClimateVariable(variables[0], dataset);
		}
	}, [dispatch, onSelect, selectClimateVariable, locale]);

	// Fetch datasets on component mount instead of panel activation
	useEffect(() => {
		// Fetch datasets only once when component mounts
		(async () => {
			const fetchedDatasets = await fetchTaxonomyData(slug, 'map');
			setDatasets(fetchedDatasets);

			if (fetchedDatasets.length > 0 && !selected) {
				await handleDatasetSelect(fetchedDatasets[0]);
			}
		})();
	}, [handleDatasetSelect, selected]);

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
								onSelect={() => handleDatasetSelect(item)}
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
