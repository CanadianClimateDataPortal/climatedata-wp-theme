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
	S2D_FORECAST_DISPLAY,
	S2D_FORECAST_TYPE,
	S2D_FREQ,
	seasonalDecadalActions,
	S2DParamForecastDisplay,
	S2DParamForecastType,
	S2DParamFreq,
} from '@/store';

const {
	setForecastDisplay,
	setForecastType,
	setFreq,
} = seasonalDecadalActions

export default function SidebarInnerSeasonalDecadal() {

	const placeholder = __('Select an option');

	const TooltipToCreate = () => <span>{__('TODO')}</span>;

	const fieldForecastTypes = {
		key: 'forecast_types',
		label: __(
			'Forecast Types'
		) /* ^^^^^ But memories of other projects tells me that this might not be good thing to do here to __() like that */,
		options: [ ...S2D_FORECAST_TYPE ].map(([value, label]) => ({ value, label })),
		onChange: (input: S2DParamForecastType): void => {
			console.log('fieldForecastTypes.onChange', input)
			setForecastType(input)
		},
	};

	const fieldForecastDisplay = {
		key: 'forecast_display',
		label: __('Forecast Display'),
		options: [ ...S2D_FORECAST_DISPLAY ].map(([value, label]) => ({ value, label })),
		onChange: (input: S2DParamForecastDisplay): void => {
			setForecastDisplay(input)
		},
	};

	const fieldFrequencies = {
		key: 'frequencies',
		label: __('Frequencies'),
		options: [ ...S2D_FREQ ].map(([value, label]) => ({ value, label })),
		onChange: (input: S2DParamFreq): void => {
			console.log('fieldFrequencies.onChange', input)
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

