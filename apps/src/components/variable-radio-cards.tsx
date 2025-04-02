import React, { useState, useEffect, useContext } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

import { RadioCard, RadioCardFooter } from '@/components/ui/radio-card';
import Link from '@/components/ui/link';

import { useLocale } from '@/hooks/use-locale';
import { fetchPostsData } from '@/services/services';
import { normalizePostData } from '@/lib/format';
import { PostData } from '@/types/types';
import SectionContext from "@/context/section-provider";
import { useClimateVariable } from '@/hooks/use-climate-variable';

const VariableRadioCards: React.FC<{
	filterValues: Record<string, string>;
	selected: PostData | null;
	onSelect: (variable: PostData) => void;
}> = ({ filterValues, selected, onSelect }) => {
	const [variables, setVariables] = useState<PostData[]>([]);
	const { __ } = useI18n();
	const { locale } = useLocale();
	const section = useContext(SectionContext);
	const { variableCanBeDisplayed } = useClimateVariable();

	useEffect(() => {
		(async () => {
			if (!filterValues) {
				return;
			}

			const data = await fetchPostsData('variables', filterValues);

			// data from API has some complex structure, so we need to normalize it which will make it easier to work with
			const normalizedData = await normalizePostData(data, locale);

			setVariables(normalizedData);
		})();
	}, [filterValues, locale]);

	if (!variables) {
		return null;
	}

	return (
		<>
			{variables
				.filter(item => variableCanBeDisplayed(item, section))
				.map((item, index) => (
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
