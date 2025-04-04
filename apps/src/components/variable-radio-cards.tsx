import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

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
	const { __ } = useI18n();
	const { locale } = useLocale();

	useEffect(() => {
		(async () => {
			if (!filterValues || !dataset) {
				return;
			}

			const data = await fetchPostsData('variables', section, dataset, filterValues);

			// data from API has some complex structure, so we need to normalize it which will make it easier to work with
			const normalizedData = await normalizePostData(data, locale);

			setVariables(normalizedData);
		})();
	}, [dataset, filterValues, locale, section]);

	if (!variables) {
		return null;
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
					selected={selected?.id === item.id}
					onSelect={() => onSelect(item)}
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
