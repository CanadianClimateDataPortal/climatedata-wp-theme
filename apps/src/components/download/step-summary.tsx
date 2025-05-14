import React, { useMemo } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { PencilLine } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useLocale } from '@/hooks/use-locale';
import { useDownload } from '@/hooks/use-download';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import appConfig from '@/config/app.config';
import { FileFormatType } from "@/types/climate-variable-interface";

const VariableOptionsSummary: React.FC = () => {
	const { climateVariable } = useClimateVariable();

	if (!climateVariable) return null;

	const version = climateVariable.getVersion?.(); // fallback if getVersion exists
	const analysisFields = climateVariable.getAnalysisFields?.() ?? [];
	const analysisFieldValues = climateVariable.getAnalysisFieldValues?.() ?? {};

	return (
			<ul className="download-summary-bullet list-disc list-inside">
				{climateVariable.getVersions().length > 0 && (<li key={version}><span className='text-dark-purple text-sm'>Version:</span> <span className="uppercase">{version || 'N/A'}</span></li>)}
				{analysisFields.map(({ key, label, unit }) => {
					const value = analysisFieldValues[key] ?? '-';

					return (
						<li className="summary-item" key={key}>
							<span className='text-gray-600 text-sm'>{label}</span>: <span className="uppercase">{value} {unit}</span>
						</li>
					);
				})}
			</ul>
	);
};
const StepSummary: React.FC = () => {
	const { __, _n } = useI18n();
	const { locale } = useLocale();
	const { currentStep, goToStep, dataset } = useDownload();

	const { climateVariable } = useClimateVariable();

	/**
	 * @todo do we want to keep the dataset value in the useDownload fields context variable?
	 */
	const summaryData = useMemo(() => ([
		{
			title: __('Dataset'),
			content: [dataset?.title?.[locale] ?? ''],
		},
		{
			title: __('Variable'),
			content: [climateVariable?.getTitle() ?? ''],
		},
		{
			title: __('Variable options'),
			content: <VariableOptionsSummary />,
		},
		{
			title: __('Location or area'),
			content: (() => {
				const selectedCount = climateVariable?.getSelectedRegion()
					? climateVariable?.getSelectedRegion()?.cellCount ?? 0
					: climateVariable?.getSelectedPointsCount() ?? 0;

				return _n('1 selected', '%d selected', selectedCount).replace('%d', String(selectedCount));
			})(),
		},
		{
			title: __('Additional details'),
			content: (() => {
				const [startYear, endYear] = climateVariable?.getDateRange() ?? ['2041', '2070'];
				const frequency = climateVariable?.getFrequency() ?? '';
				const percentiles = climateVariable?.getPercentiles() ?? [];
				const scenarios = climateVariable?.getAnalyzeScenarios() ?? [];

				const data = [];

				if (startYear && endYear) {
					data.push(`${startYear}-${endYear}`);
				}

				if (frequency && frequency !== '') {
					data.push(appConfig.frequencies.find(({ value }) => value === frequency)?.label ?? frequency);
				}

				if (scenarios && scenarios.length > 0) {
					const scenarioParts: string[] = [];
					scenarios.forEach((scenario) => {
						scenarioParts.push(appConfig.scenarios.find(({ value }) => value === scenario)?.label ?? scenario);
					});
					data.push(scenarioParts.join(', '));
				}

				if (percentiles && percentiles.length > 0) {
					data.push(
						percentiles.length === climateVariable?.getPercentileOptions().length
							? __('All percentiles')
							: _n('1 percentile', '%d percentiles', percentiles.length).replace(
								'%d',
								String(percentiles.length)
							)
					);
				}

				return data.join(', ');
			})(),
		},
		{
			title: __('File parameters'),
			content: (() => {
				const fileFormat = climateVariable?.getFileFormat();
				if(!fileFormat) return '';

				const fileFormatLabels = {
					[FileFormatType.CSV]: 'CSV',
					[FileFormatType.JSON]: 'JSON',
					[FileFormatType.NetCDF]: 'NetCDF',
					[FileFormatType.GeoJSON]: 'GeoJSON',
				};

				return fileFormatLabels[fileFormat] ?? fileFormat;
			})(),
		},
	]), [climateVariable, dataset, locale, __, _n]);

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
								<div className="text-brand-blue">
									{item.content}
								</div>
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
