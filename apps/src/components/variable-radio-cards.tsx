import React, { useEffect, isValidElement, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSearchQuery } from '@/store/climate-variable-slice';

import { RadioCardWithHighlight, RadioCardFooter } from '@/components/radio-card-with-highlight';
import Link from '@/components/ui/link';
import VariableFilterCount from '@/components/sidebar-menu-items/variables';

import { useLocale } from '@/hooks/use-locale';
import { fetchPostsData } from '@/services/services';
import { normalizePostData } from '@/lib/format';
import { PostData, TaxonomyData } from '@/types/types';
import { setVariableList, setVariableListLoading } from '@/features/map/map-slice';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';
import useFilteredVariables from '@/hooks/use-filtered-variables';

// Message component for no results scenarios
const ResultsMessage: React.FC<{ message: string }> = ({ message }) => (
	<div className="col-span-2 p-4 text-center">{message}</div>
);

interface VariableRadioCardsProps {
	filterValues: Record<string, string>;
	selected: PostData | null;
	onSelect: (variable: PostData) => void;
	dataset: TaxonomyData;
	section: string;
	showFilterCount?: boolean;
	useExternalFiltering?: boolean;
	renderFilterCount?: (filteredCount: number, totalCount: number) => React.ReactNode;
}

const VariableRadioCards: React.FC<VariableRadioCardsProps> = ({
	filterValues,
	selected,
	onSelect,
	dataset,
	section,
	showFilterCount = true,
	renderFilterCount,
}) => {
		const { __ } = useI18n();
		const { locale } = useLocale();
		const dispatch = useAppDispatch();
		const { selectClimateVariable } = useClimateVariable();
		const { variableList, variableListLoading } = useAppSelector((state) => state.map);
		const { activePanel, closePanel } = useAnimatedPanel();
		const searchQuery = useAppSelector(selectSearchQuery);
		const [dataLoaded, setDataLoaded] = useState(false);
		const urlParamsLoaded = useAppSelector((state) => state.urlSync.isLoaded);
		const hasAutoSelectedRef = useRef<boolean>(false);

		// Keep track of dataset changes and previous state
		const prevDatasetRef = useRef<number | null>(null);
		const fetchingRef = useRef<boolean>(false);

		// Use the shared filter hook
		const { filteredList, isFiltering, filteredCount, totalCount } = useFilteredVariables(
			variableList,
			filterValues,
			searchQuery
		);

		// Fetch all variables when dataset changes (without filters)
		useEffect(() => {
			if (!dataset || !dataset.term_id) return;
			// Skip if we're already fetching
			if (fetchingRef.current) return;
			if (prevDatasetRef.current === dataset.term_id && variableList.length > 0) {
				// If we already have variables for this dataset but never selected one,
				// make sure to select the first variable
				if (!hasAutoSelectedRef.current && !urlParamsLoaded && variableList.length > 0) {
					hasAutoSelectedRef.current = true;
					onSelect(variableList[0]);
					selectClimateVariable(variableList[0], dataset);
				}
				return;
			}

			// Set refs
			fetchingRef.current = true;
			prevDatasetRef.current = dataset.term_id;
			setDataLoaded(false);
			dispatch(setVariableListLoading(true));
	
			fetchPostsData('variables', section, dataset, {})
				.then(data => normalizePostData(data, locale))
				.then(normalizedData => {
					// Save data
					dispatch(setVariableList(normalizedData));
					setDataLoaded(true);
					
					// Always select the first variable when dataset changes
					if (normalizedData.length > 0) {
						hasAutoSelectedRef.current = true;
						onSelect(normalizedData[0]);
						selectClimateVariable(normalizedData[0], dataset);
					}
				})
				.catch(error => {
					console.error('Error fetching variables:', error);
					dispatch(setVariableList([]));
					setDataLoaded(true);
				})
				.finally(() => {
					fetchingRef.current = false;
					dispatch(setVariableListLoading(false));
				});
		}, [dataset, dispatch, section, variableList, urlParamsLoaded, onSelect, selectClimateVariable, locale]);

		const handleVariableSelect = (variable: PostData) => {
			onSelect(variable);
			selectClimateVariable(variable, dataset);
			// Close the VariableDetailsPanel if open
			if (isValidElement(activePanel)) {
				closePanel();
			}
		};

		// Only show loading message on initial data fetch, not during filtering
		if (variableListLoading && !dataLoaded) {
			return <ResultsMessage message={__('Loading variables...')} />;
		}

		if (dataLoaded && (!filteredList || filteredList.length === 0)) {
			// Handle the different no results scenarios with separate conditions
			const hasSearch = Boolean(searchQuery);
			const hasFilters = Boolean(filterValues.sector || filterValues['var-type']);
			switch (true) {
				case (hasSearch && hasFilters):
					return <ResultsMessage message={__('No variables found matching your search and filters.')} />;
				case hasSearch:
					return <ResultsMessage message={__('No variables found matching your search.')} />;
				case hasFilters:
					return <ResultsMessage message={__('No variables found for the selected filters.')} />;
				default:
					return <ResultsMessage message={__('No variables available for this dataset.')} />;
			}
		}

		return (
			<>
				{/* Render custom filter count if provided */}
				{renderFilterCount && isFiltering && renderFilterCount(filteredCount, totalCount)}

				{/* Default internal filter count */}
				{showFilterCount && isFiltering && !renderFilterCount && (
					<VariableFilterCount
						filteredCount={filteredCount}
						totalCount={totalCount}
					/>
				)}

				{filteredList.map((item, index) => (
					<RadioCardWithHighlight
						key={item.id || index}
						value={item}
						radioGroup="variable"
						title={item.title}
						description={item?.description}
						thumbnail={item?.thumbnail}
						selected={Boolean(selected && selected.id === item.id)}
						onSelect={() => handleVariableSelect(item)}
					>
						{item?.link?.url && (
							<RadioCardFooter>
								<Link
									icon={<ExternalLink size={16} />}
									href={item.link.url}
									className="text-base text-brand-blue leading-6"
								>
									{__('Learn more')}
								</Link>
							</RadioCardFooter>
						)}
					</RadioCardWithHighlight>
				))}
			</>
		);
	};
VariableRadioCards.displayName = 'VariableRadioCards';

export default VariableRadioCards;
