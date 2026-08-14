import React, { useState, useEffect } from "react";
import { __ } from '@/context/locale-provider';
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
	DownloadType,
	FrequencyConfig,
	FrequencyType,
} from "@/types/climate-variable-interface";
import { ControlTitle } from "@/components/ui/control-title";
import { cn, getFrequencyName, isFrequencyEnabled } from '@/lib/utils';

interface FrequencySelectProps {
	config: FrequencyConfig;
	section: 'map' | 'download';
	title: string;
	value: string | undefined;
	placeholder?: string;
	tooltip?: React.ReactNode;
	onValueChange: (value: string) => void;
	className?: string | undefined;
	downloadType?: DownloadType;
}

const FrequencySelect = ({
	config,
	section,
	title,
	value,
	placeholder,
	tooltip,
	onValueChange,
	className,
	downloadType,
}: FrequencySelectProps) => {

	const hasAnnual = isFrequencyEnabled(config, section, FrequencyType.ANNUAL);
	const hasAnnualJulJun = isFrequencyEnabled(config, section, FrequencyType.ANNUAL_JUL_JUN);
	const hasMonths = isFrequencyEnabled(config, section, FrequencyType.MONTHLY)
	const hasAllMonths = isFrequencyEnabled(config, section, FrequencyType.ALL_MONTHS);
	const hasSeasons = isFrequencyEnabled(config, section, FrequencyType.SEASONAL);
	const hasDaily = isFrequencyEnabled(config, section, FrequencyType.DAILY);
	const hasOptions = hasAnnual || hasAnnualJulJun || hasMonths || hasAllMonths || hasSeasons || hasDaily;

	const [selectValue, setSelectValue] = useState<string | undefined>(value);

	useEffect(() => {
		if (value !== undefined) {
			setSelectValue(value);
		} else {
			if (hasAnnual) {
				setSelectValue(FrequencyType.ANNUAL);
			} else if (hasAnnualJulJun) {
				setSelectValue(FrequencyType.ANNUAL_JUL_JUN);
			} else if (hasDaily) {
				setSelectValue(FrequencyType.DAILY);
			} else if (hasAllMonths) {
				setSelectValue(FrequencyType.ALL_MONTHS);
			} else if (hasMonths) {
				setSelectValue("jan");
			} else if (hasSeasons) {
				setSelectValue("spring");
			}

			// If no value is set, default to the first available frequency
			if(selectValue !== undefined) {
				onValueChange(selectValue);
			}
		}
	}, [selectValue, value, onValueChange, hasMonths, hasAllMonths, hasSeasons, hasDaily, hasAnnual, hasAnnualJulJun]);

	const months = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec',
	].map(monthCode => ({ label: getFrequencyName(monthCode), value: monthCode }));

	const seasons = [
		'spring',
		'summer',
		'fall',
		'winter',
	].map(seasonCode => ({ label: getFrequencyName(seasonCode), value: seasonCode }));

	const renderMonthlyOptions = () => {
		if (!hasMonths && !hasAllMonths) {
			return null;
		}

		if (downloadType === DownloadType.ANALYZED) {
			return (
				<SelectItem value={FrequencyType.MONTHLY}>
					{__('Monthly')}
				</SelectItem>
			);
		} else {
			return (
				<SelectGroup>
					<SelectLabel className={'pl-2'}>{__('Monthly')}</SelectLabel>
					{hasAllMonths && (
						<SelectItem value={FrequencyType.ALL_MONTHS} className={'pl-4'}>
							{__('All months')}
						</SelectItem>
					)}
					{months.map((option) => (
						<SelectItem key={option.value} value={option.value} className={'pl-4'}>
							{option.label}
						</SelectItem>
					))}
				</SelectGroup>
			);
		}
	}

	const renderSeasonalOptions = () => {
		if (!hasSeasons) {
			return null;
		}

		if (downloadType === DownloadType.ANALYZED) {
			return (
				<SelectItem value={FrequencyType.SEASONAL}>
					{__('Seasonal')}
				</SelectItem>
			);
		} else {
			return (
				<SelectGroup>
					<SelectLabel className={'pl-2'}>{__('Seasonal')}</SelectLabel>
					{seasons.map((option) => (
						<SelectItem key={option.value} value={option.value} className={'pl-4'}>
							{option.label}
						</SelectItem>
					))}
				</SelectGroup>
			);
		}
	}

	const FrequencyOptions = () => {
		// The "Annual" label becomes "Annual (January to December) if we also have the "Annual (July to June)" option
		const annualLabel = hasAnnualJulJun ? 'Annual (January to December)' : 'Annual';
		
		return (
			<SelectContent>
				{hasAnnual && <SelectItem value={FrequencyType.ANNUAL}>
					{__(annualLabel)}
				</SelectItem>}
				{hasAnnualJulJun && <SelectItem value={FrequencyType.ANNUAL_JUL_JUN}>
					{__('Annual (July to June)')}
				</SelectItem>}
				{hasDaily && <SelectItem value={FrequencyType.DAILY}>
					{__('Daily')}
				</SelectItem>}
				{renderMonthlyOptions()}
				{renderSeasonalOptions()}
			</SelectContent>
		);
	}

	if (!hasOptions) {
		return;
	} else {
		return (
			<div className={cn('dropdown z-50', className)}>
				<ControlTitle title={__(title)} tooltip={tooltip}/>
				<Select value={selectValue} onValueChange={onValueChange}>
					<SelectTrigger
						className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100">
						<SelectValue placeholder={placeholder && __(placeholder)}/>
						<FrequencyOptions/>
					</SelectTrigger>
				</Select>
			</div>
		);
	}
}

export {
	FrequencySelect
}
