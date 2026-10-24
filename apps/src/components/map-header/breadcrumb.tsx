/**
 * Breadcrumb component
 *
 * Displays the breadcrumbs for the selected state of the map: the dataset
 * name and the selected variable title.
 */
import React, { useMemo } from 'react';
import { Info } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import { useAppSelector } from '@/app/hooks';
import { useLocale } from '@/hooks/use-locale';
import { useClimateVariable } from '@/hooks/use-climate-variable';

import { Button } from '@/components/ui/button';

export const Breadcrumb: React.FC<{ onClick: () => void }> = ({
	onClick,
}) => {
	const { locale, getLocalized } = useLocale();
	const dataset = useAppSelector((state) => state.map.dataset);
	const variableList = useAppSelector((state) => state.map.variableList);
	const { climateVariable } = useClimateVariable();

	const datasetName = useMemo(() => {
		if (!dataset) return '';

		return getLocalized(dataset);
	}, [dataset, locale]);

	const variableTitle = useMemo(() => {
		if (climateVariable && climateVariable.toObject().postId) {
			return climateVariable.getTitle() || '';
		}

		// If no explicit climate variable selection, but we have variableList data,
		// show the first variable as a fallback
		if (variableList && variableList.length > 0) {
			return variableList[0].title || '';
		}

		// Don't show anything if we can't determine the variable
		return '';
	}, [climateVariable, variableList]);

	return (
		<div className="flex items-center gap-2 breadcrumb">
			{datasetName && <span className='hidden md:inline'>{datasetName}</span>}
			{datasetName && variableTitle && <span className='hidden md:inline'>/</span>}
			{variableTitle && (
				<Button
					variant="ghost"
					className="breadcrumb-button text-md text-cdc-black hover:text-dark-purple hover:bg-transparent p-0 h-auto whitespace-normal"
					onClick={onClick}
					aria-label={__('View details')}
				>
					{variableTitle}
					<Info />
				</Button>
			)}
		</div>
	);
};
Breadcrumb.displayName = 'Breadcrumb';
