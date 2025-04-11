import React, { useEffect, isValidElement, useMemo, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSearchQuery } from '@/store/climate-variable-slice';

import { RadioCardWithHighlight, RadioCardFooter } from '@/components/radio-card-with-highlight';
import Link from '@/components/ui/link';

import { useLocale } from '@/hooks/use-locale';
import { fetchPostsData } from '@/services/services';
import { normalizePostData } from '@/lib/format';
import { PostData, TaxonomyData } from '@/types/types';
import { setVariableList, setVariableListLoading } from '@/features/map/map-slice';
import { useAnimatedPanel } from '@/hooks/use-animated-panel';

const VariableRadioCards: React.FC<{
	filterValues: Record<string, string>;
	selected: PostData | null;
	onSelect: (variable: PostData) => void;
	dataset: TaxonomyData;
	section: string;
}> = ({ filterValues, selected, onSelect, dataset, section }) => {
	const { __ } = useI18n();
	const { locale } = useLocale();
	const dispatch = useAppDispatch();
	const { selectClimateVariable } = useClimateVariable();
	const { variableList, variableListLoading } = useAppSelector((state) => state.map);
	const { activePanel, closePanel } = useAnimatedPanel();
	const searchQuery = useAppSelector(selectSearchQuery);

	// Keep track of dataset changes and previous state
	const prevDatasetRef = useRef<number | null>(null);
	const fetchingRef = useRef<boolean>(false);
	const initialLoadRef = useRef<boolean>(true);

	const filteredVariableList = useMemo(() => {
		let filtered = [...variableList];

		// Apply search filter if exists
		if (searchQuery && searchQuery.trim() !== '') {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(item => {
				const title = (item.title || '').toLowerCase();
				const description = (item.description || '').toLowerCase();
				return title.includes(query) || description.includes(query);
			});
		}

		// Apply sector filter if selected
		if (filterValues.sector) {
			filtered = filtered.filter(item => {
				const sectors = item.taxonomies?.sector || [];
				return sectors.some(sector => sector.id.toString() === filterValues.sector);
			});
		}

		// Apply variable type filter if selected
		if (filterValues['var-type']) {
			filtered = filtered.filter(item => {
				const varTypes = item.taxonomies?.['var-type'] || [];
				return varTypes.some(varType => varType.id.toString() === filterValues['var-type']);
			});
		}

		return filtered;
	}, [variableList, searchQuery, filterValues]);

	// Fetch all variables when dataset changes (without filters)
	useEffect(() => {
		if (!dataset || !dataset.term_id) return;

		// Skip if we're already fetching
		if (fetchingRef.current) return;

		// Only fetch if dataset changed or this is initial load
		const didDatasetChange = prevDatasetRef.current !== dataset.term_id;
		if (!didDatasetChange && !initialLoadRef.current && variableList.length > 0) {
			return;
		}

		prevDatasetRef.current = dataset.term_id;
		fetchingRef.current = true;
		initialLoadRef.current = false;

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

					if (normalizedData.length > 0 && !selected) {
						// Use filtered list in case filters are already applied
						const firstItem = filteredVariableList.length > 0 ?
							filteredVariableList[0] : normalizedData[0];
						onSelect(firstItem);
						selectClimateVariable(firstItem);
					}
				}
			} catch (error) {
				console.error('Error fetching variables:', error);
				if (isMounted) {
					dispatch(setVariableList([]));
				}
			} finally {
				if (isMounted) {
					fetchingRef.current = false;
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [dataset, section, locale, dispatch, variableList.length]);

	// Handle auto-selection of the first variable when data is loaded but no variable is selected
	useEffect(() => {
		if (!variableListLoading && filteredVariableList.length > 0 && !selected && !fetchingRef.current) {
			onSelect(filteredVariableList[0]);
			selectClimateVariable(filteredVariableList[0]);
		}
	}, [filteredVariableList, variableListLoading, selected, onSelect, selectClimateVariable]);

	const handleVariableSelect = (variable: PostData) => {
		onSelect(variable);
		selectClimateVariable(variable);
		// Close the VariableDetailsPanel if open
		if (isValidElement(activePanel)) {
			closePanel();
		}
	};

	if (variableListLoading && !filteredVariableList.length) {
		return <div className="col-span-2 p-4 text-center">{__('Loading variables...')}</div>;
	}

	if (!filteredVariableList || filteredVariableList.length === 0) {
		if (filterValues.sector || filterValues['var-type'] || searchQuery) {
			return (
				<div className="col-span-2 p-4 text-center">
					{searchQuery
						? __('No variables found matching your search.')
						: __('No variables found for the selected filters.')
					}
				</div>
			);
		}

		return <div className="col-span-2 p-4 text-center">{__('No variables available for this dataset.')}</div>;
	}

	// Show filter results count when filtering
	const showFilterCount = (filterValues.sector || filterValues['var-type'] || searchQuery) &&
		filteredVariableList.length < variableList.length;

	return (
		<>
			{showFilterCount && (
				<div className="col-span-2 mb-2 text-sm text-neutral-grey-medium">
					{__('Showing')} {filteredVariableList.length} {__('of')} {variableList.length} {__('variables')}
				</div>
			)}
			{filteredVariableList.map((item, index) => (
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