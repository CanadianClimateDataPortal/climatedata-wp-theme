import React, { useContext, useMemo, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSearchQuery } from '@/store/climate-variable-slice';

import {
    StepContainer,
    StepContainerDescription,
} from '@/components/download/step-container';
import TaxonomyDropdownFilter from '@/components/taxonomy-dropdown-filter';
import VariableRadioCards from '@/components/variable-radio-cards';
import VariableFilterCount from '@/components/sidebar-menu-items/variables';

import { setVariable } from '@/features/download/download-slice';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import SectionContext from "@/context/section-provider";
import useFilteredVariables from '@/hooks/use-filtered-variables';

/**
 * Variable step
 */
const StepVariable: React.FC = () => {
    const { selectClimateVariable } = useClimateVariable();
    const [varType, setVarType] = useState<string>('');
    const [sector, setSector] = useState<string>('');
    const section = useContext(SectionContext);
    const { dataset } = useAppSelector((state) => state.download);
    const variable = useAppSelector((state) => state.download.variable);
    const { variableList } = useAppSelector((state) => state.map);
    const searchQuery = useAppSelector(selectSearchQuery);
    const dispatch = useAppDispatch();
    const { __ } = useI18n();

    const filterValues = useMemo(
        () => ({
            'var-type': varType,
            sector,
        }),
        [varType, sector]
    );
    
    // Get filtered variables and filter information
    const { isFiltering, filteredCount, totalCount } = useFilteredVariables(
        variableList,
        filterValues,
        searchQuery
    );

    const renderFilterCount = () => {
        if (!isFiltering) {
            return null;
        }

        return (
            <VariableFilterCount 
                filteredCount={filteredCount}
                totalCount={totalCount}
                className="text-sm text-neutral-grey-medium"
            />
        );
    };

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

            <div className="w-full mb-4">
                {renderFilterCount()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {dataset && (
                    <VariableRadioCards
                        dataset={dataset}
                        section={section}
                        filterValues={filterValues}
                        selected={variable}
                        showFilterCount={false}
                        useExternalFiltering={true}
                        onSelect={(selected) => {
                            dispatch(setVariable(selected));
                            selectClimateVariable(selected);
                        }}
                    />
                )}
            </div>
        </StepContainer>
    );
};

export default StepVariable;