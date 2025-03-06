import React, { useMemo, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import TaxonomyDropdownFilter from '@/components/taxonomy-dropdown-filter';
import VariableRadioCards from '@/components/variable-radio-cards';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setVariable } from '@/features/download/download-slice';

/**
 * Variable step
 */
const StepVariable: React.FC = () => {
	const [varType, setVarType] = useState<string>('');
	const [sector, setSector] = useState<string>('');

	const filterValues = useMemo(
		() => ({
			'var-type': varType,
			sector,
		}),
		[varType, sector]
	);

	const { __ } = useI18n();

	const variable = useAppSelector((state) => state.download.variable);
	const dispatch = useAppDispatch();

	return (
		<StepContainer title={__('Select a variable')}>
			<StepContainerDescription>
				{__(
					'Select a variable contained in the dataset previously selected. Use the filters below to narrow down the list of variables.'
				)}
			</StepContainerDescription>

			<div className="flex flex-col md:flex-row gap-4 mb-8">
				<TaxonomyDropdownFilter
					className="sm:w-52"
					onFilterChange={(value) => setVarType(value)}
					slug="var-type"
					label={__('Variable Types')}
					tooltip={__('Select a variable type')}
					placeholder={__('All')}
					value={filterValues['var-type'] || ''}
				/>
				<TaxonomyDropdownFilter
					className="sm:w-52"
					onFilterChange={(value) => setSector(value)}
					slug="sector"
					label={__('Sectors')}
					tooltip={__('Select a sector')}
					placeholder={__('All')}
					value={filterValues.sector || ''}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<VariableRadioCards
					filterValues={filterValues}
					selected={variable}
					onSelect={(selected) => {
						dispatch(setVariable(selected));
					}}
				/>
			</div>
		</StepContainer>
	);
};
StepVariable.displayName = 'StepVariable';

export default StepVariable;
