import React, { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils.ts";
import { ControlTitle } from "@/components/ui/control-title";
import { useI18n } from "@wordpress/react-i18n";
import { DEFAULT_COLOUR_SCHEMES } from "@/lib/constants";
import { useAppSelector } from "@/app/hooks";

interface ColourSchemeDropdownProps {
	title: string;
	value?: string | undefined;
	placeholder?: string;
	tooltip?: React.ReactNode;
	onValueChange: (value: string) => void;
	className?: string | undefined;
}

const ColourSchemeDropdown = ({
	title,
	value,
	placeholder,
	tooltip,
	onValueChange,
	className
}: ColourSchemeDropdownProps) => {
	const { __ } = useI18n();
	const legendData = useAppSelector((state) => state.map.legendData);

	/**
	 * Retrieves the legend colors from the provided legend data.
	 */
	const getLegendColours = useCallback(() => {
		if (!legendData) return;

		if (!legendData?.Legend?.length) return;

		const firstLegend = legendData.Legend[0];
		if (!firstLegend.rules?.length) return;

		const firstRule = firstLegend.rules[0];

		if (!firstRule.symbolizers?.length) return;

		const entries = firstRule.symbolizers[0]?.Raster?.colormap?.entries;

		if (!entries) return;

		return entries.map((entry) => {
			return entry.color;
		})
	}, [legendData]);

	const renderColourOption = (colors: string[]) => {
		return (
			<div className="flex w-full overflow-hidden">
				{colors.map((color) => (
					<div
						key={color}
						className="flex-1 h-full"
						style={{backgroundColor: color}}
					>&nbsp;</div>
				))}
			</div>
		)
	}

	const renderOptions = () => {
		const legendColours = getLegendColours();

		return (
			<SelectContent>
				{(legendColours && legendColours.length > 0) &&
					<SelectItem value={'default'} className="w-full [&>*:first-child]:w-full">
						{renderColourOption(legendColours)}
					</SelectItem>
				}
				{Object.entries(DEFAULT_COLOUR_SCHEMES).map(([key, value]) => (
					<SelectItem key={key} value={key} className="w-full [&>*:first-child]:w-full">
						{renderColourOption(value.colours)}
					</SelectItem>
				))}
			</SelectContent>
		)
	}

	return (
		<div className={cn('dropdown z-50', className)}>
			<ControlTitle title={__(title)} tooltip={tooltip}/>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger
					className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100 [&>*:first-child]:flex-1 gap-2 text-left">
					<SelectValue placeholder={placeholder && __(placeholder)} />
				</SelectTrigger>
				{renderOptions()}
			</Select>
		</div>
	);
}

export {
	ColourSchemeDropdown
}
