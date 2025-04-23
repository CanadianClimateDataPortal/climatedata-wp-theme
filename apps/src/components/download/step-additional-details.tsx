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
import { StepComponentRef, StepResetPayload } from "@/types/download-form-interface";
import { FrequencySelect } from "@/components/frequency-select";
import SectionContext from "@/context/section-provider";
import { YearRange } from "@/components/year-range";
import appConfig from "@/config/app.config";

/**
 * Additional details step will allow the user to customize the download request
 */
const StepAdditionalDetails = React.forwardRef<StepComponentRef>((_, ref) => {
	const { __ } = useI18n();
	const {
		climateVariable,
		setFrequency,
		setAveragingType,
		setDateRange,
		setAnalyzeScenarios,
		setPercentiles,
		setMissingData,
		setModel
	} = useClimateVariable();
	const section = useContext(SectionContext);
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;

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
				if (climateVariable.getDatasetType() === 'ahccd') {
					// A missing data option must be selected.
					validations.push(!!climateVariable.getMissingData());
				} else {
					const [startYear, endYear] = climateVariable.getDateRange() ?? [];
					const scenarios = climateVariable.getAnalyzeScenarios() ?? [];
					const percentiles = climateVariable.getPercentiles() ?? [];

					validations.push(
						// Date range is required
						Boolean(startYear && endYear),
						// At least one scenario is required
						scenarios.length > 0,
						// At least one percentile is required
						percentiles.length > 0,
						// A model must be selected.
						!!climateVariable.getModel(),
					);
				}
			}

			return validations.every(Boolean);
		},
		getResetPayload: () => {
			if (!climateVariable) return {};

			const payload: StepResetPayload = {};

			if (climateVariable.getFrequencyConfig()) {
				payload.frequency = null;
			}

			if (climateVariable.getAveragingOptions()?.length) {
				payload.averagingType = null;
			}

			if (climateVariable.getDateRangeConfig()) {
				payload.dateRange = null;
			}

			if (climateVariable.getScenarios()?.length) {
				payload.analyzeScenarios = [];
			}

			if (climateVariable.getPercentileOptions()?.length) {
				payload.percentiles = [];
			}

			return payload;
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

	const dateRangeConfig = climateVariable?.getDateRangeConfig();
	const dateRange = climateVariable?.getDateRange() ?? [];
	const scenarioOptions = appConfig.scenarios.filter((scenario) =>
		climateVariable?.getScenarios()?.includes(scenario.value)
	);

	const missingDataOptions = climateVariable?.getMissingDataOptions() ?? [];
	const formattedMissingDataOptions = missingDataOptions.map(option => ({
		label: option === 'wmo' ? __('WMO Parameters') : option + '%',
		value: option
	}));

	const modelOptions = climateVariable?.getModelOptions() ?? [];
	const formattedModelOptions = modelOptions.map(option => ({
		label: option === 'full' ? __('Full ensemble') : option.toUpperCase() + __(' (Ensemble)'),
		value: option
	}));

	return (
		<StepContainer title="Additional details">
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& dateRangeConfig
				&& <YearRange
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

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& averagingOptions.length > 0
				&& climateVariable?.getFrequency() !== FrequencyType.DAILY
				&& <RadioGroupFactory
					name="temporal-frequency"
					className="max-w-md mb-8"
					optionClassName="w-1/2"
					options={averagingOptions}
					value={climateVariable?.getAveragingType() ?? undefined}
					onValueChange={setAveragingType}
				/>
			}

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& formattedModelOptions.length > 0
				&& <RadioGroupFactory
					name="models"
					title={__('Models')}
					tooltip={__('Select models')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={formattedModelOptions}
					value={climateVariable.getModel() ?? undefined}
					onValueChange={setModel}
				/>
			}

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& scenarioOptions.length > 0
				&& <CheckboxFactory
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

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& climateVariable?.getPercentileOptions().length > 0
				&& <CheckboxFactory
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

			{climateVariable?.getDownloadType() === DownloadType.ANALYZED
				&& formattedMissingDataOptions.length > 0
				&& <RadioGroupFactory
					name="missingDataOptions"
					title={__('Missing data options')}
					tooltip={__('Select missing data options')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={formattedMissingDataOptions}
					value={climateVariable.getMissingData() ?? undefined}
					onValueChange={setMissingData}
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
		</StepContainer>
	);
});
StepAdditionalDetails.displayName = 'StepAdditionalDetails';

export default StepAdditionalDetails;
