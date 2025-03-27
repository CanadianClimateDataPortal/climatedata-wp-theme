import React, { useContext } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { CheckboxFactory } from '@/components/ui/checkbox';
import Dropdown from '@/components/ui/dropdown';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	setDecimalPlace,
	setEmissionScenarios,
	setPercentiles,
} from '@/features/download/download-slice';
import { normalizeDropdownOptions } from '@/lib/format';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	AveragingType,
	FrequencyConfig
} from "@/types/climate-variable-interface";
import { FrequencySelect } from "@/components/frequency-select";
import SectionContext from "@/context/section-provider";
import { YearRange } from "@/components/year-range";

/**
 * Additional details step will allow the user to customize the download request
 */
const StepAdditionalDetails: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setFrequency, setAveragingType, setDateRange } = useClimateVariable();
	const section = useContext(SectionContext);
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;

	const {
		emissionScenarios,
		percentiles,
		decimalPlace,
	} = useAppSelector((state) => state.download);
	const dispatch = useAppDispatch();

	const averagingOptions = [
		{
			value: AveragingType.ALL_YEARS,
			label: __('All years'),
		},
		{
			value: AveragingType.THIRTY_YEARS,
			label: __('30 years'),
		},
	].filter((option) =>
		climateVariable?.getAveragingOptions()?.includes(option.value)
	);

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

	const decimalPlaceOptions = normalizeDropdownOptions(
		[0, 2].map((value) => ({ value, label: String(value) }))
	);

	const dateRangeConfig = climateVariable?.getDateRangeConfig();
	const dateRange = climateVariable?.getDateRange() ?? [];

	return (
		<StepContainer title="Additional details">
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			{dateRangeConfig &&
				<YearRange
					startYear={{
						label: __('Start Year'),
						value: dateRange[0],
					}}
					endYear={{
						label: __('End Year'),
						value: dateRange[1],
					}}
					config={dateRangeConfig}
					onChange={setDateRange}
				/>
			}

			<FrequencySelect
				title={'Temporal frequency'}
				config={frequencyConfig}
				section={section}
				value={climateVariable?.getFrequency() ?? undefined}
				onValueChange={setFrequency}
				className={"sm:w-64 mb-4"}
			/>

			<RadioGroupFactory
				name="temporal-frequency"
				className="max-w-md mb-8"
				optionClassName="w-1/2"
				options={averagingOptions}
				value={climateVariable?.getAveragingType() ?? undefined}
				onValueChange={setAveragingType}
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
					dispatch(setDecimalPlace(value));
				}}
			/>
		</StepContainer>
	);
};
StepAdditionalDetails.displayName = 'StepAdditionalDetails';

export default StepAdditionalDetails;
