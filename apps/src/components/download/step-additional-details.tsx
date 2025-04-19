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
	FrequencyType,
} from "@/types/climate-variable-interface";
import { FrequencySelect } from "@/components/frequency-select";
import SectionContext from "@/context/section-provider";
import { YearRange } from "@/components/year-range";
import appConfig from "@/config/app.config";

/**
 * Additional details step will allow the user to customize the download request
 */
const StepAdditionalDetails = React.forwardRef((_, ref) => {
	const { __ } = useI18n();
	const { climateVariable, setFrequency, setAveragingType, setDateRange, setAnalyzeScenarios, setPercentiles } = useClimateVariable();
	const section = useContext(SectionContext);
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;

	// expose isValid method to parent component
	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}

			const frequency = climateVariable.getFrequency();
			const averagingType = climateVariable.getAveragingType();
			const averagingOptions = climateVariable.getAveragingOptions() ?? [];

			const validations = [
				// If frequency is not daily and averaging options are available, one must be selected
				frequency === FrequencyType.DAILY || averagingOptions.length === 0 || Boolean(averagingType),
			];

			// For analyzed downloads, add additional validations
			if (climateVariable.getDownloadType() === DownloadType.ANALYZED) {
				const [startYear, endYear] = climateVariable.getDateRange() ?? [];
				const scenarios = climateVariable.getAnalyzeScenarios() ?? [];
				const percentiles = climateVariable.getPercentiles() ?? [];

				validations.push(
					// Date range is required
					Boolean(startYear && endYear),
					// At least one scenario is required
					scenarios.length > 0,
					// At least one percentile is required
					percentiles.length > 0
				);
			}

			return validations.every(Boolean);
		}
	}), [climateVariable]);

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

	// Check if Download Type is Analysed.
	const isDownloadTypeAnalyze = climateVariable?.getDownloadType() === DownloadType.ANALYZED;

	// Get the date range config.
	const dateRangeConfig = climateVariable?.getDateRangeConfig();
	// Get the date range selected by the user.
	const dateRange = climateVariable?.getDateRange() ?? [];
	// Get the percentiles options.
	const percentileOptions = climateVariable?.getPercentileOptions() ?? [];
	// Get the Scenario Options.
	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
	);

	return (
		<StepContainer title="Additional details">
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			{isDownloadTypeAnalyze && dateRangeConfig &&
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

			{frequencyConfig &&
				<FrequencySelect
					title={'Temporal frequency'}
					config={frequencyConfig}
					section={section}
					value={climateVariable?.getFrequency() ?? undefined}
					onValueChange={setFrequency}
					className={"sm:w-64 mb-4"}
				/>
			}

			{/* TODO: what is this? didn't see it in the figma file */}
			{averagingOptions.length > 0 && climateVariable?.getFrequency() !== FrequencyType.DAILY && <RadioGroupFactory
				name="temporal-frequency"
				className="max-w-md mb-8"
				optionClassName="w-1/2"
				options={averagingOptions}
				value={climateVariable?.getAveragingType() ?? undefined}
				onValueChange={setAveragingType}
			/>}

			{isDownloadTypeAnalyze && scenarioOptions.length > 0 &&
				<CheckboxFactory
					name="emission-scenarios"
					title={__('Emissions Scenarios')}
					tooltip={__('Select emission scenarios')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/2 sm:w-1/4"
					options={scenarioOptions}
					values={climateVariable?.getAnalyzeScenarios()}
					onChange={setAnalyzeScenarios}
				/>
			}

			{isDownloadTypeAnalyze && percentileOptions.length > 0 &&
				<CheckboxFactory
					name="percentiles"
					title={__('Percentiles')}
					tooltip={__('Select percentiles')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={percentileOptions ?? []}
					values={climateVariable?.getPercentiles() ?? []}
					onChange={setPercentiles}
				/>
			}
		</StepContainer>
	);
});
StepAdditionalDetails.displayName = 'StepAdditionalDetails';

export default StepAdditionalDetails;
