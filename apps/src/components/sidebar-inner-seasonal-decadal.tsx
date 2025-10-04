import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import TooltipWidget from '@/components/ui/tooltip-widget';
import { Checkbox } from '@/components/ui/checkbox';
import { SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	ForecastDisplay,
	ForecastType,
	FrequencyType,
} from '@/types/climate-variable-interface';
import { TimePeriodsControlS2D } from '@/components/sidebar-menu-items/time-periods-control-s2d';

export default function SidebarInnerSeasonalDecadal() {
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

	const placeholder = __('Select an option');

	const TooltipToCreate = () => <span>{__('TODO')}</span>;

	const fieldForecastTypes = {
		key: 'forecast_types',
		label: __(
			'Forecast Types'
		) /* ^^^^^ But memories of other projects tells me that this might not be good thing to do here to __() like that */,
		options: [
			{ value: ForecastType.EXPECTED, label: __('Expected Conditions') },
			{ value: ForecastType.UNUSUAL, label: __('Unusual Conditions') },
		],
		value: forecastType,
	};

	const fieldForecastDisplay = {
		key: 'forecast_display',
		label: __('Forecast Display'),
		options: [
			{ value: ForecastDisplay.FORECAST, label: __('Forecast') },
			{ value: ForecastDisplay.CLIMATOLOGY, label: __('Climatology') },
		],
		value: forecastDisplay,
	};

	const fieldFrequencies = {
		key: 'frequencies',
		label: __('Frequencies'),
		options: [
			{ value: FrequencyType.MONTHLY, label: __('Monthly') },
			{ value: FrequencyType.SEASONAL, label: __('Seasonal (3 months)') },
		],
		value: frequency,
	};

	return (
		<>
			<SidebarMenuItem>
				<Dropdown<ForecastType>
					key={fieldForecastTypes.key}
					placeholder={placeholder}
					options={fieldForecastTypes.options}
					label={fieldForecastTypes.label}
					value={fieldForecastTypes.value}
					tooltip={<TooltipToCreate />}
					onChange={setForecastType}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem>
				<div className="flex flex-col gap-4">
					<Dropdown<ForecastDisplay>
						key={fieldForecastDisplay.key}
						placeholder={placeholder}
						options={fieldForecastDisplay.options}
						label={fieldForecastDisplay.label}
						value={fieldForecastDisplay.value}
						tooltip={<TooltipToCreate />}
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
						<TooltipWidget tooltip={<TooltipToCreate />} />
					</div>
				</div>
			</SidebarMenuItem>

			<SidebarSeparator />

			<SidebarMenuItem>
				<Dropdown<string>
					key={fieldFrequencies.key}
					placeholder={placeholder}
					options={fieldFrequencies.options}
					label={fieldFrequencies.label}
					value={fieldFrequencies.value}
					tooltip={<TooltipToCreate />}
					onChange={setFrequency}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlS2D />
			</SidebarMenuItem>
		</>
	);
}
