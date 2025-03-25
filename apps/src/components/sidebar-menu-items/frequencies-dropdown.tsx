/**
 * Threshold values dropdown component.
 *
 * A dropdown component that allows the user to select a threshold value.
 */
import React, { useContext } from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { ControlTitle } from "@/components/ui/control-title";

// other
import { FrequencyConfig, FrequencyDisplayModeOption } from "@/types/climate-variable-interface";
import SectionContext from "@/context/section-provider";
import { useClimateVariable } from "@/hooks/use-climate-variable";

const FrequenciesDropdown: React.FC = () => {
	const { __ } = useI18n();
	const section = useContext(SectionContext);
	const { climateVariable, setFrequency } = useClimateVariable();
	const frequencyConfig = climateVariable?.getFrequencyConfig() ?? {} as FrequencyConfig;

	const hasAnnual = frequencyConfig.annual
		&& (
			frequencyConfig.annual === FrequencyDisplayModeOption.ALWAYS
			|| frequencyConfig.annual === section
		)
	const hasMonths = frequencyConfig.months
		&& (
			frequencyConfig.months === FrequencyDisplayModeOption.ALWAYS
			|| frequencyConfig.months === section
		)
	const hasSeasons = frequencyConfig.seasons
		&& (
			frequencyConfig.seasons === FrequencyDisplayModeOption.ALWAYS
			|| frequencyConfig.seasons === section
		)

	let defaultValue = climateVariable?.getFrequency() ?? undefined;
	if (!defaultValue) {
		if (hasAnnual) {
			defaultValue = 'ann';
		} else if (hasMonths) {
			defaultValue = 'jan';
		} else if (hasSeasons) {
			defaultValue = 'spring'
		}
	}

	const months = [
		{ label: __('January'), value: 'jan' },
		{ label: __('February'), value: 'feb' },
		{ label: __('March'), value: 'mar' },
		{ label: __('April'), value: 'apr' },
		{ label: __('May'), value: 'may' },
		{ label: __('June'), value: 'jun' },
		{ label: __('July'), value: 'jul' },
		{ label: __('August'), value: 'aug' },
		{ label: __('September'), value: 'sep' },
		{ label: __('October'), value: 'oct' },
		{ label: __('November'), value: 'nov' },
		{ label: __('December'), value: 'dec' },
	]

	const seasons = [
		{ label: __('Spring'), value: 'spring' },
		{ label: __('Summer'), value: 'summer' },
		{ label: __('Fall'), value: 'fall' },
		{ label: __('Winter'), value: 'winter' },
	]

	const Tooltip = () => (
		<div className="text-sm text-gray-500">
			{__('Select a frequency.')}
		</div>
	);

	const FrequencyOptions = () => (
		<SelectContent>
			{hasAnnual && <SelectItem key={'ann'} value={'ann'}>
				{__('Annual')}
			</SelectItem>}
			{hasMonths && <SelectGroup>
				<SelectLabel className={'pl-2'}>{__('Monthly')}</SelectLabel>
				{months.map((option) => (
					<SelectItem key={option.value} value={option.value} className={'pl-4'}>
						{option.label}
					</SelectItem>
				))}
			</SelectGroup>}
			{hasSeasons && <SelectGroup>
				<SelectLabel className={'pl-2'}>{__('Seasonal')}</SelectLabel>
				{seasons.map((option) => (
					<SelectItem key={option.value} value={option.value} className={'pl-4'}>
						{option.label}
					</SelectItem>
				))}
			</SelectGroup>}
		</SelectContent>
	)

	return (
		<SidebarMenuItem>
			<div className={'dropdown z-50'}>
				<ControlTitle title={__('Frequencies')} tooltip={<Tooltip />} />
				<Select value={defaultValue} onValueChange={setFrequency}>
					<SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100">
						<SelectValue placeholder={__('Select an option')} />
						<FrequencyOptions />
					</SelectTrigger>
				</Select>
			</div>
		</SidebarMenuItem>
	);
};
FrequenciesDropdown.displayName = 'FrequenciesDropdown';

export { FrequenciesDropdown };
