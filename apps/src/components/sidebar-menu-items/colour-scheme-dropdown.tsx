import React, { useCallback, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils.ts";
import { ControlTitle } from "@/components/ui/control-title";
import { useI18n } from "@wordpress/react-i18n";
import { DEFAULT_COLOUR_SCHEMES } from "@/lib/constants";
import { useAppSelector } from "@/app/hooks";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { CustomColourSchemes } from "@/types/climate-variable-interface";

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
	const { climateVariable } = useClimateVariable();

	const legendColours = useMemo(() => {
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
		});
	}, [legendData]);

	const renderColourOption = useCallback((colors: string[]) => {
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
	}, []);

	/**
	 * Extracts custom colour schemes and returns them in a normalized format.
	 */
	const extractCustomColourSchemes = (colourSchemes: CustomColourSchemes) => {
		return Object.entries(colourSchemes).reduce<Record<string, { colours: string[], type: string }>>((acc, [key, scheme]) => {
			acc[key] = {
				colours: scheme.colours.map(entry => entry.colour),
				type: scheme.type
			};
			return acc;
		}, {});
	}

	const colourOptions = useMemo(() => {
		const customColourSchemes = climateVariable?.getCustomColourSchemes();

		const colourSchemes = customColourSchemes
			? extractCustomColourSchemes(customColourSchemes)
			: DEFAULT_COLOUR_SCHEMES;

		return (
			<SelectContent>
				{(!customColourSchemes && legendColours && legendColours.length > 0) && (
					<SelectItem value={'default'} className="w-full [&>*:first-child]:w-full">
						{renderColourOption(legendColours)}
					</SelectItem>
				)}
				{Object.entries(colourSchemes).map(([key, value]) => (
					<SelectItem key={key} value={key} className="w-full [&>*:first-child]:w-full">
						{renderColourOption(value.colours)}
					</SelectItem>
				))}
			</SelectContent>
		);
	}, [climateVariable, legendColours, renderColourOption]);

	return (
		<div className={cn('dropdown z-50', className)}>
			<ControlTitle title={__(title)} tooltip={tooltip}/>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger
					className="w-full focus:ring-0 focus:ring-offset-0 text-cdc-black [&>svg]:text-brand-blue [&>svg]:opacity-100 [&>*:first-child]:flex-1 gap-2 text-left">
					<SelectValue placeholder={placeholder && __(placeholder)} />
				</SelectTrigger>
				{colourOptions}
			</Select>
		</div>
	);
}

export {
	ColourSchemeDropdown
}
