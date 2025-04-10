import React, { useEffect, isValidElement } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

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

	// Fetch variables when dataset or filters change
	useEffect(() => {
		if (!dataset) return;

		if (variableList.length === 0) {
			dispatch(setVariableListLoading(true));

			// Tracking if component is still mounted in this
			let isMounted = true;

			(async () => {
				const data = await fetchPostsData('variables', section, dataset, filterValues);
				const normalizedData = await normalizePostData(data, locale);

				if (isMounted) {
					// Storing the variables in Redux
					dispatch(setVariableList(normalizedData));

					if (normalizedData.length > 0 && !selected) {
						onSelect(normalizedData[0]);
						selectClimateVariable(normalizedData[0]);
					}
				}
			})();

			return () => {
				isMounted = false;
			};
		} else if (variableList.length > 0 && !selected) {
			onSelect(variableList[0]);
			selectClimateVariable(variableList[0]);
		}
	}, [dataset, filterValues, locale, section, variableList, dispatch, onSelect, selectClimateVariable, selected]);

	const handleVariableSelect = (variable: PostData) => {
		onSelect(variable);
		selectClimateVariable(variable);
		// Close the VariableDetailsPanel if open.
		if (isValidElement(activePanel)) {
			closePanel();
		}
	};

	if (variableListLoading) {
		return <div className="col-span-2 p-4 text-center">{__('Loading variables...')}</div>;
	}

	if (!variableList || variableList.length === 0) {
		return <div className="col-span-2 p-4 text-center">{__('No variables found for the selected filters.')}</div>;
	}

	return (
		<>
			{variableList.map((item, index) => (
				<RadioCardWithHighlight
					key={index}
					value={item}
					radioGroup="variable"
					title={item.title}
					description={item?.description}
					thumbnail={item?.thumbnail}
					selected={Boolean(selected && selected.id === item.id)}
					onSelect={() => handleVariableSelect(item)}
				>
					{/* TODO: will need to correctly use the link value depending on the data structure when coming from the API */}
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
