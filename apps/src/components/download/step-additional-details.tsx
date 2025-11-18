import React, { useContext } from 'react';
import { __ } from '@/context/locale-provider';

import { CheckboxFactory } from '@/components/ui/checkbox';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import { StepContainer, StepContainerDescription } from '@/components/download/step-container';
import { EmissionScenariosTooltip } from '@/components/sidebar-menu-items/emission-scenarios-control';

import { useClimateVariable } from "@/hooks/use-climate-variable";
import { AveragingType, DownloadType, FrequencyConfig, FrequencyType } from "@/types/climate-variable-interface";
import { StepComponentRef, StepResetPayload } from "@/types/download-form-interface";
import { FrequencySelect } from "@/components/frequency-select";
import SectionContext from "@/context/section-provider";
import { YearRange } from "@/components/year-range";
import { DateRangePicker } from "@/components/date-range-picker";
import appConfig from "@/config/app.config";
import { useLocale } from '@/hooks/use-locale';
import { sprintf } from "@wordpress/i18n";

const modelLabels: Record<string, string> = {
	'pcic12': __('PCIC12 (Ensemble)'),
	'24models': __('Full ensemble'),
	'26models': __('Full ensemble'),
	'humidex_models': __('Full ensemble'),
}

function MissingDataTooltip(): React.ReactElement {
	return (
		<div className="formatted-content">
			<h3>{__('Missing Value Options')}</h3>
			<p dangerouslySetInnerHTML={{
				__html:
				sprintf(
					__('For a variety of reasons, meteorological station records are generally not complete. Missing ' +
						'data can affect how useful a station dataset is for calculating, for example, monthly ' +
						'averages and <a href="/resource/30-years-data/" %s>climate normals</a> (30-year averages). ' +
						'There are <a href="https://library.wmo.int/records/item/55797-wmo-guidelines-on-the-calculation-of-climate-normals" %s>standards</a> ' +
						'related to the amount of missing data allowed in calculations, but rigid adherence to these ' +
						'can sometimes result in a lot of data being discounted, and this can be a problem, ' +
						'particularly in areas where data are sparse.'),
					'target="_blank"',
					'target="_blank" rel="noopener noreferrer"',
				)
			}} />
			<p>
				{__('We provide four missing data options for the analysis of observed station data. These permit ' +
					'you to control how much missing data is acceptable in your custom analysis:')}
			</p>
			<ol>
			<li>{__('5%')}</li>
			<li>{__('10%')}</li>
			<li>{__('15%')}</li>
			<li>{__('WMO parameters')}</li>
			</ol>
			<p>
				{__('For options 1-3, the percentage of missing data allowed is calculated for each period of the ' +
					'station record (month, year or season, depending on your selection). This means that for the ' +
					'annual calculations the missing values could be spread throughout the year, or occur all at ' +
					'once. For example, if you select the 5% missing data option, this means that as many as 18 ' +
					'missing values would be allowed in a year – they could be spread throughout the year or there ' +
					'could be a whole month missing.')}
			</p>
			<p>
				{__('For option 4, the WMO (World Meteorological Organization) parameters, the criteria are applied ' +
					'for each month regardless of whether monthly, seasonal or annual calculations are selected, ' +
					'which makes the calculations for this option slightly slower than those for options 1-3. A ' +
					'given month is considered missing or invalid if either of the following two criteria are met:')}
			</p>
			<ol type="a">
			<li>{__('Observations are missing for 11 or more days during the month;')}</li>
			<li>{__('Observations are missing for a period of 5 or more consecutive days during the month.')}</li>
			</ol>
			<p>
				{__('Presence of a single invalid month within an annual or seasonal calculation will result in a ' +
					'no-data (NaN) value in the output.')}
			</p>
		</div>
	);
}

/**
 * Step 5.
 *
 * Additional details step will allow the user to customize the download request
 */
