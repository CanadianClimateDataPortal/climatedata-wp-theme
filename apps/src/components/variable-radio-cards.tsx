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

const VariableRadioCards: React.FC<{
	filterValues: Record<string, string>;
	selected: PostData | null;
	onSelect: (variable: PostData) => void;
	dataset: TaxonomyData;
	section: string;
	showFilterCount?: boolean;
	useExternalFiltering?: boolean;
	renderFilterCount?: (filteredCount: number, totalCount: number) => React.ReactNode;
}> = ({
	filterValues,
	selected,
	onSelect,
	dataset,
	section,
	showFilterCount = true,
	renderFilterCount
}) => {
		const { __ } = useI18n();
		const { locale } = useLocale();
		const dispatch = useAppDispatch();
		const { selectClimateVariable } = useClimateVariable();
		const { variableList, variableListLoading } = useAppSelector((state) => state.map);
		const { activePanel, closePanel } = useAnimatedPanel();
		const searchQuery = useAppSelector(selectSearchQuery);
		const [dataLoaded, setDataLoaded] = useState(false);

		// Keep track of dataset changes and previous state
		const prevDatasetRef = useRef<number | null>(null);
		const fetchingRef = useRef<boolean>(false);
		const initialLoadRef = useRef<boolean>(true);

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

			// TODO: disabled because it was causing variables not loading bug... need to investigate and re enable
			// Only fetch if dataset changed or this is initial load
			// const didDatasetChange = prevDatasetRef.current !== dataset.term_id;
			// if (!didDatasetChange && !initialLoadRef.current && variableList.length > 0) {
			// 	return;
			// }

			prevDatasetRef.current = dataset.term_id;
			fetchingRef.current = true;
			initialLoadRef.current = false;
			setDataLoaded(false);

			dispatch(setVariableListLoading(true));

			// Tracking if component is still mounted
			let isMounted = true;

			(async () => {
				try {
					const data = await fetchPostsData('variables', section, dataset, {});
					const normalizedData = await normalizePostData(data, locale);

					if (isMounted) {
						// Store the variables in Redux
						dispatch(setVariableList(normalizedData));
						setDataLoaded(true);

						if (normalizedData.length > 0 && !selected) {
							// Use filtered list in case filters are already applied
							const firstItem = filteredList.length > 0 ?
								filteredList[0] : normalizedData[0];
							onSelect(firstItem);
							selectClimateVariable(firstItem, dataset);
						}
					}
				} catch (error) {
					console.error('Error fetching variables:', error);
					if (isMounted) {
						dispatch(setVariableList([]));
						setDataLoaded(true);
					}
				} finally {
					// Reset fetching state
					fetchingRef.current = false;

					if (isMounted) {
						dispatch(setVariableListLoading(false));
					}
				}
			})();

			return () => {
				isMounted = false;
				fetchingRef.current = false;
			};
		}, [dataset, section, locale, dispatch, variableList.length]);

		// Handle auto-selection of the first variable when data is loaded but no variable is selected
		useEffect(() => {
			if (!variableListLoading && filteredList.length > 0 && !selected && !fetchingRef.current) {
				onSelect(filteredList[0]);
				selectClimateVariable(filteredList[0], dataset);
			}
		}, [filteredList, variableListLoading, selected, onSelect, selectClimateVariable]);

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
