import React, { useEffect, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import Dropdown from '@/components/ui/dropdown';
import { fetchTaxonomyData } from '@/services/services';
import { useLocale } from '@/hooks/use-locale';
import { TaxonomyData, DropdownOption } from '@/types/types';

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
		const [options, setOptions] = useState<DropdownOption[]>([]);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);

		const { locale } = useLocale();
		const { __ } = useI18n();

		useEffect(() => {
			const loadTaxonomyData = async () => {
				setLoading(true);
				setError(null);

				try {
					const data = await fetchTaxonomyData(slug);

					const mappedOptions: DropdownOption[] = data.map((option: TaxonomyData) => ({
						value: String(option.term_id),
						label: option.title?.[locale] || '',
					}));

					// Sort options alphabetically by label
					mappedOptions.sort((a: DropdownOption, b: DropdownOption) => a.label.localeCompare(b.label));

					setOptions(mappedOptions);
				} catch (err) {
					console.error(`Error fetching ${slug} taxonomy data:`, err);
					setError(`Failed to load ${slug} options`);
				} finally {
					setLoading(false);
				}
			};

			loadTaxonomyData();
		}, [slug, locale]);

		return (
			<Dropdown
				className={className}
				searchable
				value={value}
				label={label}
				tooltip={tooltip && __(tooltip)}
				placeholder={loading ? __('Loading...') : __(placeholder)}
				options={options}
				onChange={(selectedValue) => {
					const normalizedValue =
						typeof selectedValue === 'string' ? selectedValue : '';
					onFilterChange(
						normalizedValue === __(placeholder) ? '' : normalizedValue
					);
				}}
				disabled={loading || !!error || options.length === 0}
			/>
		);
	};
TaxonomyDropdownFilter.displayName = 'TaxonomyDropdownFilter';

export default TaxonomyDropdownFilter;