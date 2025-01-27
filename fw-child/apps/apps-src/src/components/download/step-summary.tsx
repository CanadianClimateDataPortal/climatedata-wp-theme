import React from "react";
import { useI18n } from "@wordpress/react-i18n";
import { PencilLine } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useDownloadContext } from "@/context/download-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const StepSummary: React.FC = () => {
	const { __ } = useI18n();

	const { currentStep, goToStep } = useDownloadContext();

	// const dispatch = useAppDispatch();
	const state = useAppSelector(state => state.download);

	const summaryData = [
		{
			title: __('Dataset'),
			content: [
				state.dataset?.name
			],
		},
		{
			title: __('Variable'),
			content: [
				state.variable?.title
			],
		},
		{
			title: __('Variable options'),
			content: `${state.version}, ` + __('MEAN TEMP >') + ' ' + state.degrees + ' °C'
		},
		{
			title: __('Location or area'),
			content: `${state.selectedCells} ` + __(' cells selected'),
		},
		{
			title: __('Additional details'),
			content: [
				`${state.startYear}-${state.endYear}`,
				state.frequency,
				state.percentiles.length === 7
					? __('All percentiles')
					: `${state.percentiles.length} ` + __('percentiles'),
				state.emissionScenarios.length
					? `${state.emissionScenarios.length} ` +
						(state.emissionScenarios.length === 1
							? __('Scenario selected')
							: __('Scenarios selected'))
						: __('No Scenarios selected'),
				`${state.decimalPlace} Decimal places`,
			].join(', ')
		}
	];

	return (
		<Card className={cn(
			'rounded-none my-6 sm:my-0',
			currentStep === 1 ? 'invisible' : ''
		)}>
			<CardHeader className="py-4">
				<CardTitle className="text-xl font-semibold">Summary</CardTitle>
			</CardHeader>
			<CardContent>
				{summaryData
				.filter((_, index) => index < (currentStep - 1)) // only show data up to the current step
				.map((item, index) => (
					<div key={index} className="flex items-start justify-between py-4 border-t border-soft-purple last:pb-0">
						<div className="flex-1">
							<h3 className="text-xs font-medium text-dark-purple uppercase mb-1">{item.title}</h3>
							<p className="text-brand-blue">
								{item.content}
							</p>
						</div>
						<Button variant="ghost" className="w-4 h-4 p-0 hover:bg-white" onClick={() => goToStep(index + 1)}>
							<PencilLine className="text-brand-blue cursor-pointer" />
						</Button>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

export default StepSummary;