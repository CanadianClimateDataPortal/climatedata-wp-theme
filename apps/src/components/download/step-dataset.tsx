import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { __ } from '@/context/locale-provider';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { RadioCard, RadioCardFooter } from '@/components/ui/radio-card';
import Link from '@/components/ui/link';

import { useLocale } from '@/hooks/use-locale';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDataset } from '@/features/download/download-slice';
import { fetchTaxonomyData } from '@/services/services';
import { TaxonomyData } from '@/types/types';
import { StepComponentRef } from '@/types/download-form-interface';

/**
 * Dataset step
 */
const StepDataset = React.forwardRef<StepComponentRef>((_, ref) => {
	const [options, setOptions] = useState<TaxonomyData[]>([]);

	const { locale } = useLocale();

	const dataset = useAppSelector((state) => state.download.dataset);
	const dispatch = useAppDispatch();

	React.useImperativeHandle(ref, () => ({
		isValid: () => Boolean(dataset),
		getResetPayload: () => {
			return {
				dataset: null
			};
		}
	}), [dataset]);

	useEffect(() => {
		fetchTaxonomyData('datasets', 'download').then((data) => {
			setOptions(data);
		});
	}, []);

	return (
		<StepContainer title={__('Select a Dataset')}>
			<StepContainerDescription>
				{__(
					'Select a dataset to begin building your download request. Several options will be available after this selection.'
				)}
			</StepContainerDescription>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 auto-rows-fr">
				{options.map((option, index) => {
					return (
						<RadioCard
							key={index}
							value={option.term_id}
							radioGroup="dataset"
							title={option.title?.[locale] ?? ''}
							description={
								option?.card?.description?.[locale] ?? ''
							}
							selected={dataset?.term_id === option.term_id}
							onSelect={() => {
								dispatch(setDataset(option));
							}}
							className="mb-0"
						>
							{option?.card?.link && (
								<RadioCardFooter>
									<Link
										icon={<ExternalLink size={16} />}
										href={
											option.card.link?.[locale]?.url ??
											'#'
										}
										className="text-base text-brand-blue leading-6"
									>
										{__('Learn more')}
									</Link>
								</RadioCardFooter>
							)}
						</RadioCard>
					);
				})}
			</div>
		</StepContainer>
	);
});
StepDataset.displayName = 'StepDataset';

export default StepDataset;
