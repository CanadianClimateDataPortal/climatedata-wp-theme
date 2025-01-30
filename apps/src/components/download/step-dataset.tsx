import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

import { StepContainer, StepContainerDescription } from '@/components/download/step-container';
import { RadioCard, RadioCardFooter } from "@/components/ui/radio-card";
import Link from "@/components/ui/link";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDataset } from "@/features/download/download-slice";
import { fetchTaxonomyData } from "@/services/services";
import { TaxonomyData } from "@/types/types";

/**
 * Dataset step
 */
const StepDataset: React.FC = () => {
	const [options, setOptions] = useState<TaxonomyData[]>([]);

	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const { dataset } = useAppSelector(state => state.download);

	useEffect(() => {
		fetchTaxonomyData('variable-dataset').then((data) => {
			setOptions(data);
		});
	}, []);

	return (
		<StepContainer title={__('Select a Dataset')}>
			<StepContainerDescription>
				{__('Select dataset to begin building your download request. Several options will be available after this selection.')}
			</StepContainerDescription>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 sm:gap-4">
				{options.map((option, index) => {
					return (
						<RadioCard
							key={index}
							value={option.id}
							radioGroup="dataset"
							title={option.name ?? ''}
							description={option.description}
							selected={dataset?.id === option.id}
							onSelect={() => {
								dispatch(setDataset(option));
							}}
							className="mb-0"
						>
							<RadioCardFooter>
								<Link
									icon={<ExternalLink size={16} />}
									href={option.link ?? '#'}
									className="text-sm text-brand-blue"
								>
									{__('Learn more')}
								</Link>
							</RadioCardFooter>
						</RadioCard>
					);
				})}
			</div>
		</StepContainer>
	);
};
StepDataset.displayName = "StepDataset";

export default StepDataset;
