import React, { useState } from 'react';
import { useI18n } from "@wordpress/react-i18n";

import { CheckboxFactory } from "@/components/ui/checkbox";
import Dropdown from "@/components/ui/dropdown";
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { StepContainer, StepContainerDescription } from "@/components/download/step-container";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
	setStartYear,
	setEndYear,
	setFrequency,
	setEmissionScenarios,
	setPercentiles,
	setDecimalPlace,
} from "@/features/download/download-slice";

/**
 * Additional details step
 */
const StepAdditionalDetails: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const { startYear, endYear, frequency, emissionScenarios, percentiles, decimalPlace } = useAppSelector(state => state.download);

	const yearRange = Array.from({ length: 31 }, (_, i) => (i + 2000));
	const yearOptions = yearRange.map((year) => ({ value: year, label: year }));

	const frequencyOptions = [
		__('Annual'),
		__('Annual (July-June)'),
		__('Seasonal'),
		__('Monthly'),
	];

	const emissionScenariosOptions = [
		'SSP5–8.5',
		'SSP1–2.6',
		'SSP2–4.5',
	];

	const percentilesOptions = [
		'05',
		'10',
		'25',
		'50',
		'75',
		'90',
		'95',
	];

	const decimalPlaceOptions = [0, 2].map((value) => ({ value, label: value }));

	return (
		<StepContainer title="Additional details">
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			<div className="flex gap-4 sm:gap-8 mb-6">
				<Dropdown
					className="w-1/2 sm:w-52"
					label={__('Start Year')}
					value={startYear}
					options={yearOptions}
					onChange={(value) => {
						dispatch(setStartYear(value));
					}}
				/>

				<Dropdown
					className="w-1/2 sm:w-52"
					label={__('End Year')}
					value={endYear}
					options={yearOptions}
					onChange={(value) => {
						dispatch(setEndYear(value));
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
					dispatch(setFrequency(value));
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
					dispatch(setEmissionScenarios(values));
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
					dispatch(setPercentiles(values));
				}}
			/>

			<Dropdown
				className="sm:w-64"
				label={__('Decimal Place')}
				value={decimalPlace}
				options={decimalPlaceOptions}
				onChange={(value) => {
					setDecimalPlace(value);
				}}
			/>

		</StepContainer>
	);
};
StepAdditionalDetails.displayName = "StepAdditionalDetails";

export default StepAdditionalDetails;
