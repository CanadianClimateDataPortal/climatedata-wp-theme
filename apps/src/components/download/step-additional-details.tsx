import React, { useContext } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { CheckboxFactory } from '@/components/ui/checkbox';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';

import { useClimateVariable } from "@/hooks/use-climate-variable";
import {
	AveragingType,
	DownloadType,
	FrequencyConfig,
} from "@/types/climate-variable-interface";
import { FrequencySelect } from "@/components/frequency-select";
import SectionContext from "@/context/section-provider";
import { YearRange } from "@/components/year-range";

/**
 * Additional details step will allow the user to customize the download request
 */
const StepAdditionalDetails: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setFrequency, setAveragingType, setDateRange, setAnalyzeScenarios, setPercentiles } = useClimateVariable();
	const section = useContext(SectionContext);
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;

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

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED &&
				<CheckboxFactory
					name="emission-scenarios"
					title={__('Emissions Scenarios')}
					tooltip={__('Select emission scenarios')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/2 sm:w-1/4"
					options={climateVariable?.getScenarios() ?? []}
					values={climateVariable?.getAnalyzeScenarios()}
					onChange={setAnalyzeScenarios}
				/>
			}

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED &&
				<CheckboxFactory
					name="percentiles"
					title={__('Percentiles')}
					tooltip={__('Select percentiles')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={climateVariable?.getPercentileOptions() ?? []}
					values={climateVariable?.getPercentiles() ?? []}
					onChange={setPercentiles}
				/>
			}
		</StepContainer>
	);
};
StepAdditionalDetails.displayName = 'StepAdditionalDetails';

export default StepAdditionalDetails;
