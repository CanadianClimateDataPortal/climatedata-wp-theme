import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import { SidebarSeparator } from '@/components/ui/sidebar';

import { useClimateVariable } from '@/hooks/use-climate-variable';

export default function SidebarInnerSeasonalDecadal() {
	const { climateVariable } = useClimateVariable();

	const varId = climateVariable?.getId();
	console.log('SidebarInnerSeasonalDecadal', { varId, climateVariable });

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
			<Dropdown
				key={fieldForecastTypes.key}
				placeholder={placeholder}
				options={fieldForecastTypes.options}
				label={fieldForecastTypes.label}
				value={fieldForecastTypes.options[0].value}
				tooltip={<TooltipToCreate />}
				onChange={() => void 0}
			/>
			<Dropdown
				key={fieldForecastDisplay.key}
				placeholder={placeholder}
				options={fieldForecastDisplay.options}
				label={fieldForecastDisplay.label}
				value={fieldForecastDisplay.options[0].value}
				tooltip={<TooltipToCreate />}
				onChange={() => void 0}
			/>
			<SidebarSeparator />
			<Dropdown
				key={fieldFrequencies.key}
				placeholder={placeholder}
				options={fieldFrequencies.options}
				label={fieldFrequencies.label}
				value={fieldFrequencies.options[0].value}
				tooltip={<TooltipToCreate />}
				onChange={() => void 0}
			/>
		</>
	);
}
