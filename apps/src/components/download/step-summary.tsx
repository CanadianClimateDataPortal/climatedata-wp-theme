import React from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { PencilLine } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useLocale } from '@/hooks/use-locale';
import { useDownload } from '@/hooks/use-download';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const StepSummary: React.FC = () => {
	const { __, _n } = useI18n();
	const { locale } = useLocale();

	const { currentStep, goToStep, fields } = useDownload();
	const {
		dataset,
		variable,
		version,
		degrees,
		selectedCells,
		startYear,
		endYear,
		frequency,
		emissionScenarios,
		percentiles,
		decimalPlace,
	} = fields;

	const summaryData = [
		{
			title: __('Dataset'),
			content: [dataset?.title[locale]],
		},
		{
			title: __('Variable'),
			content: [variable?.title],
		},
		{
			title: __('Variable options'),
			content: `${version}, ` + __('MEAN TEMP') + ' > ' + degrees + ' °C',
		},
		{
			title: __('Location or area'),
			content: _n(
				'1 cell selected',
				'%d cells selected',
				selectedCells
			).replace('%d', String(selectedCells)),
		},
		{
			title: __('Additional details'),
			content: [
				`${startYear}-${endYear}`,
				frequency,
				percentiles.length === 7
					? __('All percentiles')
					: _n(
							'1 percentile',
							'%d percentiles',
							percentiles.length
						).replace('%d', String(percentiles.length)),
				emissionScenarios.length
					? _n(
							'1 Scenario selected',
							'%d Scenarios selected',
							emissionScenarios.length
						).replace('%d', String(emissionScenarios.length))
					: __('No Scenarios selected'),
				`${decimalPlace} Decimal places`,
			].join(', '),
		},
	];

	return (
		<Card
			className={cn(
				'rounded-none my-6 sm:my-0',
				currentStep === 1 ? 'invisible' : ''
			)}
		>
			<CardHeader className="py-4">
				<CardTitle className="text-xl font-semibold">
					{__('Summary')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{summaryData
					.filter((_, index) => index < currentStep - 1) // only show data up to the current step
					.map((item, index) => (
						<div
							key={index}
							className="flex items-start justify-between py-4 border-t border-soft-purple last:pb-0"
						>
							<div className="flex-1">
								<h3 className="text-xs font-semibold text-dark-purple tracking-wider leading-4 uppercase mb-1">
									{item.title}
								</h3>
								<p className="text-brand-blue">
									{item.content}
								</p>
							</div>
							<Button
								variant="ghost"
								className="w-4 h-4 p-0 hover:bg-white"
								onClick={() => goToStep(index + 1)}
							>
								<PencilLine className="text-brand-blue cursor-pointer" />
							</Button>
						</div>
					))}
			</CardContent>
		</Card>
	);
};

export default StepSummary;
