import React from 'react';
import { useI18n } from "@wordpress/react-i18n";

import { CheckboxFactory } from "@/components/ui/checkbox";
import Dropdown from "@/components/ui/dropdown";
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { StepContainer, StepContainerDescription } from "@/components/download/step-container";

import { normalizeDropdownOptions } from "@/lib/format";
import { useDownloadContext } from "@/context/download-provider";

/**
 * Additional details step
 */
const StepAdditionalDetails: React.FC = () => {
	const { __ } = useI18n();

	const { setField, fields } = useDownloadContext();
	const {
		startYear,
		endYear,
		frequency,
		emissionScenarios,
		percentiles,
		decimalPlace
	} = fields;

	const yearRange = Array.from({ length: 31 }, (_, i) => (i + 2000));
	const yearOptions = normalizeDropdownOptions(yearRange.map((year) =>
		({ value: year, label: String(year) })));

	const frequencyOptions = normalizeDropdownOptions([
		__('Annual'),
		__('Annual (July-June)'),
		__('Seasonal'),
		__('Monthly'),
	]);

	const emissionScenariosOptions = normalizeDropdownOptions([
		'SSP5–8.5',
		'SSP1–2.6',
		'SSP2–4.5',
	]);

	const percentilesOptions = normalizeDropdownOptions([
		'05',
		'10',
		'25',
		'50',
		'75',
		'90',
		'95',
	]);

	const decimalPlaceOptions = normalizeDropdownOptions([0, 2].map((value) =>
		({ value, label: String(value) })));

	return (
		<StepContainer title="Additional details">
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			<div className="flex gap-4 sm:gap-8 mb-6">
				<Dropdown<number>
					className="w-1/2 sm:w-52"
					label={__('Start Year')}
					value={startYear}
					options={yearOptions}
					onChange={(value) => {
						setField('startYear', value);
					}}
				/>

				<Dropdown<number>
					className="w-1/2 sm:w-52"
					label={__('End Year')}
					value={endYear}
					options={yearOptions}
					onChange={(value) => {
						setField('endYear', value);
					}}
				/>
			</div>

			<RadioGroupFactory
				title={__('Temporal frequency')}
				name="temporal-frequency"
				className="max-w-md mb-8"
				optionClassName="w-1/2"
				options={frequencyOptions}
				value={frequency}
				onValueChange={(value) => {
					setField('frequency', value);
				}}
			/>

			<CheckboxFactory
				name="emission-scenarios"
				title={__('Emissions Scenarios')}
				tooltip={__('Select emission scenarios')}
				orientation="horizontal"
				className="max-w-md mb-8"
				optionClassName="w-1/2 sm:w-1/4"
				options={emissionScenariosOptions}
				values={emissionScenarios}
				onChange={(values) => {
					setField('emissionScenarios', values);
				}}
			/>

			<CheckboxFactory
				name="percentiles"
				title={__('Percentiles')}
				tooltip={__('Select percentiles')}
				orientation="horizontal"
				className="max-w-md mb-8"
				optionClassName="w-1/4"
				options={percentilesOptions}
				values={percentiles}
				onChange={(values) => {
					setField('percentiles', values);
				}}
			/>

			<Dropdown
				className="sm:w-64"
				label={__('Decimal Place')}
				value={decimalPlace}
				options={decimalPlaceOptions}
				onChange={(value) => {
					setField('decimalPlace', value);
				}}
			/>

		</StepContainer>
	);
};
StepAdditionalDetails.displayName = "StepAdditionalDetails";

export default StepAdditionalDetails;
