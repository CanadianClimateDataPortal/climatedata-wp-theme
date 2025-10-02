import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import TooltipWidget from '@/components/ui/tooltip-widget';
import { SidebarMenuItem } from '@/components/ui/sidebar';

import {
	TimePeriodsControlSingle,
} from '@/components/sidebar-menu-items/time-periods-control-single';
import {
	SidebarSeparator,
} from '@/components/ui/sidebar';
import {
	Checkbox,
} from '@/components/ui/checkbox';

import {
	createFieldOptionsValueLabel,
	seasonalDecadalActions,
	type S2DParamForecastDisplay,
	type S2DParamForecastType,
	type S2DParamFreq,
} from '@/store/seasonal-decadal-slice';

const {
	setForecastDisplay,
	setForecastType,
	setFreq,
} = seasonalDecadalActions

export default function SidebarInnerSeasonalDecadal() {

	const placeholder = __('Select an option');

	const TooltipToCreate = () => <span>{__('TODO')}</span>;

	const fieldOptions = createFieldOptionsValueLabel()

	const fieldForecastTypes = {
		key: 'forecast_types',
		label: __(
			'Forecast Types'
		) /* ^^^^^ But memories of other projects tells me that this might not be good thing to do here to __() like that */,
		options: fieldOptions.forecastType,
		onChange: (input: S2DParamForecastType): void => {
			setForecastType(input)
		},
	};

	const fieldForecastDisplay = {
		key: 'forecast_display',
		label: __('Forecast Display'),
		options: fieldOptions.forecastDisplay,
		onChange: (input: S2DParamForecastDisplay): void => {
			setForecastDisplay(input)
		},
	};

	const fieldFrequencies = {
		key: 'frequencies',
		label: __('Frequencies'),
		options: fieldOptions.freq,
		onChange: (input: S2DParamFreq): void => {
			setFreq(input)
		},
	};

	return (
		<>
			<SidebarMenuItem>
				<Dropdown
					key={fieldForecastTypes.key}
					placeholder={placeholder}
					options={fieldForecastTypes.options}
					label={fieldForecastTypes.label}
					value={fieldForecastTypes.options[0].value}
					tooltip={<TooltipToCreate />}
					onChange={fieldForecastTypes.onChange}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem>
				<div className="flex flex-col gap-4">
					<Dropdown
						key={fieldForecastDisplay.key}
						placeholder={placeholder}
						options={fieldForecastDisplay.options}
						label={fieldForecastDisplay.label}
						value={fieldForecastDisplay.options[0].value}
						tooltip={<TooltipToCreate />}
						onChange={fieldForecastDisplay.onChange}
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
						<TooltipWidget tooltip={<TooltipToCreate />} />
					</div>
				</div>
			</SidebarMenuItem>

			<SidebarSeparator />

			<SidebarMenuItem>
				<Dropdown
					key={fieldFrequencies.key}
					placeholder={placeholder}
					options={fieldFrequencies.options}
					label={fieldFrequencies.label}
					value={fieldFrequencies.options[0].value}
					tooltip={<TooltipToCreate />}
					onChange={fieldFrequencies.onChange}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlSingle />
			</SidebarMenuItem>
		</>
	);
}

