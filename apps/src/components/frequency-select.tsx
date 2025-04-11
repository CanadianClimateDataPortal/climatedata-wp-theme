import React from "react";
import { useI18n } from "@wordpress/react-i18n";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import {
	FrequencyConfig,
	FrequencyType,
} from "@/types/climate-variable-interface";
import { ControlTitle } from "@/components/ui/control-title";
import { cn, isFrequencyEnabled } from "@/lib/utils";

interface FrequencySelectProps {
	config: FrequencyConfig;
	section: 'map' | 'download';
	title: string;
	value: string | undefined;
	placeholder?: string;
	tooltip?: React.ReactNode;
	onValueChange: (value: string) => void;
	className?: string | undefined;
}

const FrequencySelect = ({
	config,
	section,
	title,
	value,
	placeholder,
	tooltip,
	onValueChange,
	className
}: FrequencySelectProps) => {
	const { __ } = useI18n();

	const hasAnnual = isFrequencyEnabled(config, section, FrequencyType.ANNUAL);
	const hasAnnualJulJun = isFrequencyEnabled(config, section, FrequencyType.ANNUAL_JUL_JUN);
	const hasMonths = isFrequencyEnabled(config, section, FrequencyType.MONTHLY)
	const hasAllMonths = isFrequencyEnabled(config, section, FrequencyType.ALL_MONTHS);
	const hasSeasons = isFrequencyEnabled(config, section, FrequencyType.SEASONAL);
	const hasDaily = isFrequencyEnabled(config, section, FrequencyType.DAILY);

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

	const FrequencyOptions = () => (
		<SelectContent>
			{hasAnnual && <SelectItem value={FrequencyType.ANNUAL}>
				{__('Annual')}
			</SelectItem>}
			{hasAnnualJulJun && <SelectItem value={FrequencyType.ANNUAL_JUL_JUN}>
				{__('Annual (July to June)')}
			</SelectItem>}
			{hasDaily && <SelectItem value={FrequencyType.DAILY}>
				{__('Daily')}
			</SelectItem>}
			{(hasMonths || hasAllMonths) && <SelectGroup>
				<SelectLabel className={'pl-2'}>{__('Monthly')}</SelectLabel>
				{hasAllMonths && <SelectItem value={FrequencyType.ALL_MONTHS} className={'pl-4'}>
					{__('All months')}
				</SelectItem>}
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
		<div className={cn('dropdown z-50', className)}>
			<ControlTitle title={__(title)} tooltip={tooltip}/>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger
					className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100">
					<SelectValue placeholder={placeholder && __(placeholder)}/>
					<FrequencyOptions/>
				</SelectTrigger>
			</Select>
		</div>
	);
}

export {
	FrequencySelect
}
