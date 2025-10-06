import {
	type ReactNode,
	useMemo,
} from 'react';

import { __ } from '@/context/locale-provider';

import { useLocale } from '@/hooks/use-locale';

import Dropdown from '@/components/ui/dropdown';
import TooltipWidget from '@/components/ui/tooltip-widget';

import { SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarSeparator } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';

import { TimePeriodsControlSingle } from '@/components/sidebar-menu-items/time-periods-control-single';

export interface ReleaseDateProps {
	date?: string;
	tooltip?: ReactNode;
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
		{ value: 'foo', label: __('Expected Conditions') },
		{ value: 'bar', label: __('Unusual Conditions') },
	],
};

const fieldForecastDisplay = {
	key: 'forecast_display',
	label: __('Forecast Display'),
	options: [
		{ value: 'forecast', label: __('Forecast') },
		{ value: 'climatology', label: __('Climatology') },
	],
};

const fieldFrequencies = {
	key: 'frequencies',
	label: __('Frequencies'),
	options: [
		{ value: 'monthly', label: __('Monthly') },
		{ value: 'seasonal', label: __('Seasonal (3 months)') },
		{ value: 'decadal', label: __('Decadal (5 years)') },
	],
};

export const SidebarInnerS2D = () => {
	return (
		<>
			<SidebarMenuItem>
				<Dropdown
					key={fieldForecastTypes.key}
					placeholder={SelectAnOptionLabel}
					options={fieldForecastTypes.options}
					label={fieldForecastTypes.label}
					value={fieldForecastTypes.options[0].value}
					tooltip={tooltipForecastTypes}
					onChange={() => void 0}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem>
				<div className="flex flex-col gap-4">
					<Dropdown
						key={fieldForecastDisplay.key}
						placeholder={SelectAnOptionLabel}
						options={fieldForecastDisplay.options}
						label={fieldForecastDisplay.label}
						value={fieldForecastDisplay.options[0].value}
						tooltip={tooltipForecastDisplay}
						onChange={() => void 0}
					/>
					<div className="flex items-center space-x-2">
						<Checkbox
							id={fieldForecastDisplay.key + '_compare'}
							className="text-brand-red"
							onCheckedChange={() => void 0}
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
				<Dropdown
					key={fieldFrequencies.key}
					placeholder={SelectAnOptionLabel}
					options={fieldFrequencies.options}
					label={fieldFrequencies.label}
					value={fieldFrequencies.options[0].value}
					tooltip={tooltipFrequencies}
					onChange={() => void 0}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlSingle
					tooltip={tooltipTimePeriods}
				 />
			</SidebarMenuItem>
		</>
	);
};

SidebarInnerS2D.displayName = 'SidebarInnerS2D'

export const SidebarFooterReleaseDate = ({
	date = '2025-10-06',
	tooltip,
}: ReleaseDateProps) => {

	const { getDateFormatter } = useLocale();

	const formattedDate = useMemo(() => {
		const formatted = getDateFormatter.format(date, 'PPP');
		return formatted;
	}, [
		date,
		getDateFormatter,
	]);

	return (
		<div className="flex flex-row justify-start gap-2 p-2 my-2 text-xs font-semibold tracking-wider uppercase text-dark-purple">
			<span>{__('Release date:')}&nbsp;</span>
			<time
				className="font-medium"
				dateTime={date}
			>
				{formattedDate}
			</time>
			<TooltipWidget
				tooltip={tooltip ?? tooltipReleaseDate}
			/>
		</div>
	);
};

SidebarFooterReleaseDate.displayName = 'SidebarFooterReleaseDate';
