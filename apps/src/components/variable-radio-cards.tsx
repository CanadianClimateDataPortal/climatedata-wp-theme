import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import { RadioCard, RadioCardFooter } from '@/components/ui/radio-card';
import Link from '@/components/ui/link';

import { useLocale } from '@/hooks/use-locale';
import { fetchPostsData } from '@/services/services';
import { normalizePostData } from '@/lib/format';
import { PostData, TaxonomyData } from '@/types/types';

const VariableRadioCards: React.FC<{
	filterValues: Record<string, string>;
	selected: PostData | null;
	onSelect: (variable: PostData) => void;
	dataset: TaxonomyData;
	section: string;
}> = ({ filterValues, selected, onSelect, dataset, section }) => {
	const [variables, setVariables] = useState<PostData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { __ } = useI18n();
	const { locale } = useLocale();
	const { selectClimateVariable } = useClimateVariable();

	// Fetch variables when dataset or filters change
	useEffect(() => {
		if (!dataset) return;

		setIsLoading(true);

		(async () => {
			const data = await fetchPostsData('variables', section, dataset, filterValues);
			const normalizedData = await normalizePostData(data, locale);
			setVariables(normalizedData);

			//  On first load, select the first one
			if (normalizedData.length > 0 && !selected) {
				onSelect(normalizedData[0]);
				selectClimateVariable(normalizedData[0]);
			}

			setIsLoading(false);
		})();
	}, [dataset, filterValues, locale, section, selected, onSelect, selectClimateVariable]);

	const handleVariableSelect = (variable: PostData) => {
		onSelect(variable);
		selectClimateVariable(variable);
	};

	if (isLoading) {
		return <div className="col-span-2 p-4 text-center">{__('Loading variables...')}</div>;
	}

	if (!variables || variables.length === 0) {
		return <div className="col-span-2 p-4 text-center">{__('No variables found for the selected filters.')}</div>;
	}

	return (
		<>
			{variables.map((item, index) => (
				<RadioCard
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
				</RadioCard>
			))}
		</>
	);
};
VariableRadioCards.displayName = 'VariableRadioCards';

export default VariableRadioCards;
