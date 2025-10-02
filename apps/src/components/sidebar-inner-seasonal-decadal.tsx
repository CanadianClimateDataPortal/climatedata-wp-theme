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
	useClimateVariable,
} from '@/hooks/use-climate-variable';

export default function SidebarInnerSeasonalDecadal() {
	const { climateVariable } = useClimateVariable();

	const placeholder = __('Select an option');

	const TooltipToCreate = () => <span>{__('TODO')}</span>;

	const fieldForecastTypes = {
		key: 'forecast_types',
		label: __(
			'Forecast Types'
		) /* ^^^^^ But memories of other projects tells me that this might not be good thing to do here to __() like that */,
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
					onChange={() => void 0}
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
					onChange={() => void 0}
				/>
			</SidebarMenuItem>

			<SidebarMenuItem className="mt-4">
				<TimePeriodsControlSingle />
			</SidebarMenuItem>
		</>
	);
}
