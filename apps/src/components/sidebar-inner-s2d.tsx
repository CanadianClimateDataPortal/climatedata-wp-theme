import { __ } from '@/context/locale-provider';

import Dropdown from '@/components/ui/dropdown';
import TooltipWidget from '@/components/ui/tooltip-widget';

import { SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';

import { useClimateVariable } from '@/hooks/use-climate-variable';
import {
	ForecastDisplay,
	ForecastDisplays,
	ForecastType,
	ForecastTypes,
	FrequencyType,
} from '@/types/climate-variable-interface';
import { TimePeriodsControlS2D } from '@/components/sidebar-menu-items/time-periods-control-s2d';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectLowSkillVisibility,
	setLowSkillVisibility,
} from '@/features/map/map-slice';

import {
	fieldForecastDisplay,
	fieldForecastTypes,
	fieldFrequencies,
	SelectAnOptionLabel,
} from '@/lib/s2d-variable-fields';

const SidebarInnerS2D = () => {
	const {
		climateVariable,
		setForecastType,
		setForecastDisplay,
		setFrequency,
	} = useClimateVariable();

	const dispatch = useAppDispatch();
	const isLowSkillMasked = ! useAppSelector(selectLowSkillVisibility());
	const forecastType =
		climateVariable?.getForecastType() ?? ForecastTypes.EXPECTED;
	const forecastDisplay =
		climateVariable?.getForecastDisplay() ?? ForecastDisplays.FORECAST;
	const frequency = climateVariable?.getFrequency() ?? FrequencyType.MONTHLY;

	const handleLowSkillHideChange = (checked: boolean) => {
		const isVisible = !checked; // "checked" means "hide low skill"
		dispatch(setLowSkillVisibility({ visible: isVisible }));
	};

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
							onCheckedChange={handleLowSkillHideChange}
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
				<TimePeriodsControlS2D
					tooltip={tooltipTimePeriods}
				/>
			</SidebarMenuItem>
		</>
	);
};

SidebarInnerS2D.displayName = 'SidebarInnerS2D';

export default SidebarInnerS2D;
