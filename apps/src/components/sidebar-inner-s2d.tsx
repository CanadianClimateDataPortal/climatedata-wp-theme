import { type ReactNode } from 'react';
import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import TooltipWidget from '@/components/ui/tooltip-widget';

import { SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';

import { formatUTCDate } from '@/lib/utils';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { ForecastDisplay, ForecastType, FrequencyType } from '@/types/climate-variable-interface';
import { TimePeriodsControlS2D } from '@/components/sidebar-menu-items/time-periods-control-s2d';

export interface ReleaseDateProps {
	date?: Date | null;
	tooltip?: ReactNode;
	locale: string;
}

const tooltipForecastTypes = __(
	'S2D forecasts are shown as probabilities for how conditions will compare to historical climate conditions between 1991 and 2020. ' +
		'“Expected conditions” show whether conditions are expected to be above, near or below normal. ' +
		'“Unusual conditions” show whether conditions are expected to be unusually high or low. ' +
		'Select a forecast type from the options in the dropdown menu.'
);

const tooltipForecastDisplay = __(
	'S2D forecasts provide information on how future conditions may compare to historical conditions between 1991 and 2020. ' +
		'Use the dropdown menu to view the forecast or the historical climatology for 1991 to 2020.'
);

const tooltipForecastDisplayLowSkill = __(
	'Forecasts at locations with no or low skill should be used with caution, or the climatology should be consulted instead. ' +
		'Click the box to apply cross-hatching over locations with no skill or low skill.'
);

const tooltipFrequencies = __(
	'Forecasts are available for different frequencies, from a month to 5 years. ' +
		'The available time periods will change based on the frequency selected. ' +
		'Select a temporal frequency from the options in the dropdown menu. ' +
		'Note: Only the first three months are available individually, as skill tends to be low for later months.'
);

const tooltipTimePeriods = __(
	'The available time periods will change if a different frequency is selected. ' +
		'Move the slider to select the forecast for your time period of interest.'
);

const tooltipReleaseDate = __(
	'The forecast was released on this date. ' +
		'Monthly and seasonal forecasts are updated each month and decadal forecasts ' +
		'are updated annually. ' +
		'Skill tends to be higher for time periods closer to the release date.'
);

const SelectAnOptionLabel = __('Select an option');

const fieldForecastTypes = {
	key: 'forecast_types',
	label: __('Forecast Types'),
	options: [
		{ value: ForecastType.EXPECTED, label: __('Expected Conditions') },
		{ value: ForecastType.UNUSUAL, label: __('Unusual Conditions') },
	],
};

const fieldForecastDisplay = {
	key: 'forecast_display',
	label: __('Forecast Display'),
	options: [
		{ value: ForecastDisplay.FORECAST, label: __('Forecast') },
		{ value: ForecastDisplay.CLIMATOLOGY, label: __('Climatology') },
	],
};

const fieldFrequencies = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{ value: FrequencyType.MONTHLY, label: __('Monthly') },
		{ value: FrequencyType.SEASONAL, label: __('Seasonal (3 months)') },
	],
};

export const SidebarInnerS2D = () => {
	const {
		climateVariable,
		setForecastType,
		setForecastDisplay,
		setIsLowSkillMasked,
		setFrequency,
	} = useClimateVariable();

	const isLowSkillMasked = climateVariable?.isLowSkillMasked() ?? false;
	const forecastType =
		climateVariable?.getForecastType() ?? ForecastType.EXPECTED;
	const forecastDisplay =
		climateVariable?.getForecastDisplay() ?? ForecastDisplay.FORECAST;
	const frequency = climateVariable?.getFrequency() ?? FrequencyType.MONTHLY;

	return (
		<>
			<SidebarMenuItem>
				<Dropdown<ForecastType>
					key={fieldForecastTypes.key}
					placeholder={SelectAnOptionLabel}
					options={fieldForecastTypes.options}
					label={fieldForecastTypes.label}
					value={forecastType}
					tooltip={tooltipForecastTypes}
					onChange={setForecastType}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem>
				<div className="flex flex-col gap-4">
					<Dropdown<ForecastDisplay>
						key={fieldForecastDisplay.key}
						placeholder={SelectAnOptionLabel}
						options={fieldForecastDisplay.options}
						label={fieldForecastDisplay.label}
						value={forecastDisplay}
						tooltip={tooltipForecastDisplay}
						onChange={setForecastDisplay}
					/>
					<div className="flex items-center space-x-2">
						<Checkbox
							id={fieldForecastDisplay.key + '_compare'}
							className="text-brand-red"
							checked={isLowSkillMasked}
							onCheckedChange={setIsLowSkillMasked}
						/>
						<label
							htmlFor={fieldForecastDisplay.key + '_compare'}
							className="text-sm font-medium leading-none cursor-pointer"
						>
							{__('Mask Low Skill')}
						</label>
						<TooltipWidget
							tooltip={tooltipForecastDisplayLowSkill}
						/>
					</div>
				</div>
			</SidebarMenuItem>

			<SidebarSeparator />

			<SidebarMenuItem>
				<Dropdown<string>
					key={fieldFrequencies.key}
					placeholder={SelectAnOptionLabel}
					options={fieldFrequencies.options}
					label={fieldFrequencies.label}
					value={frequency}
					tooltip={tooltipFrequencies}
					onChange={setFrequency}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlS2D tooltip={tooltipTimePeriods} />
			</SidebarMenuItem>
		</>
	);
};

SidebarInnerS2D.displayName = 'SidebarInnerS2D'

/**
 * Component displaying the release date for the sidebar.
 *
 * Shows a loading message if the release date is not yet available.
 *
 * @param locale - Locale to use for formatting the date.
 * @param releaseDate - Release date to display.
 */
export const SidebarFooterReleaseDate = ({
	date,
	tooltip,
	locale = 'en',
}: ReleaseDateProps) => {

	let releaseDateElement = (
		<span className="font-medium text-gray-400">{__('Loading...')}</span>
	);

	if (date) {
		const formattedDate = date.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC',
		});

		releaseDateElement = (
			<time
				dateTime={formatUTCDate(date, 'yyyy-MM-dd')}
			>
				{formattedDate}
			</time>
		);
	}

	return (
		<div className="flex flex-row flex-nowrap gap-1 my-2 text-xs font-semibold tracking-wider uppercase text-dark-purple">
			<span>
				{__('Release date:')}&nbsp;
				{releaseDateElement}
			</span>
			<TooltipWidget
				tooltip={tooltip ?? tooltipReleaseDate}
			/>
		</div>
	);
};

SidebarFooterReleaseDate.displayName = 'SidebarFooterReleaseDate';
