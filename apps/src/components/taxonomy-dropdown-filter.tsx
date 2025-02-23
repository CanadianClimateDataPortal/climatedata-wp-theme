import React, { useEffect, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import Dropdown from '@/components/ui/dropdown';
import { fetchTaxonomyData } from '@/services/services';
import { useLocale } from '@/hooks/use-locale';
import { TaxonomyData } from '@/types/types';

const TaxonomyDropdownFilter: React.FC<{
	slug: string;
	value?: string;
	label: string;
	tooltip?: string;
	placeholder?: string;
	className?: string;
	onFilterChange: (value: string) => void;
}> = ({
	slug,
	value = '',
	label,
	tooltip,
	placeholder = 'All',
	className,
	onFilterChange,
}) => {
	const [options, setOptions] = useState<{ value: string; label: string }[]>(
		[]
	);

	const { locale } = useLocale();
	const { __ } = useI18n();

	useEffect(() => {
		(async () => {
			const data = await fetchTaxonomyData(slug);
			setOptions(
				data.map((option: TaxonomyData) => ({
					value: String(option.term_id),
					label: option.title?.[locale] as string,
				}))
			);
		})();
	}, [slug, locale]);

	return (
		<Dropdown
			className={className}
			searchable
			value={value}
			label={__(label)}
			tooltip={tooltip && __(tooltip)}
			placeholder={__(placeholder)}
			options={options}
			onChange={(selectedValue) => {
				const normalizedValue =
					typeof selectedValue === 'string' ? selectedValue : '';
				onFilterChange(
					normalizedValue === __(placeholder) ? '' : normalizedValue
				);
			}}
		/>
	);
};
TaxonomyDropdownFilter.displayName = 'TaxonomyDropdownFilter';

export default TaxonomyDropdownFilter;