const StepAdditionalDetails = React.forwardRef<StepComponentRef>((_, ref) => {
	const { locale } = useLocale();
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
				const [startYear, endYear] = climateVariable.getDateRange() ?? [];
				const scenarios = climateVariable.getAnalyzeScenarios() ?? [];

				validations.push(
					// A date range is required if the config is available.
					!!climateVariable.getDownloadDateRangeConfig() || !!(startYear && endYear),

					// Following checks if there are no available options or if one is selected.
					climateVariable.getScenarios().length === 0 || scenarios.length > 0,
					// Note: Percentiles validation is removed since empty selection is now valid
					climateVariable.getModelOptions().length === 0 || !!climateVariable.getModel(),
					climateVariable.getMissingDataOptions().length === 0 || !!climateVariable.getMissingData()
				);
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

			payload.dateRange = climateVariable.getDefaultDateRange();

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
			label: __('30-year averages'),
		},
	].filter((option) =>
		climateVariable?.getAveragingOptions()?.includes(option.value)
	);

	// Check if Download Type is Analysed.
	const isDownloadTypeAnalyzed = climateVariable?.getDownloadType() === DownloadType.ANALYZED;

	// Get the date range config.
	const dateRangeConfig = climateVariable?.getDownloadDateRangeConfig();

	// Get the date range selected by the user.
	const dateRange = climateVariable?.getDateRange() ?? [];

	// Get the percentile options.
	const percentileOptions = climateVariable?.getPercentileOptions() ?? [];

	// Get the Scenario Options.
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
		label: modelLabels[option] || option,
		value: option,
	}));

	const showSSP3Warning = isDownloadTypeAnalyzed
		&& climateVariable?.getAnalyzeScenarios().includes("ssp370");

	return (
		<StepContainer title={__("Additional details")}>
			<StepContainerDescription>
				{__('Adjust the controls below to customize your analysis.')}
			</StepContainerDescription>

			{isDownloadTypeAnalyzed
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

			{/**
			  Special case for "Station Data".
			  For "Station Data", we need to show a date picker instead of year range picker.
			*/}
			{climateVariable?.getId() === "station_data" && (
				<DateRangePicker
					defaultFromDate={dateRange[0] ? new Date(dateRange[0] + ' 00:00:00') : undefined}
					defaultToDate={dateRange[1] ? new Date(dateRange[1] + ' 23:59:59') : undefined}
					minDate={dateRangeConfig?.min ? new Date(dateRangeConfig.min + ' 00:00:00') : undefined}
					maxDate={dateRangeConfig?.max ? new Date(dateRangeConfig.max + ' 23:59:59') : undefined}
					locale={locale}
					onFromChange={(date) => {
						const fromDate = date ? date.toISOString().split("T")[0] : null;
						if (fromDate) {
							setDateRange([
								fromDate,
								dateRange[1],
							])
						}
					}}
					onToChange={(date) => {
						const toDate = date ? date.toISOString().split("T")[0] : null;
						if (toDate) {
							setDateRange([
								dateRange[0],
								toDate,
							])
						}
					}}
				/>
			)}

			{isDownloadTypeAnalyzed
				&& formattedModelOptions.length > 0
				&& <RadioGroupFactory
					name="models"
					title={__('Models')}
					tooltip={__('Where applicable, select how many models to include in the analysis. ' +
						'The PCIC12 model ensemble contains 12 models and will take less time and computer resources to process while still covering 95% of the ensemble spread.')}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={formattedModelOptions}
					value={climateVariable.getModel() ?? undefined}
					onValueChange={setModel}
				/>
			}

			{isDownloadTypeAnalyzed
				&& scenarioOptions.length > 0
				&& (
					<div className="mb-8 max-w-md">
						<CheckboxFactory
							name="emission-scenarios"
							title={__('Emissions Scenarios')}
							tooltip={<EmissionScenariosTooltip />}
							orientation="horizontal"
							className="max-w-md"
							optionClassName="w-1/2 sm:w-1/4"
							options={scenarioOptions}
							values={climateVariable?.getAnalyzeScenarios()}
							onChange={setAnalyzeScenarios}
						/>
						{showSSP3Warning
							&& <div className="text-neutral-grey-medium text-sm mt-3">
									{__(`* If SSP3-7.0 is selected above, either alone or with
									any of the other emissions scenarios, then only 24 models are
									included in the analysis for all selected scenarios. To use
									the 26 models available for all emissions scenarios except
									SSP3-7.0, do not include SSP3-7.0 in your selection above.`)}
								</div>
						}
					</div>
				)
			}

			{isDownloadTypeAnalyzed
				&& percentileOptions.length > 0
				&& (
					<div className="mb-8 max-w-md">
						<CheckboxFactory
							name="percentiles"
							title={__('Percentiles')}
							tooltip={
								<span dangerouslySetInnerHTML={{
									__html:
										sprintf(
											__(
												'<a href="/glossary/#def-13396" %s>Percentiles</a> are statistics ' +
												'used to summarize large datasets (in this case, information from ' +
												'20+ models). On the ClimateData.ca time series plots, the range of ' +
												'the model results are represented by the 10th, 50th (median) and ' +
												'90th percentiles. Select the percentiles you wish to use to ' +
												'summarize this multi-model ensemble. If you would like to receive ' +
												'information for all models individually, do not select any ' +
												'percentiles.'
											),
											'target="_blank" rel="noopener noreferrer" class="text-dark-purple underline"',
									)
								}} />
							}
							orientation="horizontal"
							className="max-w-md"
							optionClassName="w-1/4"
							options={percentileOptions ?? []}
							values={climateVariable?.getPercentiles() ?? []}
							onChange={setPercentiles}
						/>
						<div className="text-neutral-grey-medium text-sm mt-3">
							{__('Unselect all to receive output from individual models')}
						</div>
					</div>
				)
			}

			{isDownloadTypeAnalyzed
				&& formattedMissingDataOptions.length > 0
				&& <RadioGroupFactory
					name="missingDataOptions"
					title={__('Missing data options')}
					tooltip={<MissingDataTooltip />}
					orientation="horizontal"
					className="max-w-md mb-8"
					optionClassName="w-1/4"
					options={formattedMissingDataOptions}
					value={climateVariable.getMissingData() ?? undefined}
					onValueChange={setMissingData}
				/>
			}

			<FrequencySelect
				title={__('Temporal frequency')}
				config={frequencyConfig}
				section={section}
				value={climateVariable?.getFrequency() ?? undefined}
				onValueChange={setFrequency}
				className={"sm:w-64 mb-4"}
				downloadType={climateVariable?.getDownloadType() ?? undefined}
			/>

			{!isDownloadTypeAnalyzed
				&& averagingOptions.length > 0
				&& climateVariable?.getFrequency() !== FrequencyType.DAILY
				&& <RadioGroupFactory
					name="averaging-options"
					className="max-w-md mb-8"
					optionClassName="w-1/2"
					options={averagingOptions}
					value={climateVariable?.getAveragingType() ?? undefined}
					onValueChange={setAveragingType}
				/>
			}
		</StepContainer>
	);
});

StepAdditionalDetails.displayName = 'StepAdditionalDetails';

export default StepAdditionalDetails;
